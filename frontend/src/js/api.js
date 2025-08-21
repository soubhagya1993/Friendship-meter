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

// Friends
export const getFriends = () => jfetch('/api/friends');
export const addFriend   = (p) => jfetch('/api/friends', { method:'POST', body: JSON.stringify(p) });
export const updateFriend= (id,p)=> jfetch(`/api/friends/${id}`, { method:'PUT', body: JSON.stringify(p) });
export const deleteFriend= (id) => jfetch(`/api/friends/${id}`, { method:'DELETE' });

// Interactions
export const saveInteraction = (p) => jfetch('/api/interactions', { method:'POST', body: JSON.stringify(p) });

// Stats
export const getOverviewStats = () => jfetch('/api/stats/overview');
export const getWeeklyActivity= () => jfetch('/api/stats/weekly');


// newly added functions
export async function getInteractions() {
  return jfetch("/api/interactions");
}

export async function addInteraction(data) {
  return jfetch("/api/interactions", {
    method: "POST",
    body: JSON.stringify(data)
  });
}

export async function deleteInteraction(id) {
  return jfetch(`/api/interactions/${id}`, { method: "DELETE" });
}

// // ------- Friends -------
// export function getFriends() {
//   return jfetch('/api/friends');
// }
// export function addFriend(payload) {
//   return jfetch('/api/friends', {
//     method: 'POST',
//     body: JSON.stringify(payload),
//   });
// }
// export function updateFriend(id, payload) {
//   return jfetch(`/api/friends/${id}`, {
//     method: 'PUT',
//     body: JSON.stringify(payload),
//   });
// }
// export function deleteFriend(id) {
//   return jfetch(`/api/friends/${id}`, { method: 'DELETE' });
// }

// // ------- Interactions -------
// export function saveInteraction(payload) {
//   return jfetch('/api/interactions', {
//     method: 'POST',
//     body: JSON.stringify(payload),
//   });
// }

// // ------- Stats -------
// export function getOverviewStats() {
//   return jfetch('/api/stats/overview');
// }
// export function getWeeklyActivity() {
//   return jfetch('/api/stats/weekly');
// }
