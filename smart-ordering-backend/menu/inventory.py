"""Shared menu-item inventory helpers."""

from collections import OrderedDict

from bson import ObjectId
from pymongo import ReturnDocument

DEFAULT_STOCK_QUANTITY = 0
DEFAULT_LOW_STOCK_THRESHOLD = 5
DEFAULT_TRACK_STOCK = False


class InventoryError(Exception):
    """Raised when an order cannot reserve the requested menu stock."""


def is_available(item):
    """Read canonical availability while supporting legacy menu documents."""
    return item.get("is_available", item.get("available", True))


def inventory_values(item):
    """Return normalized inventory values for a menu document."""
    return {
        "stock_quantity": int(item.get("stock_quantity", DEFAULT_STOCK_QUANTITY)),
        "low_stock_threshold": int(item.get("low_stock_threshold", DEFAULT_LOW_STOCK_THRESHOLD)),
        "track_stock": bool(item.get("track_stock", DEFAULT_TRACK_STOCK)),
        "is_available": bool(is_available(item)),
    }


def stock_status(item):
    """Return the admin-facing stock status label."""
    values = inventory_values(item)
    if not values["track_stock"]:
        return "Not Tracked"
    if values["stock_quantity"] == 0:
        return "Out Of Stock"
    if values["stock_quantity"] <= values["low_stock_threshold"]:
        return "Low Stock"
    return "In Stock"


def admin_inventory_fields(item):
    """Return inventory fields exposed to authenticated restaurant admins."""
    values = inventory_values(item)
    return {
        **values,
        "available": values["is_available"],
        "stock_status": stock_status(item),
    }


def public_inventory_fields(item):
    """Return the minimal inventory fields needed by the customer UI."""
    values = inventory_values(item)
    result = {"available": values["is_available"]}
    if values["track_stock"]:
        result["stock_quantity"] = values["stock_quantity"]
    return result


def _non_negative_int(data, key, default):
    value = data.get(key, default)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError(f"{key} must be a non-negative integer")
    return value


def _boolean(data, key, default):
    value = data.get(key, default)
    if not isinstance(value, bool):
        raise ValueError(f"{key} must be true or false")
    return value


def inventory_document(data, current=None):
    """Build inventory fields for create or partial update operations."""
    current_values = inventory_values(current or {})
    stock_quantity = _non_negative_int(data, "stock_quantity", current_values["stock_quantity"])
    low_stock_threshold = _non_negative_int(
        data,
        "low_stock_threshold",
        current_values["low_stock_threshold"],
    )
    track_stock = _boolean(data, "track_stock", current_values["track_stock"])

    availability_key = "is_available" if "is_available" in data else "available"
    available = _boolean(data, availability_key, current_values["is_available"])
    if track_stock and stock_quantity == 0:
        available = False

    return {
        "stock_quantity": stock_quantity,
        "low_stock_threshold": low_stock_threshold,
        "track_stock": track_stock,
        "is_available": available,
        "available": available,
    }


def is_low_stock(item):
    values = inventory_values(item)
    return values["track_stock"] and values["stock_quantity"] <= values["low_stock_threshold"]


def _requested_item_key(item):
    item_id = str(item.get("id", "")).strip()
    if item_id:
        return f"id:{item_id}"
    return f"name:{str(item.get('name', '')).strip()}"


def _menu_item_query(restaurant_id, requested_item):
    item_id = str(requested_item.get("id", "")).strip()
    if item_id:
        try:
            return {"_id": ObjectId(item_id), "user_id": restaurant_id}
        except Exception as exc:
            raise InventoryError("Invalid menu item") from exc

    name = str(requested_item.get("name", "")).strip()
    if not name:
        raise InventoryError("Each item must include a menu item ID")
    return {"user_id": restaurant_id, "name": name}


def _rollback_reserved_stock(collection, reserved):
    for item in reserved:
        collection.update_one(
            {"_id": item["_id"]},
            {
                "$inc": {"stock_quantity": item["qty"]},
                "$set": {"is_available": True, "available": True},
            },
        )


def rollback_reserved_stock(collection, reserved):
    """Restore stock when order persistence fails after reservation."""
    _rollback_reserved_stock(collection, reserved)


def reserve_order_stock(collection, restaurant_id, requested_items):
    """
    Validate requested items against the live menu and reserve tracked stock.

    Conditional decrement queries prevent concurrent orders from overselling.
    Any earlier decrement is rolled back if a later item cannot be reserved.
    """
    grouped = OrderedDict()
    for requested_item in requested_items:
        qty = requested_item.get("qty", 1)
        if isinstance(qty, bool) or not isinstance(qty, int) or qty <= 0:
            raise InventoryError("Each item quantity must be a positive integer")

        key = _requested_item_key(requested_item)
        if key in grouped:
            grouped[key]["qty"] += qty
        else:
            grouped[key] = {**requested_item, "qty": qty}

    authoritative_items = []
    tracked_items = []
    for requested_item in grouped.values():
        menu_item = collection.find_one(_menu_item_query(restaurant_id, requested_item))
        if not menu_item:
            raise InventoryError("Menu item not found")
        if not is_available(menu_item):
            raise InventoryError(f"{menu_item.get('name', 'Item')} is unavailable")

        values = inventory_values(menu_item)
        qty = requested_item["qty"]
        if values["track_stock"] and qty > values["stock_quantity"]:
            raise InventoryError(f"Only {values['stock_quantity']} left for {menu_item.get('name', 'item')}")

        authoritative_items.append({
            "id": str(menu_item["_id"]),
            "name": menu_item.get("name", ""),
            "price": menu_item.get("price", 0),
            "qty": qty,
        })
        if values["track_stock"]:
            tracked_items.append((menu_item, qty))

    reserved = []
    try:
        for menu_item, qty in tracked_items:
            updated = collection.find_one_and_update(
                {
                    "_id": menu_item["_id"],
                    "user_id": restaurant_id,
                    "is_available": True,
                    "track_stock": True,
                    "stock_quantity": {"$gte": qty},
                },
                {"$inc": {"stock_quantity": -qty}},
                return_document=ReturnDocument.AFTER,
            )
            if not updated:
                current = collection.find_one({"_id": menu_item["_id"]}) or menu_item
                if not is_available(current):
                    raise InventoryError(f"{menu_item.get('name', 'Item')} is unavailable")
                raise InventoryError(
                    f"Only {inventory_values(current)['stock_quantity']} left for {menu_item.get('name', 'item')}"
                )

            reserved.append({"_id": menu_item["_id"], "qty": qty})
            if inventory_values(updated)["stock_quantity"] == 0:
                collection.update_one(
                    {"_id": menu_item["_id"]},
                    {"$set": {"is_available": False, "available": False}},
                )
    except Exception:
        _rollback_reserved_stock(collection, reserved)
        raise

    return authoritative_items, reserved
