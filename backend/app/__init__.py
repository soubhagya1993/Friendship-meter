# backend/app/__init__.py
from flask import Flask
from flask_cors import CORS

def create_app():
    """Create and configure an instance of the Flask application."""
    app = Flask(__name__)
    CORS(app) # Enable CORS for all routes

    # Import and register blueprints
    from .routes import api
    app.register_blueprint(api)

    return app