# backend/app/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class Friend(db.Model):
    __tablename__ = "friends"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(50))
    preference = db.Column(db.String(50))
    bio = db.Column(db.Text)
    avatar = db.Column(db.String(255))

    interactions = db.relationship(
        "Interaction", backref="friend", lazy=True, cascade="all, delete-orphan"
    )

    # --- helper methods ---
    def last_contact_days(self):
        if not self.interactions:
            return None
        last = max(self.interactions, key=lambda i: i.occurred_at)
        return (datetime.utcnow().date() - last.occurred_at.date()).days

    def interactions_count(self):
        return len(self.interactions)

    def connection_strength(self):
        """
        Connection score (0–100)
        - Recency (70%)
        - Volume (30%)
        """
        days = self.last_contact_days()
        days = 365 if days is None else days
        recency = max(0.0, 1.0 - (days / 60.0)) * 70
        volume = min(1.0, self.interactions_count() / 20.0) * 30
        return int(round(recency + volume))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "preference": self.preference or "Text/Chat",
            "bio": self.bio or "",
            "avatar": self.avatar
            or "https://placehold.co/48x48/60A5FA/0B1A2B?text=FM",
            "interactions": self.interactions_count(),
            "lastContactDays": self.last_contact_days() if self.last_contact_days() is not None else 999,
            "connection": self.connection_strength(),
        }


class Interaction(db.Model):
    __tablename__ = "interactions"

    id = db.Column(db.Integer, primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey("friends.id"), nullable=False)
    type = db.Column(db.String(50))  # e.g., "call", "meetup", "video", "text"
    notes = db.Column(db.Text)
    occurred_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "friendId": self.friend_id,
            "type": self.type,
            "notes": self.notes,
            "occurredAt": self.occurred_at.isoformat(),
        }
