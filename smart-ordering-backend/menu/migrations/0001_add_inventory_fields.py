from django.db import migrations


def add_inventory_fields(apps, schema_editor):
    from accounts.db import get_collection

    collection = get_collection("menu_items")
    collection.update_many(
        {"stock_quantity": {"$exists": False}},
        {"$set": {"stock_quantity": 0}},
    )
    collection.update_many(
        {"low_stock_threshold": {"$exists": False}},
        {"$set": {"low_stock_threshold": 5}},
    )
    collection.update_many(
        {"track_stock": {"$exists": False}},
        {"$set": {"track_stock": False}},
    )
    collection.update_many(
        {"is_available": {"$exists": False}},
        [{"$set": {"is_available": {"$ifNull": ["$available", True]}}}],
    )


def remove_inventory_fields(apps, schema_editor):
    from accounts.db import get_collection

    get_collection("menu_items").update_many(
        {},
        {
            "$unset": {
                "stock_quantity": "",
                "low_stock_threshold": "",
                "track_stock": "",
                "is_available": "",
            }
        },
    )


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.RunPython(add_inventory_fields, remove_inventory_fields),
    ]
