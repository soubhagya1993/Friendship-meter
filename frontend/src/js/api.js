// frontend/src/js/api.js

const API_BASE_URL = 'http://127.0.0.1:5000'; // Your Flask backend URL

/**
 * Fetches the list of friends from the backend.
 * @returns {Promise<Array>} A promise that resolves to the array of friend objects.
 */
export async function fetchFriends() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/friends`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch friends:", error);
        // Return an empty array in case of an error so the UI doesn't break
        return [];
    }
}

/**
 * Sends a new interaction to the backend.
 * @param {object} interactionData - The interaction data to save.
 * @returns {Promise<object>} A promise that resolves to the server's response.
 */
export async function saveInteraction(interactionData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/interactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(interactionData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Failed to save interaction:", error);
        // You could add user-facing error handling here
        return null;
    }
}