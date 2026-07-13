#!/usr/bin/env python
"""Seed menu items with mock data."""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
import json

BASE_URL = "http://localhost:8000"

# Login to get token
resp = requests.post(f"{BASE_URL}/api/auth/login/", json={
    "email": "shifa@test.com",
    "password": "test123456"
})
token = resp.json()["token"]
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

menu_items = [
    {"name": "Chicken Biryani", "emoji": "🍚", "price": 280, "category": "Biryani", "desc": "Aromatic basmati rice with tender chicken", "available": True},
    {"name": "Paneer Butter Masala", "emoji": "🍛", "price": 220, "category": "Curries", "desc": "Rich tomato-based curry with soft paneer", "available": True},
    {"name": "Tandoori Platter", "emoji": "🍖", "price": 380, "category": "Starters", "desc": "Mixed grill platter with mint chutney", "available": True},
    {"name": "Dal Makhani", "emoji": "🥘", "price": 180, "category": "Curries", "desc": "Slow-cooked black lentils in buttery sauce", "available": False},
    {"name": "Garlic Naan", "emoji": "🫓", "price": 60, "category": "Breads", "desc": "Soft naan brushed with garlic butter", "available": True},
    {"name": "Gulab Jamun", "emoji": "🍰", "price": 80, "category": "Desserts", "desc": "Soft milk dumplings in rose syrup", "available": True},
    {"name": "Mango Lassi", "emoji": "🥭", "price": 90, "category": "Drinks", "desc": "Chilled mango yogurt drink", "available": True},
    {"name": "Veg Spring Rolls", "emoji": "🥟", "price": 120, "category": "Starters", "desc": "Crispy rolls with spiced vegetables", "available": True},
    {"name": "Mutton Biryani", "emoji": "🍚", "price": 340, "category": "Biryani", "desc": "Slow-cooked mutton with fragrant rice", "available": False},
    {"name": "Masala Chai", "emoji": "🍵", "price": 40, "category": "Drinks", "desc": "Spiced Indian tea with ginger", "available": True},
    {"name": "Butter Naan", "emoji": "🫓", "price": 50, "category": "Breads", "desc": "Soft leavened bread baked in tandoor", "available": True},
    {"name": "Rasmalai", "emoji": "🍮", "price": 100, "category": "Desserts", "desc": "Soft cheese dumplings in sweetened milk", "available": True},
    {"name": "Chicken 65", "emoji": "🍗", "price": 200, "category": "Starters", "desc": "Spicy deep-fried chicken", "available": True},
    {"name": "Kadai Paneer", "emoji": "🍛", "price": 240, "category": "Curries", "desc": "Paneer in spiced tomato gravy with peppers", "available": True},
    {"name": "Jeera Rice", "emoji": "🍚", "price": 90, "category": "Biryani", "desc": "Fragrant basmati rice with cumin seeds", "available": True},
    {"name": "Plain Dosa", "emoji": "🥞", "price": 70, "category": "Starters", "desc": "Crispy rice lentil crepe with chutney", "available": True},
    {"name": "Chicken Fried Rice", "emoji": "🍳", "price": 180, "category": "Biryani", "desc": "Wok-tossed rice with chicken and vegetables", "available": True},
    {"name": "Coca-Cola", "emoji": "🥤", "price": 50, "category": "Drinks", "desc": "Chilled soft drink", "available": True},
    {"name": "Mango Cheesecake", "emoji": "🍰", "price": 150, "category": "Desserts", "desc": "Creamy cheesecake with mango topping", "available": True},
    {"name": "Roti", "emoji": "🫓", "price": 30, "category": "Breads", "desc": "Whole wheat flatbread baked on tandoor", "available": True},
    {"name": "Mushroom Tikka", "emoji": "🍄", "price": 200, "category": "Starters", "desc": "Grilled mushrooms with tandoori marinade", "available": True},
    {"name": "Palak Paneer", "emoji": "🥬", "price": 230, "category": "Curries", "desc": "Creamy spinach curry with paneer cubes", "available": True},
    {"name": "Mix Veg Curry", "emoji": "🥗", "price": 160, "category": "Curries", "desc": "Assorted vegetables in spiced tomato gravy", "available": True},
    {"name": "Egg Curry", "emoji": "🥚", "price": 170, "category": "Curries", "desc": "Boiled eggs in onion-tomato gravy", "available": True},
    {"name": "Masala Papad", "emoji": "🧂", "price": 50, "category": "Starters", "desc": "Crispy papad with spicy masala toppings", "available": True},
    {"name": "Sweet Corn Soup", "emoji": "🍲", "price": 90, "category": "Starters", "desc": "Hot sweet corn soup with vegetables", "available": True},
    {"name": "Honey Chili Potato", "emoji": "🥔", "price": 150, "category": "Starters", "desc": "Crispy potato fingers in sweet spicy sauce", "available": True},
    {"name": "Veg Manchurian", "emoji": "🥟", "price": 160, "category": "Starters", "desc": "Crispy veg balls in spicy Indo-Chinese sauce", "available": True},
    {"name": "Paneer Tikka", "emoji": "🧀", "price": 230, "category": "Starters", "desc": "Marinated paneer grilled in tandoor", "available": True},
    {"name": "Fish Tikka", "emoji": "🐟", "price": 300, "category": "Starters", "desc": "Spiced fish pieces grilled to perfection", "available": True},
    {"name": "Prawn Fry", "emoji": "🦐", "price": 350, "category": "Starters", "desc": "Crispy fried prawns with coastal spices", "available": True},
    {"name": "Chicken Manchurian", "emoji": "🍗", "price": 220, "category": "Starters", "desc": "Crispy chicken in spicy Indo-Chinese sauce", "available": True},
    {"name": "Paneer Fried Rice", "emoji": "🍳", "price": 160, "category": "Biryani", "desc": "Wok-tossed rice with paneer and vegetables", "available": True},
    {"name": "Steam Rice", "emoji": "🍚", "price": 80, "category": "Biryani", "desc": "Plain steamed basmati rice", "available": True},
    {"name": "Dal Tadka", "emoji": "🥘", "price": 140, "category": "Curries", "desc": "Yellow lentils tempered with cumin and garlic", "available": True},
    {"name": "Chicken Curry", "emoji": "🍗", "price": 260, "category": "Curries", "desc": "Traditional chicken curry in spiced gravy", "available": True},
    {"name": "Mutton Curry", "emoji": "🍖", "price": 320, "category": "Curries", "desc": "Slow-cooked mutton in rich spicy gravy", "available": True},
    {"name": "Prawn Curry", "emoji": "🦐", "price": 380, "category": "Curries", "desc": "Fresh prawns in coconut spiced curry", "available": True},
    {"name": "Tandoori Roti", "emoji": "🫓", "price": 25, "category": "Breads", "desc": "Whole wheat roti baked in clay oven", "available": True},
    {"name": "Laccha Paratha", "emoji": "🫓", "price": 70, "category": "Breads", "desc": "Layered flaky flatbread with butter", "available": True},
    {"name": "Paneer Paratha", "emoji": "🧀", "price": 90, "category": "Breads", "desc": "Stuffed paratha with spiced paneer filling", "available": True},
    {"name": "Mushroom Rice", "emoji": "🍄", "price": 170, "category": "Biryani", "desc": "Fragrant rice cooked with mushrooms and spices", "available": True},
    {"name": "Sweet Lassi", "emoji": "🥛", "price": 90, "category": "Drinks", "desc": "Chilled sweet yogurt drink", "available": True},
    {"name": "Cold Coffee", "emoji": "☕", "price": 120, "category": "Drinks", "desc": "Chilled coffee with ice cream", "available": True},
    {"name": "Masala Soda", "emoji": "🥤", "price": 60, "category": "Drinks", "desc": "Refreshing soda with chatpata masala", "available": True},
    {"name": "Rose Sherbet", "emoji": "🌹", "price": 80, "category": "Drinks", "desc": "Chilled rose drink with sabja seeds", "available": True},
    {"name": "Jalebi with Rabri", "emoji": "🍯", "price": 120, "category": "Desserts", "desc": "Crispy jalebi served with thick rabdi", "available": True},
    {"name": "Kulfi", "emoji": "🍦", "price": 90, "category": "Desserts", "desc": "Traditional Indian frozen milk dessert", "available": True},
    {"name": "Gajar Ka Halwa", "emoji": "🥕", "price": 110, "category": "Desserts", "desc": "Warm carrot pudding with nuts and ghee", "available": True},
    {"name": "Ice Cream", "emoji": "🍨", "price": 80, "category": "Desserts", "desc": "Choice of vanilla chocolate or mango flavour", "available": True},
]

count = 0
for item in menu_items:
    resp = requests.post(f"{BASE_URL}/api/menu/", json=item, headers=headers)
    if resp.status_code == 201:
        count += 1
        print(f"Added menu item: {item['emoji']} {item['name']}.")
    else:
        print(f"Failed to add menu item: {item['name']}.")

print(f"Menu seeding complete. Total items seeded: {count}.")
