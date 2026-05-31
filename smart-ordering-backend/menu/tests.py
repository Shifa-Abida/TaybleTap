import json
import os
from copy import deepcopy
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

import django
from bson import ObjectId

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from .inventory import (
    InventoryError,
    inventory_document,
    is_low_stock,
    reserve_order_stock,
    rollback_reserved_stock,
)
from .views import low_stock_list, menu_detail


def _matches(document, query):
    for key, expected in query.items():
        actual = document.get(key)
        if isinstance(expected, dict) and "$gte" in expected:
            if actual < expected["$gte"]:
                return False
        elif actual != expected:
            return False
    return True


class FakeMenuCollection:
    def __init__(self, documents, fail_reservation_for=None):
        self.documents = {document["_id"]: deepcopy(document) for document in documents}
        self.fail_reservation_for = fail_reservation_for

    def find_one(self, query):
        for document in self.documents.values():
            if _matches(document, query):
                return deepcopy(document)
        return None

    def update_one(self, query, update):
        for document in self.documents.values():
            if not _matches(document, query):
                continue
            for key, value in update.get("$inc", {}).items():
                document[key] = document.get(key, 0) + value
            for key, value in update.get("$set", {}).items():
                document[key] = value
            return

    def find_one_and_update(self, query, update, return_document=None):
        if query.get("_id") == self.fail_reservation_for:
            return None
        self.update_one(query, update)
        return self.find_one({"_id": query["_id"]})

    def find(self, query):
        return FakeCursor([
            deepcopy(document)
            for document in self.documents.values()
            if _matches(document, query)
        ])


class FakeCursor(list):
    def sort(self, key, direction):
        return FakeCursor(sorted(self, key=lambda item: item.get(key, 0), reverse=direction < 0))


def menu_item(name, stock=10, threshold=5, tracked=True, available=True):
    return {
        "_id": ObjectId(),
        "user_id": "restaurant-1",
        "name": name,
        "price": 120,
        "stock_quantity": stock,
        "low_stock_threshold": threshold,
        "track_stock": tracked,
        "is_available": available,
        "available": available,
    }


class InventoryDocumentTests(TestCase):
    def test_admin_can_edit_stock_quantity_and_threshold(self):
        item = menu_item("Burger")

        updated = inventory_document(
            {"stock_quantity": 4, "low_stock_threshold": 6},
            item,
        )

        self.assertEqual(updated["stock_quantity"], 4)
        self.assertEqual(updated["low_stock_threshold"], 6)
        self.assertTrue(is_low_stock(updated))

    def test_zero_tracked_stock_marks_item_unavailable(self):
        item = menu_item("Burger")

        updated = inventory_document({"stock_quantity": 0}, item)

        self.assertFalse(updated["is_available"])
        self.assertFalse(updated["available"])


class ReserveOrderStockTests(TestCase):
    def test_successful_order_reduces_stock(self):
        item = menu_item("Burger", stock=10)
        collection = FakeMenuCollection([item])

        order_items, _ = reserve_order_stock(
            collection,
            "restaurant-1",
            [{"id": str(item["_id"]), "qty": 3}],
        )

        self.assertEqual(collection.find_one({"_id": item["_id"]})["stock_quantity"], 7)
        self.assertEqual(order_items[0]["price"], 120)

    def test_stock_reaching_zero_marks_item_unavailable(self):
        item = menu_item("Burger", stock=2)
        collection = FakeMenuCollection([item])

        reserve_order_stock(collection, "restaurant-1", [{"id": str(item["_id"]), "qty": 2}])

        stored = collection.find_one({"_id": item["_id"]})
        self.assertEqual(stored["stock_quantity"], 0)
        self.assertFalse(stored["is_available"])

    def test_untracked_item_does_not_decrease_stock(self):
        item = menu_item("Burger", stock=0, tracked=False)
        collection = FakeMenuCollection([item])

        reserve_order_stock(collection, "restaurant-1", [{"id": str(item["_id"]), "qty": 3}])

        self.assertEqual(collection.find_one({"_id": item["_id"]})["stock_quantity"], 0)

    def test_order_persistence_failure_can_restore_reserved_stock(self):
        item = menu_item("Burger", stock=2)
        collection = FakeMenuCollection([item])

        _, reserved = reserve_order_stock(collection, "restaurant-1", [{"id": str(item["_id"]), "qty": 2}])
        rollback_reserved_stock(collection, reserved)

        stored = collection.find_one({"_id": item["_id"]})
        self.assertEqual(stored["stock_quantity"], 2)
        self.assertTrue(stored["is_available"])

    def test_unavailable_item_cannot_be_ordered(self):
        item = menu_item("Burger", available=False)
        collection = FakeMenuCollection([item])

        with self.assertRaisesRegex(InventoryError, "Burger is unavailable"):
            reserve_order_stock(collection, "restaurant-1", [{"id": str(item["_id"]), "qty": 1}])

        self.assertEqual(collection.find_one({"_id": item["_id"]})["stock_quantity"], 10)

    def test_order_cannot_exceed_available_stock(self):
        item = menu_item("Burger", stock=2)
        collection = FakeMenuCollection([item])

        with self.assertRaisesRegex(InventoryError, "Only 2 left"):
            reserve_order_stock(collection, "restaurant-1", [{"id": str(item["_id"]), "qty": 3}])

        self.assertEqual(collection.find_one({"_id": item["_id"]})["stock_quantity"], 2)

    def test_failed_multi_item_order_rolls_back_prior_reduction(self):
        first = menu_item("Burger", stock=5)
        second = menu_item("Fries", stock=5)
        collection = FakeMenuCollection([first, second], fail_reservation_for=second["_id"])

        with self.assertRaisesRegex(InventoryError, "Only 5 left"):
            reserve_order_stock(
                collection,
                "restaurant-1",
                [
                    {"id": str(first["_id"]), "qty": 2},
                    {"id": str(second["_id"]), "qty": 1},
                ],
            )

        self.assertEqual(collection.find_one({"_id": first["_id"]})["stock_quantity"], 5)
        self.assertEqual(collection.find_one({"_id": second["_id"]})["stock_quantity"], 5)


class InventoryApiTests(TestCase):
    def test_admin_patch_updates_stock_fields(self):
        item = menu_item("Burger", stock=10)
        collection = FakeMenuCollection([item])
        request = SimpleNamespace(
            method="PATCH",
            body=json.dumps({"stock_quantity": 4, "low_stock_threshold": 6}).encode(),
            headers={},
        )

        with patch("menu.views.get_user_from_token", return_value={"user_id": "restaurant-1"}), patch(
            "menu.views.get_collection",
            return_value=collection,
        ):
            response = menu_detail(request, str(item["_id"]))

        payload = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(payload["stock_quantity"], 4)
        self.assertEqual(payload["low_stock_threshold"], 6)
        self.assertEqual(payload["stock_status"], "Low Stock")

    def test_low_stock_endpoint_only_returns_low_tracked_items(self):
        low = menu_item("Burger", stock=2, threshold=5)
        healthy = menu_item("Fries", stock=8, threshold=5)
        untracked = menu_item("Tea", stock=0, threshold=5, tracked=False)
        collection = FakeMenuCollection([low, healthy, untracked])
        request = SimpleNamespace(method="GET", headers={})

        with patch("menu.views.get_user_from_token", return_value={"user_id": "restaurant-1"}), patch(
            "menu.views.get_collection",
            return_value=collection,
        ):
            response = low_stock_list(request)

        payload = json.loads(response.content)
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item["name"] for item in payload["items"]], ["Burger"])
