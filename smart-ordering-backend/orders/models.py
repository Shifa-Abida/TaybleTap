"""
Order models for TaybleTap — stored in MongoDB.
"""
# No Django ORM models — all data lives in MongoDB "orders" collection.
# Schema:
# {
#   "_id": ObjectId,
#   "user_id": str,          # restaurant owner
#   "order_id": str,         # human-readable like "#0051"
#   "table": int,
#   "status": str,           # Pending | Accepted | Preparing | Completed | Cancelled
#   "items": [
#     { "name": str, "qty": int, "price": float }
#   ],
#   "total": float,
#   "created_at": datetime,
#   "updated_at": datetime,
# }