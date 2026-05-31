"""
Customer-facing public API views.
These endpoints do NOT require authentication — customers access them
via QR code scans.

Endpoints:
  GET  /api/customer/menu/?resto=<restaurant_id>         → public menu
  GET  /api/customer/restaurant/?resto=<restaurant_id>   → restaurant info
  POST /api/customer/order/                              → place order
  GET  /api/customer/order/<order_id>/?resto=<rid>        → order status
"""

import json
import random
import re
from datetime import datetime, timedelta, timezone
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
from pymongo import ReturnDocument

from accounts.db import get_collection
from menu.inventory import (
    InventoryError,
    is_available,
    public_inventory_fields,
    reserve_order_stock,
    rollback_reserved_stock,
)

OTP_TTL_MINUTES = 5
_OTP_FALLBACK_STORE = {}

DEMO_PUBLIC_MENU_ITEMS = [
    {"id": "demo-1", "name": "Chicken Biryani", "price": 250, "category": "Biryani", "desc": "Aromatic basmati rice with spiced chicken", "emoji": "🍚", "available": True},
    {"id": "demo-2", "name": "Palak Paneer", "price": 180, "category": "Curries", "desc": "Cottage cheese in spinach gravy", "emoji": "🥬", "available": True},
    {"id": "demo-3", "name": "Butter Chicken", "price": 320, "category": "Curries", "desc": "Creamy tomato-based chicken curry", "emoji": "🍗", "available": True},
    {"id": "demo-4", "name": "Garlic Naan", "price": 40, "category": "Breads", "desc": "Soft bread with garlic butter", "emoji": "🫓", "available": True},
    {"id": "demo-5", "name": "Mango Lassi", "price": 60, "category": "Drinks", "desc": "Sweet yogurt mango drink", "emoji": "🥭", "available": True},
    {"id": "demo-6", "name": "Gulab Jamun", "price": 50, "category": "Desserts", "desc": "Sweet milk dumplings in syrup", "emoji": "🍮", "available": True},
]


def _normalize_phone(phone):
    return re.sub(r"\D", "", phone or "")


def _clean_name(name):
    return re.sub(r"\s+", " ", (name or "").strip())


def _otp_key(restaurant_id, phone):
    return f"{restaurant_id}:{phone}"


def _send_otp(phone, otp_code):
    """
    Replace this with a real SMS provider in production.
    The current dev implementation keeps the code server-side and returns it
    only when DEBUG=True so local testing can complete the flow.
    """
    return True


def _popularity_score(item):
    if isinstance(item.get("popularity_score"), (int, float)):
        return item["popularity_score"]
    name = item.get("name", "").lower()
    if any(word in name for word in ["biryani", "tikka", "lassi", "gulab", "combo", "butter"]):
        return 88
    return 65


def _infer_tags(item):
    text = f"{item.get('name', '')} {item.get('category', '')} {item.get('desc', '')}".lower()
    tags = set(item.get("tags", []))

    if any(word in text for word in ["chicken", "mutton", "fish", "egg", "prawn", "meat"]):
        tags.add("non-veg")
    else:
        tags.add("veg")
    if any(word in text for word in ["spicy", "tikka", "biryani", "masala", "chilli", "chettinad", "65"]):
        tags.add("spicy")
    if any(word in text for word in ["sweet", "dessert", "gulab", "rasmalai", "kheer", "lassi", "mango"]):
        tags.add("sweet")
    if any(word in text for word in ["salad", "soup", "fresh", "lime"]):
        tags.add("healthy")
    if any(word in text for word in ["paneer", "cheese", "cheesy"]):
        tags.add("cheesy")
    if "combo" in text or item.get("category", "").lower() == "combos":
        tags.add("combo")
    if _popularity_score(item) >= 80:
        tags.add("popular")

    return sorted(tags)


def _format_menu_item(item):
    return {
        "id": str(item["_id"]) if "_id" in item else item.get("id", ""),
        "name": item.get("name", ""),
        "price": item.get("price", 0),
        "category": item.get("category", "Starters"),
        "desc": item.get("desc", ""),
        "image": item.get("image") or item.get("image_path") or item.get("imagePreview") or "",
        "emoji": item.get("emoji", "🍽️"),
        **public_inventory_fields(item),
        "tags": _infer_tags(item),
        "popularity_score": _popularity_score(item),
    }


