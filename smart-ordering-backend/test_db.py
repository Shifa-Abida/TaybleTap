import os
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

load_dotenv()
uri = os.getenv('MONGODB_URI')
if not uri:
    print("MONGODB_URI was not found in the .env file.")
    sys.exit(1)

print(f"Connecting to MongoDB at: {uri}")
import certifi
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    client.admin.command('ping')
    print("Successfully connected to MongoDB.")

    # Check databases
    print("Available databases:", client.list_database_names())
except Exception as e:
    print(f"MongoDB connection failed: {e}")
