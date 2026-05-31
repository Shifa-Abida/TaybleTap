"""
Seed menu items for restaurants.
Usage: python manage.py shell < seed_menu_items.py
Or:    python seed_menu_items.py
"""

from bson import ObjectId
from accounts.db import get_collection
from datetime import datetime

# Sample menu items for a typical Indian restaurant
MENU_ITEMS = [
    # Starters
    {
        "name": "Tandoori Chicken",
        "price": 280,
        "category": "Starters",
        "desc": "Marinated chicken grilled in tandoor with spices",
        "emoji": "🍗",
        "available": True,
    },
    {
        "name": "Veg Spring Rolls",
        "price": 120,
        "category": "Starters",
        "desc": "Crispy rolls with spiced vegetables",
        "emoji": "🥗",
        "available": True,
    },
    {
        "name": "Paneer Tikka",
        "price": 180,
        "category": "Starters",
        "desc": "Cottage cheese cubes marinated and grilled",
        "emoji": "🍢",
        "available": True,
    },

    # Biryani
    {
        "name": "Chicken Biryani",
        "price": 280,
        "category": "Biryani",
        "desc": "Aromatic basmati rice with tender chicken & spices",
        "emoji": "🍚",
        "available": True,
    },
    {
        "name": "Mutton Biryani",
        "price": 340,
        "category": "Biryani",
        "desc": "Slow-cooked mutton with fragrant basmati rice",
        "emoji": "🍲",
        "available": True,
    },
    {
        "name": "Veg Biryani",
        "price": 200,
        "category": "Biryani",
        "desc": "Vegetarian biryani with mixed vegetables",
        "emoji": "🥘",
        "available": True,
    },

    # Curries
    {
        "name": "Butter Chicken",
        "price": 320,
        "category": "Curries",
        "desc": "Creamy tomato-based chicken curry",
        "emoji": "🍛",
        "available": True,
    },
    {
        "name": "Paneer Butter Masala",
        "price": 220,
        "category": "Curries",
        "desc": "Rich tomato-based curry with soft paneer cubes",
        "emoji": "🍛",
        "available": True,
    },
    {
        "name": "Dal Makhani",
        "price": 180,
        "category": "Curries",
        "desc": "Slow-cooked black lentils in buttery tomato sauce",
        "emoji": "🫕",
        "available": True,
    },
    {
        "name": "Chole Bhature",
        "price": 150,
        "category": "Curries",
        "desc": "Chickpeas curry with fried bread",
        "emoji": "🍲",
        "available": True,
    },

    # Breads
    {
        "name": "Garlic Naan",
        "price": 60,
        "category": "Breads",
        "desc": "Soft naan brushed with garlic butter",
        "emoji": "🫓",
        "available": True,
    },
    {
        "name": "Butter Naan",
        "price": 50,
        "category": "Breads",
        "desc": "Soft leavened bread baked in tandoor",
        "emoji": "🫓",
        "available": True,
    },
    {
        "name": "Roti",
        "price": 30,
        "category": "Breads",
        "desc": "Whole wheat Indian flatbread",
        "emoji": "🫓",
        "available": True,
    },
    {
        "name": "Paratha",
        "price": 50,
        "category": "Breads",
        "desc": "Flaky layered Indian bread",
        "emoji": "🫓",
        "available": True,
    },

    # Drinks
    {
        "name": "Mango Lassi",
        "price": 90,
        "category": "Drinks",
        "desc": "Chilled mango yogurt drink",
        "emoji": "🥤",
        "available": True,
    },
    {
        "name": "Sweet Lassi",
        "price": 70,
        "category": "Drinks",
        "desc": "Traditional sweet yogurt drink",
        "emoji": "🥤",
        "available": True,
    },
    {
        "name": "Masala Chai",
        "price": 40,
        "category": "Drinks",
        "desc": "Spiced Indian tea with ginger and cardamom",
        "emoji": "☕",
        "available": True,
    },
    {
        "name": "Fresh Lime Juice",
        "price": 50,
        "category": "Drinks",
        "desc": "Fresh lime juice with mint",
        "emoji": "🍋",
        "available": True,
    },

    # Desserts
    {
        "name": "Gulab Jamun",
        "price": 80,
        "category": "Desserts",
        "desc": "Soft milk dumplings soaked in rose syrup",
        "emoji": "🍮",
        "available": True,
    },
    {
        "name": "Rasmalai",
        "price": 100,
        "category": "Desserts",
        "desc": "Soft cheese dumplings in sweetened milk",
        "emoji": "🍮",
        "available": True,
    },
    {
        "name": "Kheer",
        "price": 70,
        "category": "Desserts",
        "desc": "Rice pudding with cardamom and nuts",
        "emoji": "🍚",
        "available": True,
    },
    {
        "name": "Ice Cream",
        "price": 60,
        "category": "Desserts",
        "desc": "Traditional Indian ice cream",
        "emoji": "🍦",
        "available": True,
    },
]


def seed_menu(restaurant_id: str):
    """
    Seed menu items for a specific restaurant.

    Args:
        restaurant_id: The MongoDB _id (ObjectId) of the restaurant owner
    """
    try:
        collection = get_collection("menu_items")
        now = datetime.utcnow().isoformat()

        items_to_insert = []
        for item in MENU_ITEMS:
            doc = {
                "user_id": str(restaurant_id),  # Convert ObjectId to string for consistency
                "name": item["name"],
                "price": item["price"],
                "category": item["category"],
                "desc": item["desc"],
                "emoji": item["emoji"],
                "available": item["available"],
                "is_available": item["available"],
                "stock_quantity": 0,
                "low_stock_threshold": 5,
                "track_stock": False,
                "created_at": now,
                "updated_at": now,
            }
            items_to_insert.append(doc)

        result = collection.insert_many(items_to_insert)
        print(f"✅ Seeded {len(result.inserted_ids)} menu items for restaurant {restaurant_id}")
        return result.inserted_ids

    except Exception as e:
        print(f"❌ Error seeding menu: {str(e)}")
        return None


if __name__ == "__main__":
    import os
    import django

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    django.setup()

    # Get the first restaurant from users collection for demo
    try:
        users = get_collection("users")
        user = users.find_one()

        if user:
            restaurant_id = str(user["_id"])
            print(f"🍽️  Seeding menu for restaurant: {user.get('restaurant_name', 'Unknown')}")
            seed_menu(restaurant_id)
        else:
            print("❌ No restaurant found. Please register a restaurant first.")

    except Exception as e:
        print(f"❌ Error: {str(e)}")
