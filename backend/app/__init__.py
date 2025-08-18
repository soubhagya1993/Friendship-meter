from flask import Flask
from flask_cors import CORS
from .models import db
from .routes import api

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///friendship_meter.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()  # simple for dev; switch to Flask-Migrate later

    app.register_blueprint(api)
    return app
