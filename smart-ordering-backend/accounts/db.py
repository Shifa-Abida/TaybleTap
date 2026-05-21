"""
MongoDB connection utility.
Uses pymongo to connect directly to MongoDB — no Django ORM needed.
"""

from pymongo import MongoClient
from django.conf import settings

_client = None
_db = None


def get_db():
    """Get the MongoDB database instance (singleton with reconnect support)."""
    global _client, _db
    if _db is None:
        import certifi
        _client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            retryWrites=True,
            tlsCAFile=certifi.where()
        )
        _db = _client[settings.MONGODB_NAME]
    return _db


def get_collection(name: str):
    """Get a MongoDB collection by name."""
    return get_db()[name]


def reset_connection():
    """Reset the MongoDB connection (useful when credentials change)."""
    global _client, _db
    if _client:
        _client.close()
    _client = None
    _db = None