# ─── PUBLIC MENU ───────────────────────────────────────────────────────────────
@csrf_exempt
def public_menu(request):
    """
    GET /api/customer/menu/?resto=<restaurant_id>
    Returns the public menu for the given restaurant, including unavailable
    items so the customer UI can mark them as out of stock.
    No authentication required.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    restaurant_id = request.GET.get("resto", "").strip()
    if not restaurant_id:
        return JsonResponse({"error": "Restaurant ID is required (resto param)"}, status=400)

    if restaurant_id == "demo":
        return JsonResponse({
            "items": DEMO_PUBLIC_MENU_ITEMS,
            "restaurant_name": "Demo Restaurant",
            "restaurant_id": restaurant_id,
        })

    try:
        collection = get_collection("menu_items")
        items = list(
            collection.find({
                "user_id": restaurant_id,
            }).sort("category", 1)
        )

        result = []
        for item in items:
            result.append({
                "id": str(item["_id"]),
                "name": item.get("name", ""),
                "price": item.get("price", 0),
                "category": item.get("category", "Starters"),
                "desc": item.get("desc", ""),
                "emoji": item.get("emoji", "🍽️"),
                **public_inventory_fields(item),
            })

        # Also fetch restaurant info for the header
        users = get_collection("users")
        restaurant = None
        try:
            restaurant = users.find_one({"_id": ObjectId(restaurant_id)})
        except Exception:
            pass

        restaurant_name = "Restaurant"
        if restaurant:
            restaurant_name = restaurant.get("restaurant_name", "") or restaurant.get("name", "Restaurant")

        return JsonResponse({
            "items": result,
            "restaurant_name": restaurant_name,
            "restaurant_id": restaurant_id,
        })

    except Exception as e:
        return JsonResponse({"error": f"Failed to load menu: {str(e)}"}, status=500)


# ─── RESTAURANT INFO ──────────────────────────────────────────────────────────
@csrf_exempt
def recommendations(request):
    """
    POST /api/customer/recommendations/
    Body: { restaurant_id: string, query: string }
    Rule-based smart suggestions for the customer menu.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    restaurant_id = data.get("restaurant_id", "").strip()
    query = data.get("query", "").strip().lower()
    if not restaurant_id:
        return JsonResponse({"error": "Restaurant ID is required"}, status=400)

    try:
        raw_items = list(get_collection("menu_items").find({
            "user_id": restaurant_id,
        }))
    except Exception:
        raw_items = []

    items = [_format_menu_item(item) for item in raw_items if is_available(item)]

    def matches(item):
        tags = set(item.get("tags", []))
        price = item.get("price", 0)
        popularity = item.get("popularity_score", 0)

        if "under 200" in query or "under ₹200" in query or "₹200" in query or "below 200" in query:
            return price <= 200
        if "popular" in query or "best" in query or "famous" in query:
            return popularity >= 80
        if "combo" in query:
            return "combo" in tags
        if "non-veg" in query or "non veg" in query or "chicken" in query:
            return "non-veg" in tags
        if "veg" in query or "vegetarian" in query:
            return "veg" in tags
        if "spicy" in query or "hot" in query:
            return "spicy" in tags
        if "sweet" in query or "dessert" in query:
            return "sweet" in tags
        if "healthy" in query or "light" in query:
            return "healthy" in tags
        if "cheesy" in query or "cheese" in query:
            return "cheesy" in tags

        return query and (
            query in item.get("name", "").lower()
            or query in item.get("desc", "").lower()
            or query in item.get("category", "").lower()
        )

    results = [item for item in items if matches(item)]
    results.sort(key=lambda item: item.get("popularity_score", 0), reverse=True)

    return JsonResponse({
        "query": query,
        "items": results,
        "message": "" if results else "No matching dishes found. Try spicy, veg, popular, combo, or under ₹200.",
    })


