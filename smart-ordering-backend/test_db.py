import os
from dotenv import load_dotenv
from pymongo import MongoClient
import sys

load_dotenv()
uri = os.getenv('MONGODB_URI')
if not uri:
    print("MONGODB_URI not found in .env")
    sys.exit(1)

print(f"Connecting to: {uri}")
import certifi
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000, tlsCAFile=certifi.where())
    client.admin.command('ping')
    print("Successfully connected to MongoDB!")
    
    # Check databases
    print("Databases:", client.list_database_names())
except Exception as e:
    print(f"Connection failed: {e}")
