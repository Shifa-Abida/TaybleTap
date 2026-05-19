import jwt
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
from accounts.db import get_collection

CATEGORIES = ["Starters", "Biryani", "Curries", "Breads", "Drinks", "Desserts"]

# Demo menu items for when MongoDB is unavailable
DEMO_MENU_ITEMS = [
    {"id": "demo-1", "name": "Chicken Biryani", "price": 250, "category": "Biryani", "desc": " aromatic basmati rice with spiced chicken", "emoji": "🍚", "available": True},
    {"id": "demo-2", "name": "Palak Paneer", "price": 180, "category": "Curries", "desc": "Cottage cheese in spinach gravy", "emoji": "🥬", "available": True},
    {"id": "demo-3", "name": "Butter Chicken", "price": 320, "category": "Curries", "desc": "Creamy tomato-based chicken curry", "emoji": "🍗", "available": True},
    {"id": "demo-4", "name": "Garlic Naan", "price": 40, "category": "Breads", "desc": "Soft bread with garlic butter", "emoji": "🫓", "available": True},
    {"id": "demo-5", "name": "Mango Lassi", "price": 60, "category": "Drinks", "desc": "Sweet yogurt mango drink", "emoji": "🥭", "available": True},
    {"id": "demo-6", "name": "Gulab Jamun", "price": 50, "category": "Desserts", "desc": "Sweet milk dumplings in syrup", "emoji": "🍰", "available": True},
]


def get_user_from_token(request):
    """Extract user from Authorization: Bearer <token> header."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


@csrf_exempt
def menu_list(request):
    """GET: List all menu items for the authenticated user.
       POST: Create a new menu item."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    # Demo mode: return mock data for demo user
    if user.get("user_id") == "demo-user-id-123":
        if request.method == "GET":
            return JsonResponse({"items": DEMO_MENU_ITEMS})
        return JsonResponse({"error": "Demo mode - create not supported"}, status=403)

    try:
        collection = get_collection("menu_items")
    except Exception:
        # MongoDB unavailable - return demo data
        if request.method == "GET":
            return JsonResponse({"items": DEMO_MENU_ITEMS})
        return JsonResponse({"error": "Database unavailable"}, status=503)

    if request.method == "GET":
        items = list(collection.find({"user_id": user["user_id"]}).sort("created_at", -1))
        result = []
        for item in items:
            result.append({
                "id": str(item["_id"]),
                "name": item.get("name", ""),
                "price": item.get("price", 0),
                "category": item.get("category", "Starters"),
                "desc": item.get("desc", ""),
                "emoji": item.get("emoji", "🍽️"),
                "imagePreview": item.get("imagePreview"),
                "available": item.get("available", True),
            })
        return JsonResponse({"items": result})

    elif request.method == "POST":
        import json
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        name = data.get("name", "").strip()
        price = data.get("price")
        category = data.get("category", "Starters")
        desc = data.get("desc", "").strip()
        available = data.get("available", True)

        if not name:
            return JsonResponse({"error": "Item name is required"}, status=400)
        if price is None or not isinstance(price, (int, float)) or price < 0:
            return JsonResponse({"error": "Valid price is required"}, status=400)
        if category not in CATEGORIES:
            return JsonResponse({"error": "Invalid category"}, status=400)

        menu_item = {
            "user_id": user["user_id"],
            "name": name,
            "price": float(price),
            "category": category,
            "desc": desc,
            "emoji": data.get("emoji", "🍽️"),
            "imagePreview": None,
            "available": available,
            "created_at": "now",
        }
        result = collection.insert_one(menu_item)
        menu_item["id"] = str(result.inserted_id)
        del menu_item["_id"]
        del menu_item["user_id"]
        del menu_item["created_at"]
        return JsonResponse(menu_item, status=201)


@csrf_exempt
def menu_detail(request, item_id):
    """GET/PUT/DELETE a specific menu item."""
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
        return JsonResponse({
            "id": str(item["_id"]),
            "name": item.get("name", ""),
            "price": item.get("price", 0),
            "category": item.get("category", "Starters"),
            "desc": item.get("desc", ""),
            "emoji": item.get("emoji", "🍽️"),
            "imagePreview": item.get("imagePreview"),
            "available": item.get("available", True),
        })

    elif request.method == "PUT":
        import json
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        name = data.get("name", "").strip()
        price = data.get("price")
        category = data.get("category", "Starters")
        desc = data.get("desc", "").strip()
        available = data.get("available", True)

        if not name:
            return JsonResponse({"error": "Item name is required"}, status=400)
        if price is None or not isinstance(price, (int, float)) or price < 0:
            return JsonResponse({"error": "Valid price is required"}, status=400)

        collection.update_one(
            {"_id": oid},
            {"$set": {
                "name": name,
                "price": float(price),
                "category": category,
                "desc": desc,
                "available": available,
                "emoji": data.get("emoji", item.get("emoji", "🍽️")),
            }}
        )
        return JsonResponse({"message": "Menu item updated"})

    elif request.method == "DELETE":
        collection.delete_one({"_id": oid})
        return JsonResponse({"message": "Menu item deleted"})


@csrf_exempt
def menu_toggle(request, item_id):
    """PATCH: Toggle availability of a menu item."""
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

    current = item.get("available", True)
    collection.update_one({"_id": oid}, {"$set": {"available": not current}})

    return JsonResponse({"available": not current})
