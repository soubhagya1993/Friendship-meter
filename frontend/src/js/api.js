// frontend/src/js/api.js
const API = 'http://127.0.0.1:5000'; // Flask base URL

async function jfetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    // ok to send Content-Type for POST/PUT; harmless for GET
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // Throw so callers can handle/show an error
    throw new Error(`${res.status} ${res.statusText} for ${path} • ${text}`);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

// ------- Friends -------
export function getFriends() {
  return jfetch('/api/friends');
}
export function addFriend(payload) {
  return jfetch('/api/friends', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
export function updateFriend(id, payload) {
  return jfetch(`/api/friends/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
export function deleteFriend(id) {
  return jfetch(`/api/friends/${id}`, { method: 'DELETE' });
}

// ------- Interactions -------
export function saveInteraction(payload) {
  return jfetch('/api/interactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ------- Stats -------
export function getOverviewStats() {
  return jfetch('/api/stats/overview');
}
export function getWeeklyActivity() {
  return jfetch('/api/stats/weekly');
}
