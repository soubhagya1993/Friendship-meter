from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta

db = SQLAlchemy()

class Friend(db.Model):
    __tablename__ = "friends"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(40))
    preference = db.Column(db.String(40))  # "Meetup" | "Call" | "Video" | "Text"
    bio = db.Column(db.Text)
    avatar_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    interactions = db.relationship("Interaction", backref="friend", lazy="dynamic", cascade="all, delete-orphan")

    @property
    def last_contact_days(self):
        last = self.interactions.order_by(Interaction.occurred_at.desc()).first()
        if not last: return None
        return (datetime.utcnow().date() - last.occurred_at.date()).days

    @property
    def interactions_count(self):
        return self.interactions.count()

    @property
    def connection_strength(self):
        """
        Simple 0-100 score:
        - base on last contact recency (decay over 60 days)
        - plus bonus for volume (min(1, count/20)*30)
        """
        days = self.last_contact_days or 365
        recency = max(0.0, 1.0 - (days / 60.0)) * 70  # up to 70 points
        volume = min(1.0, self.interactions_count / 20.0) * 30  # up to 30 points
        return int(round(recency + volume))

class Interaction(db.Model):
    __tablename__ = "interactions"
    id = db.Column(db.Integer, primary_key=True)
    friend_id = db.Column(db.Integer, db.ForeignKey("friends.id"), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # meetup | call | video | text
    notes = db.Column(db.Text)
    occurred_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
