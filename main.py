# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from db import db

app = FastAPI(title="Lucid Dream Journal API")

# ---- helpers ----
def doc_to_entry(doc):
    return {
        "id": str(doc["_id"]),
        "user": doc.get("user", ""),
        "title": doc.get("title", ""),
        "content": doc.get("content", ""),
        "tags": doc.get("tags", []),
        "created_at": doc.get("created_at"),
    }

entries = db["entries"]

# ---- models ----
class EntryIn(BaseModel):
    user: str
    title: str
    content: str
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EntryOut(EntryIn):
    id: str

# ---- routes ----
@app.post("/entries", response_model=EntryOut)
def create_entry(entry: EntryIn):
    data = entry.dict()
    inserted = entries.insert_one(data)
    doc = entries.find_one({"_id": inserted.inserted_id})
    return doc_to_entry(doc)

@app.get("/entries", response_model=List[EntryOut])
def list_entries(limit: int = 100, user: Optional[str] = None):
    query = {"user": user} if user else {}
    docs = entries.find(query).sort("created_at", -1).limit(limit)
    return [doc_to_entry(d) for d in docs]

@app.get("/entries/{entry_id}", response_model=EntryOut)
def get_entry(entry_id: str):
    try:
        oid = ObjectId(entry_id)
    except Exception:
        raise HTTPException(400, "Bad entry id")
    doc = entries.find_one({"_id": oid})
    if not doc:
        raise HTTPException(404, "Entry not found")
    return doc_to_entry(doc)
