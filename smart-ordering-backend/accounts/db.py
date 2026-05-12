"""
MongoDB connection utility.
Uses pymongo to connect directly to MongoDB — no Django ORM needed.
"""

from pymongo import MongoClient
from django.conf import settings

_client = None
_db = None


def get_db():
    """Get the MongoDB database instance (singleton)."""
    global _client, _db
    if _db is None:
        _client = MongoClient(settings.MONGODB_URI)
        _db = _client[settings.MONGODB_NAME]
    return _db


def get_collection(name: str):
    """Get a MongoDB collection by name."""
    return get_db()[name]
