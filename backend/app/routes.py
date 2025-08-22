# backend/app/routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from .models import db, Friend, Interaction

api = Blueprint("api", __name__)

# ---------- HELPERS ----------
def last_contact_days(friend_id: int):
    """Return days since last interaction for a friend, or None if never."""
    last = (
        Interaction.query.filter_by(friend_id=friend_id)
        .order_by(Interaction.occurred_at.desc())
        .first()
    )
    if not last:
        return None
    return (datetime.utcnow().date() - last.occurred_at.date()).days


def interactions_count(friend_id: int):
    """Return number of interactions for a friend."""
    return Interaction.query.filter_by(friend_id=friend_id).count()


def connection_strength(friend_id: int):
    """
    Compute connection score (0–100).
    Based on recency (70%) and volume (30%).
    """
    days = last_contact_days(friend_id)
    days = 365 if days is None else days
    recency = max(0.0, 1.0 - (days / 60.0)) * 70
    volume = min(1.0, interactions_count(friend_id) / 20.0) * 30
    return int(round(recency + volume))


# ---------- FRIENDS ----------
@api.route("/api/friends", methods=["GET"], strict_slashes=False)
def list_friends():
    friends = Friend.query.all()
    return jsonify([f.to_dict() for f in friends])


@api.route("/api/friends", methods=["POST"], strict_slashes=False)
def add_friend():
    data = request.get_json() or {}

    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    friend = Friend(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        preference=data.get("preference"),
        bio=data.get("bio"),
        avatar=data.get("avatar") or "https://placehold.co/48x48/60A5FA/0B1A2B?text=FM",
    )
    db.session.add(friend)
    db.session.commit()

    return jsonify(friend.to_dict()), 201


@api.route("/api/friends/<int:fid>", methods=["PUT", "PATCH"], strict_slashes=False)
def update_friend(fid):
    friend = Friend.query.get_or_404(fid)
    data = request.get_json() or {}

    for k in ["name", "email", "phone", "preference", "bio", "avatar_url"]:
        if k in data:
            setattr(friend, k, data[k])

    db.session.commit()
    return jsonify(friend.to_dict())


# --- DELETE FRIEND ---
@api.route("/api/friends/<int:fid>", methods=["DELETE"], strict_slashes=False)
def delete_friend(fid):
    friend = Friend.query.get_or_404(fid)
    db.session.delete(friend)
    db.session.commit()
    return jsonify({"ok": True})

# ---------- INTERACTIONS ----------
@api.route("/api/interactions", methods=["GET"])
def list_interactions():
    interactions = Interaction.query.order_by(
        Interaction.occurred_at.desc()
    ).all()
    return jsonify([i.to_dict() for i in interactions])


@api.route("/api/interactions", methods=["POST"])
def add_interaction():
    data = request.get_json() or {}
    f_id = data.get("friendId")
    Friend.query.get_or_404(f_id)  # validate friend exists

    occurred_at = (
        datetime.fromisoformat(data.get("occurredAt"))
        if data.get("occurredAt")
        else datetime.utcnow()
    )

    interaction = Interaction(
        friend_id=f_id,
        type=data.get("type"),
        notes=data.get("notes"),
        occurred_at=occurred_at,
    )
    db.session.add(interaction)
    db.session.commit()
    return jsonify(interaction.to_dict()), 201


@api.route("/api/interactions/<int:interaction_id>", methods=["DELETE"])
def delete_interaction(interaction_id):
    i = Interaction.query.get_or_404(interaction_id)
    db.session.delete(i)
    db.session.commit()
    return jsonify({"ok": True})


# ---------- STATS ----------
@api.route("/api/stats/overview", methods=["GET"])
def stats_overview():
    total_friends = Friend.query.count()

    week_start = datetime.utcnow().date() - timedelta(days=6)
    week_start_dt = datetime.combine(week_start, datetime.min.time())
    interactions_this_week = Interaction.query.filter(
        Interaction.occurred_at >= week_start_dt
    ).count()

    if total_friends:
        avg_conn = int(
            round(
                sum(connection_strength(f.id) for f in Friend.query.all())
                / total_friends
            )
        )
    else:
        avg_conn = 0

    need_attention = sum(
        1
        for f in Friend.query.all()
        if (last_contact_days(f.id) or 999) > 21
    )

    return jsonify(
        {
            "totalFriends": total_friends,
            "interactionsThisWeek": interactions_this_week,
            "avgConnection": avg_conn,
            "needAttention": need_attention,
        }
    )


@api.route("/api/stats/weekly", methods=["GET"])
def stats_weekly():
    today = datetime.utcnow().date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    data = []
    for d in days:
        start = datetime.combine(d, datetime.min.time())
        end = datetime.combine(d, datetime.max.time())
        count = Interaction.query.filter(
            Interaction.occurred_at.between(start, end)
        ).count()
        data.append(count)
    labels = [d.strftime("%a") for d in days]
    return jsonify({"labels": labels, "data": data})