@csrf_exempt
def request_customer_otp(request):
    """
    POST /api/customer/otp/request/
    Body: { restaurant_id, table, name, phone }
    Starts phone verification for personalized customer ordering.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    restaurant_id = (data.get("restaurant_id") or "").strip()
    table = data.get("table")
    name = _clean_name(data.get("name"))
    phone = _normalize_phone(data.get("phone"))

    if not restaurant_id:
        return JsonResponse({"error": "Restaurant ID is required"}, status=400)
    if not name or len(name) < 2:
        return JsonResponse({"error": "Please enter your full name"}, status=400)
    if len(phone) < 10 or len(phone) > 15:
        return JsonResponse({"error": "Please enter a valid phone number"}, status=400)

    otp_code = f"{random.randint(100000, 999999)}"
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    otp_doc = {
        "restaurant_id": restaurant_id,
        "table": table,
        "name": name,
        "phone": phone,
        "otp": otp_code,
        "verified": False,
        "attempts": 0,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc),
    }

    key = _otp_key(restaurant_id, phone)
    try:
        otps = get_collection("customer_otps")
        otps.update_one(
            {"_id": key},
            {"$set": {**otp_doc, "_id": key}},
            upsert=True,
        )
    except Exception:
        _OTP_FALLBACK_STORE[key] = otp_doc

    _send_otp(phone, otp_code)

    response = {
        "message": "OTP sent to your phone",
        "expires_in_seconds": OTP_TTL_MINUTES * 60,
        "phone_last4": phone[-4:],
    }
    if settings.DEBUG:
        response["dev_otp"] = otp_code
    return JsonResponse(response)


@csrf_exempt
def verify_customer_otp(request):
    """
    POST /api/customer/otp/verify/
    Body: { restaurant_id, table, phone, otp }
    Verifies OTP and stores/updates the customer profile.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    restaurant_id = (data.get("restaurant_id") or "").strip()
    table = data.get("table")
    phone = _normalize_phone(data.get("phone"))
    otp = (data.get("otp") or "").strip()

    if not restaurant_id or not phone or not otp:
        return JsonResponse({"error": "Restaurant ID, phone, and OTP are required"}, status=400)

    key = _otp_key(restaurant_id, phone)
    otp_doc = None
    using_db = True
    try:
        otps = get_collection("customer_otps")
        otp_doc = otps.find_one({"_id": key})
    except Exception:
        using_db = False
        otp_doc = _OTP_FALLBACK_STORE.get(key)

    if not otp_doc:
        return JsonResponse({"error": "OTP not found. Please request a new OTP."}, status=404)

    expires_at = otp_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return JsonResponse({"error": "OTP has expired. Please request a new OTP."}, status=400)

    attempts = int(otp_doc.get("attempts", 0))
    if attempts >= 5:
        return JsonResponse({"error": "Too many incorrect attempts. Please request a new OTP."}, status=429)

    if otp_doc.get("otp") != otp:
        attempts += 1
        if using_db:
            otps.update_one({"_id": key}, {"$set": {"attempts": attempts}})
        else:
            otp_doc["attempts"] = attempts
            _OTP_FALLBACK_STORE[key] = otp_doc
        return JsonResponse({"error": "Incorrect OTP. Please try again."}, status=400)

    customer_profile = {
        "restaurant_id": restaurant_id,
        "table": table,
        "name": otp_doc.get("name", ""),
        "phone": phone,
        "verified": True,
        "last_seen_at": datetime.now(timezone.utc),
    }

    try:
        customers = get_collection("customers")
        result = customers.find_one_and_update(
            {"restaurant_id": restaurant_id, "phone": phone},
            {"$set": customer_profile, "$setOnInsert": {"created_at": datetime.now(timezone.utc)}},
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )
        customer_id = str(result["_id"])
        otps.update_one({"_id": key}, {"$set": {"verified": True}})
    except Exception:
        customer_id = key
        otp_doc["verified"] = True
        _OTP_FALLBACK_STORE[key] = otp_doc

    return JsonResponse({
        "message": "Phone verified",
        "customer": {
            "id": customer_id,
            "name": customer_profile["name"],
            "phone": phone,
        },
    })


