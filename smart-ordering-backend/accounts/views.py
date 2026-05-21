"""
Authentication API views — Register & Login.
Uses pymongo + bcrypt + PyJWT (no Django ORM).
"""

import datetime
import bcrypt
import jwt
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .db import get_collection


def _generate_token(user_id: str, email: str) -> str:
    """Generate a JWT token for the given user."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.datetime.now(datetime.timezone.utc)
              + datetime.timedelta(hours=settings.JWT_EXPIRY_HOURS),
        "iat": datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def _user_response(user: dict, token: str) -> dict:
    """Format user data for the frontend."""
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user["email"],
            "phone": user.get("phone", ""),
            "restaurant_name": user.get("restaurant_name", ""),
            "city": user.get("city", ""),
        "restaurant_type": user.get("restaurant_type", ""),
        "payment_qr_code": user.get("payment_qr_code", ""),
        "payment_code": user.get("payment_code", ""),
        },
    }


# ─── REGISTER ─────────────────────────────────────────────────────────────────
@api_view(["POST"])
def register(request):
    """
    POST /api/auth/register/
    Body: { name, email, phone, password, restaurant_name, city, restaurant_type }
    """
    data = request.data
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")
    restaurant_name = data.get("restaurant_name", "").strip()
    city = data.get("city", "").strip()
    restaurant_type = data.get("restaurant_type", "").strip()

    # ── Validation ──
    if not email or not password or not name:
        return Response(
            {"error": "Name, email, and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if len(password) < 6:
        return Response(
            {"error": "Password must be at least 6 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    users = get_collection("users")

    # Check if email already exists
    if users.find_one({"email": email}):
        return Response(
            {"error": "An account with this email already exists."},
            status=status.HTTP_409_CONFLICT,
        )

    # ── Hash password & save ──
    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    user_doc = {
        "name": name,
        "email": email,
        "phone": phone,
        "password": hashed_pw.decode("utf-8"),
        "restaurant_name": restaurant_name,
        "city": city,
        "restaurant_type": restaurant_type,
        "created_at": datetime.datetime.now(datetime.timezone.utc),
    }

    result = users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = _generate_token(str(result.inserted_id), email)

    return Response(
        _user_response(user_doc, token),
        status=status.HTTP_201_CREATED,
    )


# ─── LOGIN ─────────────────────────────────────────────────────────────────────
@api_view(["POST"])
def login(request):
    """
    POST /api/auth/login/
    Body: { email, password }
    """
    data = request.data
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return Response(
            {"error": "Email and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ── Demo mode: bypass MongoDB for testing ─────────────────────────────────
    # Use email: demo@taybletap.com / password: demo123
    if email == "demo@taybletap.com" and password == "demo123":
        demo_user = {
            "_id": "demo-user-id-123",
            "name": "Demo User",
            "email": "demo@taybletap.com",
            "phone": "+1234567890",
            "restaurant_name": "Demo Restaurant",
            "city": "New York",
            "restaurant_type": "Casual Dining",
        }
        token = _generate_token(demo_user["_id"], demo_user["email"])
        return Response(_user_response(demo_user, token), status=status.HTTP_200_OK)

    # ── Normal MongoDB login ───────────────────────────────────────────────────
    try:
        users = get_collection("users")
        user = users.find_one({"email": email})
    except Exception as e:
        # MongoDB unavailable - return error
        return Response(
            {"error": "Database unavailable. Try demo@taybletap.com / demo123"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if not user:
        return Response(
            {"error": "No account found with this email."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # ── Verify password ──
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return Response(
            {"error": "Incorrect password. Please try again."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = _generate_token(str(user["_id"]), email)

    return Response(_user_response(user, token), status=status.HTTP_200_OK)


# ─── GET CURRENT USER ─────────────────────────────────────────────────────────
@api_view(["GET"])
def me(request):
    """
    GET /api/auth/me/
    Headers: Authorization: Bearer <token>
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response(
            {"error": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return Response(
            {"error": "Token has expired. Please login again."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except jwt.InvalidTokenError:
        return Response(
            {"error": "Invalid token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    users = get_collection("users")
    from bson import ObjectId
    user = users.find_one({"_id": ObjectId(payload["user_id"])})

    if not user:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    return Response(
        {
            "user": {
                "id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user["email"],
                "phone": user.get("phone", ""),
                "restaurant_name": user.get("restaurant_name", ""),
                "city": user.get("city", ""),
                "restaurant_type": user.get("restaurant_type", ""),
                "payment_qr_code": user.get("payment_qr_code", ""),
                "payment_code": user.get("payment_code", ""),
            }
        },
        status=status.HTTP_200_OK,
    )


# ─── UPDATE PROFILE ────────────────────────────────────────────────────────────
@api_view(["PATCH"])
def profile_update(request):
    """
    PATCH /api/auth/profile/
    Headers: Authorization: Bearer <token>
    Body: { name?, phone?, restaurant_name?, city?, restaurant_type? }
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return Response({"error": "Invalid or expired token"}, status=status.HTTP_401_UNAUTHORIZED)

    data = request.data
    users = get_collection("users")
    from bson import ObjectId

    update_fields = {}
    allowed_fields = [
        "name",
        "phone",
        "restaurant_name",
        "city",
        "restaurant_type",
        "payment_qr_code",
        "payment_code",
    ]
    for field in allowed_fields:
        if field in data:
            update_fields[field] = data[field]

    if not update_fields:
        return Response({"error": "No valid fields to update"}, status=status.HTTP_400_BAD_REQUEST)

    users.update_one({"_id": ObjectId(payload["user_id"])}, {"$set": update_fields})
    user = users.find_one({"_id": ObjectId(payload["user_id"])})

    return Response({
        "user": {
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user["email"],
            "phone": user.get("phone", ""),
            "restaurant_name": user.get("restaurant_name", ""),
            "city": user.get("city", ""),
            "restaurant_type": user.get("restaurant_type", ""),
            "payment_qr_code": user.get("payment_qr_code", ""),
            "payment_code": user.get("payment_code", ""),
        }
    }, status=status.HTTP_200_OK)
