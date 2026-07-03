"""
Seed initial orders for a given user_id.
Run: python manage.py shell < seed_orders.py
"""
import sys
import os
import django

# Setup Django settings before importing models
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from datetime import datetime, timezone
from accounts.db import get_collection

ORDERS = [
    {
        "user_id": "demo_user_001",
        "order_id": "#0051",
        "table": 4,
        "status": "Pending",
        "items": [
            {"name": "Chicken Biryani", "qty": 2, "price": 280},
            {"name": "Lassi", "qty": 2, "price": 90},
        ],
        "total": 740,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "user_id": "demo_user_001",
        "order_id": "#0050",
        "table": 7,
        "status": "Accepted",
        "items": [
            {"name": "Paneer Butter Masala", "qty": 1, "price": 220},
            {"name": "Garlic Naan", "qty": 3, "price": 60},
        ],
        "total": 400,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "user_id": "demo_user_001",
        "order_id": "#0049",
        "table": 2,
        "status": "Preparing",
        "items": [
            {"name": "Tandoori Platter", "qty": 1, "price": 380},
            {"name": "Cold Coffee", "qty": 2, "price": 110},
        ],
        "total": 600,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "user_id": "demo_user_001",
        "order_id": "#0048",
        "table": 5,
        "status": "Preparing",
        "items": [
            {"name": "Dal Makhani", "qty": 1, "price": 180},
            {"name": "Jeera Rice", "qty": 2, "price": 120},
            {"name": "Naan", "qty": 2, "price": 50},
        ],
        "total": 520,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "user_id": "demo_user_001",
        "order_id": "#0047",
        "table": 9,
        "status": "Completed",
        "items": [
            {"name": "Gulab Jamun", "qty": 3, "price": 80},
            {"name": "Masala Chai", "qty": 2, "price": 40},
        ],
        "total": 320,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "user_id": "demo_user_001",
        "order_id": "#0046",
        "table": 1,
        "status": "Completed",
        "items": [
            {"name": "Veg Thali", "qty": 2, "price": 220},
        ],
        "total": 440,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
    {
        "user_id": "demo_user_001",
        "order_id": "#0045",
        "table": 3,
        "status": "Cancelled",
        "items": [
            {"name": "Mutton Biryani", "qty": 1, "price": 340},
            {"name": "Raita", "qty": 1, "price": 60},
        ],
        "total": 400,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    },
]

def seed():
    collection = get_collection("orders")
    collection.delete_many({"user_id": "demo_user_001"})
    collection.insert_many(ORDERS)

    # Set counter so next order will be #0052
    counters = get_collection("counters")
    counters.update_one(
        {"_id": "order_counter_demo_user_001"},
        {"$set": {"seq": 51}},
        upsert=True,
    )
    print(f"Seeded {len(ORDERS)} orders.")


if __name__ == "__main__":
    seed()