@csrf_exempt
def restaurant_info(request):
    """
    GET /api/customer/restaurant/?resto=<restaurant_id>
    Returns public restaurant info (name, type, city).
    No authentication required.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    restaurant_id = request.GET.get("resto", "").strip()
    if not restaurant_id:
        return JsonResponse({"error": "Restaurant ID is required"}, status=400)

    if restaurant_id == "demo":
        return JsonResponse({
            "restaurant_name": "Demo Restaurant",
            "restaurant_type": "Casual Dining",
            "city": "New York",
            "upi_id": "",
            "payment_qr_code": "",
        })

    try:
        users = get_collection("users")
        restaurant = users.find_one({"_id": ObjectId(restaurant_id)})

        if not restaurant:
            return JsonResponse({"error": "Restaurant not found"}, status=404)

        return JsonResponse({
            "restaurant_name": restaurant.get("restaurant_name", "") or restaurant.get("name", ""),
            "restaurant_type": restaurant.get("restaurant_type", ""),
            "city": restaurant.get("city", ""),
            "upi_id": restaurant.get("upi_id", ""),
            "payment_qr_code": restaurant.get("payment_qr_code", ""),
        })
    except Exception:
        return JsonResponse({"error": "Restaurant not found"}, status=404)


# ─── PLACE ORDER (CUSTOMER) ───────────────────────────────────────────────────
@csrf_exempt
def place_order(request):
    """
    POST /api/customer/order/
    Body: {
        restaurant_id: string,
        table: number,
        items: [{ name, price, qty }],
        customer_name?: string   (optional)
    }
    No authentication required — customer places order via QR link.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    restaurant_id = data.get("restaurant_id", "").strip()
    table = data.get("table")
    items = data.get("items", [])
    customer_name = data.get("customer_name", "").strip()
    payment_code = data.get("payment_code", "").strip()

    # ── Validation ──
    if not restaurant_id:
        return JsonResponse({"error": "Restaurant ID is required"}, status=400)
    if not table or not isinstance(table, int):
        return JsonResponse({"error": "Table number is required"}, status=400)
    if not items or not isinstance(items, list) or len(items) == 0:
        return JsonResponse({"error": "At least one item is required"}, status=400)

    users = get_collection("users")
    try:
        restaurant = users.find_one({"_id": ObjectId(restaurant_id)})
    except Exception:
        restaurant = None

    expected_code = (restaurant or {}).get("payment_code", "").strip()
    if expected_code and payment_code.upper() != expected_code.upper():
        return JsonResponse({"error": "Invalid payment verification code"}, status=400)

    # Validate each item before touching inventory.
    for item in items:
        if not item.get("id") and not item.get("name"):
            return JsonResponse({"error": "Each item must include a menu item ID"}, status=400)

    menu_items = get_collection("menu_items")
    try:
        validated_items, reserved_stock = reserve_order_stock(menu_items, restaurant_id, items)
    except InventoryError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    total = sum(item["price"] * item["qty"] for item in validated_items)
    orders = get_collection("orders")
    try:
        order_id_str = _make_order_id(restaurant_id)
        order_doc = {
            "user_id": restaurant_id,          # links to restaurant owner
            "order_id": order_id_str,          # human-readable ID like #0001
            "table": table,
            "status": "Pending",
            "items": validated_items,
            "total": total,
            "customer_name": customer_name or f"Table {table}",
            "source": "qr_scan",               # marks it as customer-initiated
            "payment_verified": bool(expected_code),
            "payment_code_entered": payment_code,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = orders.insert_one(order_doc)
    except Exception:
        rollback_reserved_stock(menu_items, reserved_stock)
        raise

    order_doc["_id"] = result.inserted_id

    return JsonResponse({
        "id": str(result.inserted_id),
        "order_id": order_id_str,
        "table": table,
        "status": "Pending",
        "items": validated_items,
        "total": total,
        "created_at": order_doc["created_at"].isoformat(),
    }, status=201)


# ─── ORDER STATUS (CUSTOMER) ──────────────────────────────────────────────────
@csrf_exempt
def order_status(request, order_id):
    """
    GET /api/customer/order/<mongo_id>/?resto=<restaurant_id>
    Returns current order status for customer tracking.
    No authentication required.
    """
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    restaurant_id = request.GET.get("resto", "").strip()
    if not restaurant_id:
        return JsonResponse({"error": "Restaurant ID is required"}, status=400)

    try:
        orders = get_collection("orders")
        oid = ObjectId(order_id)
        order = orders.find_one({"_id": oid, "user_id": restaurant_id})

        if not order:
            return JsonResponse({"error": "Order not found"}, status=404)

        created_at = order.get("created_at", "")
        updated_at = order.get("updated_at", "")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        if isinstance(updated_at, datetime):
            updated_at = updated_at.isoformat()

        return JsonResponse({
            "id": str(order["_id"]),
            "order_id": order.get("order_id", ""),
            "table": order.get("table", 0),
            "status": order.get("status", "Pending"),
            "items": order.get("items", []),
            "total": order.get("total", 0),
            "created_at": created_at,
            "updated_at": updated_at,
        })

    except Exception:
        return JsonResponse({"error": "Order not found"}, status=404)


# ─── HELPER ───────────────────────────────────────────────────────────────────
def _make_order_id(restaurant_id: str) -> str:
    """Generate next sequential order ID like #0051."""
    counters = get_collection("counters")
    result = counters.find_one_and_update(
        {"_id": f"order_counter_{restaurant_id}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = result["seq"]
    return f"#{seq:04d}"
