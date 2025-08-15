```text
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


Friendship Meter Web Application
The Friendship Meter is a mindful, data-driven web application designed to help users be more intentional about their friendships. It provides insights into interaction frequency and balance, empowering users to nurture their meaningful connections.

This project is a full-stack application built with a Python/Flask backend and a vanilla JavaScript/Tailwind CSS frontend.

Tech Stack
Backend: Python 3, Flask

Frontend: HTML5, CSS3, JavaScript (ES6+)

Styling: Tailwind CSS

Package Management: pip (Python), npm (Node.js)

Initial Setup
Follow these steps to set up the project on your local machine.

Prerequisites
Python 3.x

Node.js and npm

1. Clone the Repository
First, clone the project repository to your local machine:

git clone <your-repository-url>
cd friendship_meter_webapp

2. Backend Setup
The backend is powered by Flask. We need to set up a virtual environment and install the required Python packages.

# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows (Command Prompt):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install the required packages
pip install -r requirements.txt

3. Frontend Setup
The frontend uses Tailwind CSS for styling, which requires Node.js dependencies.

# Navigate to the frontend directory from the root
cd frontend

# Install the required npm packages
npm install

Running the Application
To run the application, you need to start both the backend server and the frontend development server in separate terminal windows.

1. Run the Backend Server
Open a terminal and navigate to the backend directory.

Make sure your virtual environment is activated.

Run the following commands to start the Flask server:

On Windows (Command Prompt):

set FLASK_APP=run.py
set FLASK_ENV=development
flask run

On macOS/Linux:

export FLASK_APP=run.py
export FLASK_ENV=development
flask run

Your backend will now be running at http://1227.0.0.1:5000.

2. Run the Frontend Server
Open a new terminal and navigate to the frontend directory.

Run the Tailwind CSS build process in "watch" mode. This will automatically recompile your CSS when you make changes.

npx tailwindcss -i ./src/css/input.css -o ./src/css/styles.css --