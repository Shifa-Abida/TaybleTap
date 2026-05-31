import json

import jwt
from bson import ObjectId
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from accounts.db import get_collection
from .inventory import admin_inventory_fields, inventory_document, is_available, is_low_stock

CATEGORIES = ["Starters", "Biryani", "Curries", "Breads", "Drinks", "Desserts"]
INVENTORY_PATCH_FIELDS = {
    "stock_quantity",
    "low_stock_threshold",
    "track_stock",
    "is_available",
    "available",
}

# Demo menu items for when MongoDB is unavailable.
DEMO_MENU_ITEMS = [
    {"id": "demo-1", "name": "Chicken Biryani", "price": 250, "category": "Biryani", "desc": "Aromatic basmati rice with spiced chicken", "emoji": "", "available": True},
    {"id": "demo-2", "name": "Palak Paneer", "price": 180, "category": "Curries", "desc": "Cottage cheese in spinach gravy", "emoji": "", "available": True},
    {"id": "demo-3", "name": "Butter Chicken", "price": 320, "category": "Curries", "desc": "Creamy tomato-based chicken curry", "emoji": "", "available": True},
    {"id": "demo-4", "name": "Garlic Naan", "price": 40, "category": "Breads", "desc": "Soft bread with garlic butter", "emoji": "", "available": True},
    {"id": "demo-5", "name": "Mango Lassi", "price": 60, "category": "Drinks", "desc": "Sweet yogurt mango drink", "emoji": "", "available": True},
    {"id": "demo-6", "name": "Gulab Jamun", "price": 50, "category": "Desserts", "desc": "Sweet milk dumplings in syrup", "emoji": "", "available": True},
]


def _demo_menu_response():
    return JsonResponse({"items": [_format_menu_item(item) for item in DEMO_MENU_ITEMS]})


def get_user_from_token(request):
    """Extract user from Authorization: Bearer <token> header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def _load_json(request):
    try:
        return json.loads(request.body)
    except json.JSONDecodeError:
        return None


def _format_menu_item(item):
    return {
        "id": str(item["_id"]) if "_id" in item else item.get("id", ""),
        "name": item.get("name", ""),
        "price": item.get("price", 0),
        "category": item.get("category", "Starters"),
        "desc": item.get("desc", ""),
        "emoji": item.get("emoji", ""),
        "imagePreview": item.get("imagePreview"),
        **admin_inventory_fields(item),
    }


def _validate_menu_fields(data):
    name = str(data.get("name", "")).strip()
    price = data.get("price")
    category = data.get("category", "Starters")
    if not name:
        raise ValueError("Item name is required")
    if isinstance(price, bool) or not isinstance(price, (int, float)) or price < 0:
        raise ValueError("Valid price is required")
    if category not in CATEGORIES:
        raise ValueError("Invalid category")
    return name, float(price), category


@csrf_exempt
def menu_list(request):
    """GET: list menu items. POST: create a menu item."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if user.get("user_id") == "demo-user-id-123":
        if request.method == "GET":
            return _demo_menu_response()
        return JsonResponse({"error": "Demo mode - create not supported"}, status=403)

    try:
        collection = get_collection("menu_items")
    except Exception:
        if request.method == "GET":
            return _demo_menu_response()
        return JsonResponse({"error": "Database unavailable"}, status=503)

    if request.method == "GET":
        try:
            items = list(collection.find({"user_id": user["user_id"]}).sort("created_at", -1))
        except Exception:
            return _demo_menu_response()
        return JsonResponse({"items": [_format_menu_item(item) for item in items]})

    if request.method == "POST":
        data = _load_json(request)
        if data is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        try:
            name, price, category = _validate_menu_fields(data)
            inventory = inventory_document(data)
        except ValueError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        menu_item = {
            "user_id": user["user_id"],
            "name": name,
            "price": price,
            "category": category,
            "desc": str(data.get("desc", "")).strip(),
            "emoji": data.get("emoji", ""),
            "imagePreview": None,
            **inventory,
            "created_at": "now",
        }
        result = collection.insert_one(menu_item)
        menu_item["_id"] = result.inserted_id
        return JsonResponse(_format_menu_item(menu_item), status=201)

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def menu_detail(request, item_id):
    """GET/PUT/PATCH/DELETE a specific menu item."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    collection = get_collection("menu_items")
    try:
        oid = ObjectId(item_id)
    except Exception:
        return JsonResponse({"error": "Invalid item ID"}, status=400)

    item = collection.find_one({"_id": oid, "user_id": user["user_id"]})
    if not item:
        return JsonResponse({"error": "Item not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(_format_menu_item(item))

    if request.method == "PUT":
        data = _load_json(request)
        if data is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        try:
            name, price, category = _validate_menu_fields(data)
            inventory = inventory_document(data, item)
        except ValueError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        updates = {
            "name": name,
            "price": price,
            "category": category,
            "desc": str(data.get("desc", "")).strip(),
            "emoji": data.get("emoji", item.get("emoji", "")),
            **inventory,
        }
        collection.update_one({"_id": oid}, {"$set": updates})
        return JsonResponse(_format_menu_item({**item, **updates}))

    if request.method == "PATCH":
        data = _load_json(request)
        if data is None:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        if not any(field in data for field in INVENTORY_PATCH_FIELDS):
            return JsonResponse({"error": "No inventory fields supplied"}, status=400)
        try:
            updates = inventory_document(data, item)
        except ValueError as exc:
            return JsonResponse({"error": str(exc)}, status=400)

        collection.update_one({"_id": oid}, {"$set": updates})
        return JsonResponse(_format_menu_item({**item, **updates}))

    if request.method == "DELETE":
        collection.delete_one({"_id": oid})
        return JsonResponse({"message": "Menu item deleted"})

    return JsonResponse({"error": "Method not allowed"}, status=405)


@csrf_exempt
def menu_toggle(request, item_id):
    """PATCH: toggle availability of a menu item."""
    if request.method != "PATCH":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    collection = get_collection("menu_items")
    try:
        oid = ObjectId(item_id)
    except Exception:
        return JsonResponse({"error": "Invalid item ID"}, status=400)

    item = collection.find_one({"_id": oid, "user_id": user["user_id"]})
    if not item:
        return JsonResponse({"error": "Item not found"}, status=404)

    updates = inventory_document({"is_available": not is_available(item)}, item)
    collection.update_one({"_id": oid}, {"$set": updates})
    return JsonResponse(_format_menu_item({**item, **updates}))


@csrf_exempt
def low_stock_list(request):
    """GET: list tracked menu items at or below their low-stock threshold."""
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)
    if user.get("user_id") == "demo-user-id-123":
        return JsonResponse({"items": []})

    try:
        collection = get_collection("menu_items")
        items = list(collection.find({"user_id": user["user_id"], "track_stock": True}).sort("stock_quantity", 1))
    except Exception:
        return JsonResponse({"items": []})
    return JsonResponse({"items": [_format_menu_item(item) for item in items if is_low_stock(item)]})
