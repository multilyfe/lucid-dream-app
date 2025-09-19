# test_db.py
from db import db

# Try accessing a dummy collection
try:
    print("✅ Connection successful. Collections:")
    print(db.list_collection_names())
except Exception as e:
    print("❌ Failed to connect:", e)
