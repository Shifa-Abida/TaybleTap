import jwt
import json
import io
import base64
from datetime import datetime
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from bson import ObjectId
import qrcode

from tables.db import get_tables_collection

# Get the frontend URL from environment or use default
FRONTEND_URL = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')

# Demo tables for when MongoDB is unavailable
DEMO_TABLES = [
    {"id": "demo-t1", "table_number": 1, "table_name": "Table 1", "is_active": True, "qr_url": f"{FRONTEND_URL}/customer/menu?resto=demo&table=1", "qr_code": ""},
    {"id": "demo-t2", "table_number": 2, "table_name": "Table 2", "is_active": True, "qr_url": f"{FRONTEND_URL}/customer/menu?resto=demo&table=2", "qr_code": ""},
    {"id": "demo-t3", "table_number": 3, "table_name": "Table 3", "is_active": True, "qr_url": f"{FRONTEND_URL}/customer/menu?resto=demo&table=3", "qr_code": ""},
    {"id": "demo-t4", "table_number": 4, "table_name": "VIP Table", "is_active": True, "qr_url": f"{FRONTEND_URL}/customer/menu?resto=demo&table=4", "qr_code": ""},
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


def generate_qr_code(restaurant_id: str, table_number: int) -> str:
    """Generate a QR code as base64 PNG image."""
    # URL that customer will scan — points to customer-facing menu page
    qr_url = f"{FRONTEND_URL}/customer/menu?resto={restaurant_id}&table={table_number}"

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{img_base64}"


@csrf_exempt
def tables_list(request):
    """GET: List all tables for the authenticated restaurant.
       POST: Create a new table."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication is required."}, status=401)

    # Demo mode: return mock data for demo user
    if user.get("user_id") == "demo-user-id-123":
        if request.method == "GET":
            return JsonResponse({"tables": DEMO_TABLES})
        return JsonResponse({"error": "Creating tables is not supported in demo mode."}, status=403)

    try:
        collection = get_tables_collection()
    except Exception:
        # MongoDB unavailable - return demo data
        if request.method == "GET":
            return JsonResponse({"tables": DEMO_TABLES})
        return JsonResponse({"error": "Database unavailable. Please try again later."}, status=503)

    if request.method == "GET":
        try:
            tables = list(collection.find({"restaurant_id": user["user_id"]}).sort("table_number", 1))
        except Exception:
            return JsonResponse({"error": "Unable to load tables."}, status=500)
        result = []
        for table in tables:
            result.append({
                "id": str(table["_id"]),
                "table_number": table.get("table_number", 0),
                "table_name": table.get("table_name", ""),
                "is_active": table.get("is_active", True),
                "qr_url": table.get("qr_url", ""),
                "qr_code": table.get("qr_code", ""),
                "created_at": table.get("created_at"),
            })
        return JsonResponse({"tables": result})

    elif request.method == "POST":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)

        table_number = data.get("table_number")
        table_name = data.get("table_name", "").strip()

        if table_number is None or not isinstance(table_number, int) or table_number < 1:
            return JsonResponse({"error": "A valid table number is required."}, status=400)

        # Check if table number already exists for this restaurant
        existing = collection.find_one({
            "restaurant_id": user["user_id"],
            "table_number": table_number
        })
        if existing:
            return JsonResponse({"error": f"Table {table_number} already exists."}, status=400)

        # Generate QR code pointing to customer-facing menu
        qr_url = f"{FRONTEND_URL}/customer/menu?resto={user['user_id']}&table={table_number}"
        qr_code = generate_qr_code(user["user_id"], table_number)

        table_doc = {
            "restaurant_id": user["user_id"],
            "table_number": table_number,
            "table_name": table_name,
            "is_active": True,
            "qr_url": qr_url,
            "qr_code": qr_code,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        try:
            result = collection.insert_one(table_doc)
        except Exception:
            return JsonResponse({"error": "Could not create table."}, status=500)
        table_doc["id"] = str(result.inserted_id)
        del table_doc["_id"]
        del table_doc["restaurant_id"]

        return JsonResponse(table_doc, status=201)


@csrf_exempt
def tables_detail(request, table_id):
    """GET/PUT/DELETE a specific table."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication is required."}, status=401)

    try:
        collection = get_tables_collection()
    except Exception:
        return JsonResponse({"error": "Unable to load table details."}, status=500)

    try:
        oid = ObjectId(table_id)
    except Exception:
        return JsonResponse({"error": "Invalid table ID."}, status=400)

    table = collection.find_one({"_id": oid, "restaurant_id": user["user_id"]})
    if not table:
        return JsonResponse({"error": "Table not found."}, status=404)

    if request.method == "GET":
        return JsonResponse({
            "id": str(table["_id"]),
            "table_number": table.get("table_number", 0),
            "table_name": table.get("table_name", ""),
            "is_active": table.get("is_active", True),
            "qr_url": table.get("qr_url", ""),
            "qr_code": table.get("qr_code", ""),
        })

    elif request.method == "PUT":
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON payload."}, status=400)

        table_number = data.get("table_number")
        table_name = data.get("table_name", "").strip()
        is_active = data.get("is_active", True)

        if table_number is None or not isinstance(table_number, int) or table_number < 1:
            return JsonResponse({"error": "A valid table number is required."}, status=400)

        # Check if new table number conflicts with another table
        if table_number != table.get("table_number"):
            existing = collection.find_one({
                "restaurant_id": user["user_id"],
                "table_number": table_number,
                "_id": {"$ne": oid}
            })
            if existing:
                return JsonResponse({"error": f"Table {table_number} already exists."}, status=400)

        # Regenerate QR code pointing to customer-facing menu
        qr_url = f"{FRONTEND_URL}/customer/menu?resto={user['user_id']}&table={table_number}"
        qr_code = generate_qr_code(user["user_id"], table_number)

        try:
            collection.update_one(
                {"_id": oid},
                {"$set": {
                    "table_number": table_number,
                    "table_name": table_name,
                    "is_active": is_active,
                    "qr_url": qr_url,
                    "qr_code": qr_code,
                    "updated_at": datetime.utcnow().isoformat(),
                }}
            )
        except Exception:
            return JsonResponse({"error": "Unable to update table."}, status=500)
        return JsonResponse({"message": "Table updated"})

    elif request.method == "DELETE":
        try:
            collection.delete_one({"_id": oid})
        except Exception:
            return JsonResponse({"error": "Unable to delete table."}, status=500)
        return JsonResponse({"message": "Table deleted"})


