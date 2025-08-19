# backend/app/routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from .models import db, Friend, Interaction

# Create a Blueprint
api = Blueprint('api', __name__)

FRIENDS = []        # [{ id, name, email, phone, preference, bio, avatar, ... }]
INTERACTIONS = []   # [{ id, friendId, type, notes, occurred_at }]
NEXT_FRIEND_ID = 1
NEXT_INTERACTION_ID = 1

def friend_by_id(fid):
    return next((f for f in FRIENDS if f["id"] == fid), None)

def friend_interactions(fid):
    return [ix for ix in INTERACTIONS if ix["friendId"] == fid]

def last_contact_days(fid):
    ixs = friend_interactions(fid)
    if not ixs:
        return None
    last = max(ixs, key=lambda x: x["occurred_at"])["occurred_at"].date()
    return (datetime.utcnow().date() - last).days

def interactions_count(fid):
    return len(friend_interactions(fid))

def connection_strength(fid):
    days = last_contact_days(fid)
    days = 365 if days is None else days
    # simple 0–100 score: recency (70) + volume (30)
    recency = max(0.0, 1.0 - (days / 60.0)) * 70
    volume = min(1.0, interactions_count(fid) / 20.0) * 30
    return int(round(recency + volume))

# ---------- FRIENDS ----------
@api.route("/api/friends", methods=["GET"], strict_slashes=False)
def list_friends():
    def to_card(f):
        fid = f["id"]
        lc = last_contact_days(fid)
        return {
            "id": fid,
            "name": f["name"],
            "email": f.get("email"),
            "phone": f.get("phone"),
            "preference": f.get("preference") or "Text/Chat",
            "bio": f.get("bio") or "",
            "avatar": f.get("avatar") or "https://placehold.co/48x48/60A5FA/0B1A2B?text=FM",
            "interactions": interactions_count(fid),
            "lastContactDays": lc if lc is not None else 999,
            "connection": connection_strength(fid),
        }
    return jsonify([to_card(f) for f in FRIENDS])

@api.route("/api/friends", methods=["POST"], strict_slashes=False)
def add_friend():
    global NEXT_FRIEND_ID
    data = request.get_json() or {}
    friend = {
        "id": NEXT_FRIEND_ID,
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "preference": data.get("preference") or "Text/Chat",
        "bio": data.get("bio") or "",
        "avatar": data.get("avatar") or "https://placehold.co/48x48/60A5FA/0B1A2B?text=FM",
    }
    NEXT_FRIEND_ID += 1
    FRIENDS.append(friend)
    return jsonify({"id": friend["id"]}), 201

# ---------- INTERACTIONS ----------
@api.route("/api/interactions", methods=["POST"], strict_slashes=False)
def create_interaction():
    global NEXT_INTERACTION_ID
    data = request.get_json() or {}
    fid = int(data["friendId"])
    # Parse date (YYYY-MM-DD) or default to now
    if data.get("date"):
        occurred_at = datetime.fromisoformat(data["date"])
    else:
        occurred_at = datetime.utcnow()
    ix = {
        "id": NEXT_INTERACTION_ID,
        "friendId": fid,
        "type": (data.get("type") or "text").lower(),  # meetup|call|video|text
        "notes": data.get("notes"),
        "occurred_at": occurred_at
    }
    NEXT_INTERACTION_ID += 1
    INTERACTIONS.append(ix)
    return jsonify({"ok": True, "id": ix["id"]}), 201

# ---------- STATS ----------
@api.route("/api/stats/overview", methods=["GET"], strict_slashes=False)
def stats_overview():
    total_friends = len(FRIENDS)

    week_start = datetime.utcnow().date() - timedelta(days=6)
    week_start_dt = datetime.combine(week_start, datetime.min.time())
    interactions_this_week = sum(1 for ix in INTERACTIONS if ix["occurred_at"] >= week_start_dt)

    if total_friends:
        avg_conn = int(round(sum(connection_strength(f["id"]) for f in FRIENDS) / total_friends))
    else:
        avg_conn = 0

    need_attention = sum(
        1 for f in FRIENDS
        if (last_contact_days(f["id"]) or 999) > 21
    )

    return jsonify({
        "totalFriends": total_friends,
        "interactionsThisWeek": interactions_this_week,
        "avgConnection": avg_conn,
        "needAttention": need_attention
    })

@api.route("/api/stats/weekly", methods=["GET"], strict_slashes=False)
def stats_weekly():
    # last 7 days buckets from oldest..today
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    data = []
    for d in days:
        start = datetime.combine(d, datetime.min.time())
        end   = datetime.combine(d, datetime.max.time())
        c = sum(1 for ix in INTERACTIONS if start <= ix["occurred_at"] <= end)
        data.append(c)
    labels = [d.strftime("%a") for d in days]  # Mon..Sun
    return jsonify({"labels": labels, "data": data})