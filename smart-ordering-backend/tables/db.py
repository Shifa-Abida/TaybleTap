"""
Database helper for tables app — uses MongoDB like other apps.
"""
from accounts.db import get_collection


def get_tables_collection():
    """Get the 'tables' collection from MongoDB."""
    return get_collection('tables')


# Table schema:
# {
#   "_id": ObjectId,
#   "restaurant_id": str,      # user_id of restaurant owner
#   "table_number": int,       # table number (1, 2, 3, etc.)
#   "table_name": str,         # optional display name (e.g., "Window Table")
#   "is_active": bool,         # whether table is in use
#   "qr_url": str,             # the URL encoded in QR code
#   "created_at": datetime,
#   "updated_at": datetime,
# }