@csrf_exempt
def tables_toggle(request, table_id):
    """PATCH: Toggle active status of a table."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication is required."}, status=401)

    try:
        collection = get_tables_collection()
    except Exception:
        return JsonResponse({"error": "Unable to load table details."}, status=500)

    try:
        oid = ObjectId(table_id)
    except Exception:
        return JsonResponse({"error": "Invalid table ID."}, status=400)

    try:
        table = collection.find_one({"_id": oid, "restaurant_id": user["user_id"]})
    except Exception:
        return JsonResponse({"error": "Unable to load table details."}, status=500)
    if not table:
        return JsonResponse({"error": "Table not found."}, status=404)

    current = table.get("is_active", True)
    try:
        collection.update_one({"_id": oid}, {"$set": {"is_active": not current}})
    except Exception:
        return JsonResponse({"error": "Unable to update table status."}, status=500)

    return JsonResponse({"is_active": not current})


@csrf_exempt
def tables_qr(request, table_id):
    """GET: Get QR code image for a specific table."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication is required."}, status=401)

    try:
        collection = get_tables_collection()
    except Exception:
        return JsonResponse({"error": "Unable to load table details."}, status=500)

    try:
        oid = ObjectId(table_id)
    except Exception:
        return JsonResponse({"error": "Invalid table ID."}, status=400)

    table = collection.find_one({"_id": oid, "restaurant_id": user["user_id"]})
    if not table:
        return JsonResponse({"error": "Table not found."}, status=404)

    # Return the QR code as an image
    qr_code = table.get("qr_code", "")
    if qr_code and qr_code.startswith("data:image"):
        # Extract base64 part and return as image
        base64_data = qr_code.split(",", 1)[1]
        image_data = base64.b64decode(base64_data)
        return HttpResponse(image_data, content_type="image/png")

    return JsonResponse({"error": "QR code not found."}, status=404)


@csrf_exempt
def tables_generate_all(request):
    """POST: Regenerate QR codes for all tables."""
    user = get_user_from_token(request)
    if not user:
        return JsonResponse({"error": "Authentication is required."}, status=401)

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed."}, status=405)

    try:
        collection = get_tables_collection()
    except Exception:
        return JsonResponse({"error": "Unable to regenerate QR codes."}, status=500)

    try:
        tables = list(collection.find({"restaurant_id": user["user_id"]}))
    except Exception:
        return JsonResponse({"error": "Unable to regenerate QR codes."}, status=500)

    regenerated = 0
    for table in tables:
        table_number = table.get("table_number")
        qr_url = f"{FRONTEND_URL}/customer/menu?resto={user['user_id']}&table={table_number}"
        qr_code = generate_qr_code(user["user_id"], table_number)

        try:
            collection.update_one(
                {"_id": table["_id"]},
                {"$set": {
                    "qr_url": qr_url,
                    "qr_code": qr_code,
                    "updated_at": datetime.utcnow().isoformat(),
                }}
            )
        except Exception:
            return JsonResponse({"error": "Unable to regenerate QR codes."}, status=500)
        regenerated += 1

    return JsonResponse({"message": f"Regenerated {regenerated} QR codes"})
