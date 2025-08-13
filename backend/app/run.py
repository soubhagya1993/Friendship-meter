# backend/run.py
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Runs the app on http://127.0.0.1:5000
    app.run(debug=True)