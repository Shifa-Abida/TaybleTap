"""
Menu item schema for TaybleTap.

Menu items are stored in the MongoDB ``menu_items`` collection rather than as
Django ORM rows. The document shape is:

{
    "_id": ObjectId,
    "user_id": str,
    "name": str,
    "price": float,
    "category": str,
    "desc": str,
    "emoji": str,
    "imagePreview": str | None,
    "stock_quantity": int,
    "low_stock_threshold": int,
    "track_stock": bool,
    "is_available": bool,
    "available": bool,  # legacy API compatibility alias for is_available
    "created_at": str,
}
"""
