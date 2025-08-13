friendship_meter_webapp/
├── backend/
│   ├── venv/                   # Virtual environment for Python
│   ├── app/
│   │   ├── __init__.py         # Initializes the Flask app and Blueprints
│   │   ├── models.py           # Database models (e.g., User, Friend, Interaction)
│   │   ├── routes.py           # API endpoints (e.g., /api/friends, /api/log)
│   │   └── services.py         # Business logic (e.g., calculating friendship scores)
│   ├── run.py                  # Main script to start the Flask server
│   ├── config.py               # Configuration settings (database URI, secret keys)
│   └── requirements.txt        # Python package dependencies (Flask, Flask-CORS, etc.)
│
├── frontend/
│   ├── index.html              # The main HTML file for your single-page application
│   ├── src/
│   │   ├── js/
│   │   │   ├── main.js         # Main entry point for your JavaScript
│   │   │   ├── api.js          # Functions for making calls to your Flask backend
│   │   │   └── ui.js           # Functions for manipulating the DOM (e.g., rendering cards)
│   │   ├── css/
│   │   │   └── styles.css      # Your custom CSS file (compiled from Tailwind)
│   │   └── assets/
│   │       └── icons/          # For SVG icons (e.g., coffee.svg, phone.svg)
│   │
│   ├── tailwind.config.js      # Configuration for Tailwind CSS
│   └── package.json            # Lists frontend dependencies (like Tailwind CSS)
│
└── README.md                   # Project overview, setup instructions, etc.