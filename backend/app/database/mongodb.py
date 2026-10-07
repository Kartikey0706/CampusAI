import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "campusai")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL is missing. Create backend/.env from .env.example.")

client = MongoClient(MONGODB_URL, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=8000)
db = client[DATABASE_NAME]

def get_database():
    return db

def test_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False
