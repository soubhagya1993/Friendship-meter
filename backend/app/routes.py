# backend/app/routes.py
from flask import Blueprint, jsonify
from flask import Blueprint, jsonify, request # Import request

# Create a Blueprint
api = Blueprint('api', __name__)

@api.route('/api/test', methods=['GET'])
def test_endpoint():
    """A simple test endpoint to verify the backend is running."""
    return jsonify({"message": "Hello from the Flask backend!"})

# NEW ENDPOINT
@api.route('/api/friends', methods=['GET'])
def get_friends():
    """Endpoint to get the list of friends for the dashboard."""
    # This is mock data for now. We'll get this from a database later.
    mock_friends = [
        { 'id': 1, 'name': 'Saloni', 'lastContact': '3 weeks ago', 'avatar': 'https://placehold.co/96x96/FFA07A/36454F?text=A' },
        { 'id': 2, 'name': 'Jessica Smith', 'lastContact': '1 month ago', 'avatar': 'https://placehold.co/96x96/4DB6AC/FFFFFF?text=J' },
        { 'id': 3, 'name': 'Mike Ross', 'lastContact': '25 days ago', 'avatar': 'https://placehold.co/96x96/6495ED/FFFFFF?text=M' },
        { 'id': 4, 'name': 'Sarah Lee', 'lastContact': '2 months ago', 'avatar': 'https://placehold.co/96x96/FFD700/36454F?text=S' },
        { 'id': 5, 'name': 'Chris Green', 'lastContact': '19 days ago', 'avatar': 'https://placehold.co/96x96/36454F/FFFFFF?text=C' },
    ]
    return jsonify(mock_friends)

@api.route('/api/interactions', methods=['POST'])
def log_interaction():
    """Endpoint to log a new interaction."""
    # Get the JSON data sent from the frontend
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid data"}), 400

    # For now, we'll just print the data to the server console.
    # Later, we will save this to a database.
    print(f"Received new interaction: {data}")

    # Send a success response back to the frontend
    return jsonify({"message": "Interaction logged successfully!", "data": data}), 201