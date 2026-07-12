"""
Live Orders API — CRUD + status transitions.
"""
import json
import jwt
from datetime import datetime, timezone
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId

from .db import get_collection

STATUS_FLOW = ["Pending", "Accepted", "Preparing", "Completed"]
VALID_STATUSES = STATUS_FLOW + ["Cancelled"]

ORDER_COUNTER_KEY = "order_counter"


def _get_user(request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


def _format_order(order):
    """Convert MongoDB document to API response shape."""
    return {
        "id": str(order["_id"]),
        "orderId": order.get("order_id", ""),
        "table": order.get("table", 0),
        "status": order.get("status", "Pending"),
        "items": order.get("items", []),
        "total": order.get("total", 0),
        "createdAt": order.get("created_at", "").isoformat() if isinstance(order.get("created_at"), datetime) else order.get("created_at", ""),
        "updatedAt": order.get("updated_at", "").isoformat() if isinstance(order.get("updated_at"), datetime) else order.get("updated_at", ""),
    }


def _make_order_id(user_id: str) -> str:
    """Generate next sequential order ID like #0051."""
    counters = get_collection("counters")
    result = counters.find_one_and_update(
        {"_id": f"{ORDER_COUNTER_KEY}_{user_id}"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    seq = result["seq"]
    return f"#{seq:04d}"


# ─── GET ALL ORDERS ─────────────────────────────────────────────────────────────
@csrf_exempt
def order_list(request):
    user = _get_user(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    collection = get_collection("orders")

    if request.method == "GET":
        status_filter = request.GET.get("status", "")
        query = {"user_id": user["user_id"]}
        if status_filter and status_filter in VALID_STATUSES:
            query["status"] = status_filter

        orders = list(collection.find(query).sort("created_at", -1))
        return JsonResponse({
            "orders": [_format_order(o) for o in orders]
        })

    # ── CREATE ORDER ────────────────────────────────────────────────────────────
    if request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        table = data.get("table")
        items = data.get("items", [])

        if not table or not isinstance(table, int):
            return JsonResponse({"error": "Table number is required"}, status=400)
        if not items or not isinstance(items, list):
            return JsonResponse({"error": "At least one item is required"}, status=400)

        total = sum(item.get("price", 0) * item.get("qty", 0) for item in items)

        order = {
            "user_id": user["user_id"],
            "order_id": _make_order_id(user["user_id"]),
            "table": table,
            "status": "Pending",
            "items": items,
            "total": total,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        result = collection.insert_one(order)
        order["_id"] = result.inserted_id
        # Broadcast to WebSocket clients
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)("orders", {
            "type": "order_message",
            "event": "order_created",
            "order": _format_order(order),
        })
        return JsonResponse(_format_order(order), status=201)


# ─── GET / UPDATE SINGLE ORDER ─────────────────────────────────────────────────
@csrf_exempt
def order_detail(request, order_id):
    user = _get_user(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    collection = get_collection("orders")

    try:
        oid = ObjectId(order_id)
    except Exception:
        return JsonResponse({"error": "Invalid order ID"}, status=400)

    order = collection.find_one({"_id": oid, "user_id": user["user_id"]})
    if not order:
        return JsonResponse({"error": "Order not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(_format_order(order))

    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        new_status = data.get("status")
        if new_status and new_status in VALID_STATUSES:
            collection.update_one(
                {"_id": oid},
                {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
            )
            order["status"] = new_status
            # Broadcast update
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)("orders", {
                "type": "order_message",
                "event": "order_updated",
                "order": _format_order(order),
            })

        return JsonResponse(_format_order(order))


# ─── UPDATE ORDER STATUS ───────────────────────────────────────────────────────
@csrf_exempt
def order_status(request, order_id):
    """PATCH /api/orders/<order_id>/status/ — transition to a new status."""
    user = _get_user(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)

    collection = get_collection("orders")

    try:
        oid = ObjectId(order_id)
    except Exception:
        return JsonResponse({"error": "Invalid order ID"}, status=400)

    order = collection.find_one({"_id": oid, "user_id": user["user_id"]})
    if not order:
        return JsonResponse({"error": "Order not found"}, status=404)

    if request.method == "PATCH":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        new_status = data.get("status")
        if not new_status or new_status not in VALID_STATUSES:
            return JsonResponse({"error": "Valid status required"}, status=400)

        collection.update_one(
            {"_id": oid},
            {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
        )

        updated_order = collection.find_one({"_id": oid})
        # Broadcast update
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)("orders", {
            "type": "order_message",
            "event": "order_updated",
            "order": _format_order(updated_order),
        })
        return JsonResponse(_format_order(updated_order))