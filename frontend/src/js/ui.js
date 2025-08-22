// frontend/src/js/ui.js

/**
 * Creates an HTML card for a single stat.
 * @param {object} stat - { label, value, subtext, icon }
 */
function createStatCard({ label, value, subtext, icon }) {
  return `
    <div class="bg-card-beige p-6 rounded-xl border border-border-soft">
      <div class="flex justify-between items-start mb-4">
        <span class="text-sm font-semibold text-text-secondary">${label}</span>
        <span class="text-text-secondary">${icon}</span>
      </div>
      <p class="text-3xl font-bold text-text-primary">${value}</p>
      <p class="text-sm text-text-secondary mt-1">${subtext}</p>
    </div>
  `;
}

/**
 * Renders a friend row for dashboard list.
 * Accepts either:
 *  - { name, avatar, lastContact (string), connection, interactions }
 *  - { name, avatar, lastContactDays (number), connection, interactions }
 */
function createFriendListItem(friend) {
  const avatar = friend.avatar || 'https://placehold.co/40x40?text=FM';
  const lastContact =
    friend.lastContact ??
    (typeof friend.lastContactDays === 'number'
      ? `Last contact: ${friend.lastContactDays} days ago`
      : 'Last contact: —');
  const connection = Number(friend.connection) || 0;
  const interactions = Number(friend.interactions) || 0;

  return `
    <div class="flex items-center p-3 hover:bg-background-beige rounded-lg">
      <img src="${avatar}" alt="${friend.name}" class="w-10 h-10 rounded-full mr-4">
      <div class="flex-grow">
        <p class="font-bold text-sm text-text-primary">${friend.name}</p>
        <p class="text-xs text-text-secondary">${lastContact}</p>
      </div>
      <div class="w-28 text-center px-4">
        <p class="font-semibold text-sm text-text-primary">${connection}%</p>
        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
          <div class="bg-primary-teal h-1.5 rounded-full" style="width: ${connection}%"></div>
        </div>
      </div>
      <div class="w-32 text-right">
        <span class="bg-pill-red-bg text-pill-red-text text-xs font-bold px-3 py-1 rounded-full">${interactions} interactions</span>
      </div>
    </div>
  `;
}

/**
 * Dashboard view.
 * @param {HTMLElement} container
 * @param {{stats:Array, friends:Array, weeklyActivity:{labels:Array, data:Array}}} data
 */
export function renderDashboard(container, data) {
  const statsGrid = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      ${data.stats.map(createStatCard).join('')}
    </div>
  `;

  const weeklyActivitySection = renderWeeklyActivity(data.weeklyActivity);

  const friendsSection = `
    <div class="bg-card-beige p-6 rounded-xl border border-border-soft">
      <h2 class="font-nunito text-xl font-bold mb-1 text-text-primary">Your Friends</h2>
      <p class="text-sm text-text-secondary mb-4">Connection overview and recent activity</p>
      <div class="space-y-1">
        ${data.friends.map(createFriendListItem).join('')}
      </div>
    </div>
  `;

  container.innerHTML = statsGrid + friendsSection + weeklyActivitySection;
}

/**
 * Full Friends page (cards).
 * @param {HTMLElement} container
 * @param {Array} friends - objects from API
 */
export function renderFriendsPage(container, friends) {
  const friendsList = `
    <div class="space-y-6">
      ${friends.map(createManageFriendCard).join('')}
    </div>
  `;
  container.innerHTML = friendsList;
}

/**
 * Populate friend <select> in the modal.
 * @param {HTMLSelectElement} selectElement
 * @param {Array} friends - objects from API
 */
export function populateFriendOptions(selectElement, friends) {
  if (!selectElement) return;
  selectElement.innerHTML = '<option disabled selected>Select a friend</option>';
  friends.forEach(friend => {
    const option = document.createElement('option');
    option.value = friend.id;
    option.textContent = friend.name;
    selectElement.appendChild(option);
  });
}

/**
 * Settings page.
 */
export function renderSettingsPage(container) {
  const settingsContent = `
    <div class="bg-card-beige p-6 rounded-xl border border-border-soft">
      <h3 class="font-nunito text-lg font-bold mb-4">Application Settings</h3>
      <p class="text-text-secondary">Settings for notifications, data management, and account preferences will be available here in a future update.</p>
    </div>
  `;
  container.innerHTML = settingsContent;
}

function createManageFriendCard({ id, name, avatar, email, phone, preference, bio, interactions, lastContactDays }) {
  const av = avatar || 'https://placehold.co/48x48?text=FM';
  return `
    <div class="bg-card-beige p-6 rounded-xl border border-border-soft space-y-4">
      <div class="flex justify-between items-start">
        <div class="flex items-center space-x-4">
          <img src="${av}" alt="${name}" class="w-12 h-12 rounded-full">
          <div>
            <h3 class="font-bold text-lg text-text-primary">${name}</h3>
            <p class="text-sm text-text-secondary">${email || ''}</p>
            ${phone ? `<p class="text-sm text-text-secondary">${phone}</p>` : ''}
          </div>
        </div>
        <div class="flex space-x-2">
          <button class="p-2 hover:bg-gray-200 rounded-md"
                  title="Edit"
                  data-role="edit-friend"
                  data-friend-id="${id}">
            <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          </button>
          <button class="p-2 hover:bg-gray-200 rounded-md"
                  title="Delete"
                  data-role="delete-friend"
                  data-friend-id="${id}">
            <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
      <div>
        <div class="flex items-center text-sm text-text-secondary mb-3">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
          </svg>
          <span>Prefers ${preference || 'Text/Chat'}</span>
        </div>
        <p class="text-sm text-text-secondary bg-background-beige p-3 rounded-md">${bio || ''}</p>
      </div>
      <div class="flex items-center space-x-2">
        <span class="bg-gray-200 text-text-secondary text-xs font-semibold px-3 py-1 rounded-full">${Number(interactions) || 0} interactions</span>
        <span class="bg-pill-red-bg text-pill-red-text text-xs font-semibold px-3 py-1 rounded-full">Last contact: ${typeof lastContactDays === 'number' ? lastContactDays : '—'} days ago</span>
      </div>
    </div>
  `;
}

/**
 * Weekly Activity container (Chart is drawn separately).
 */
function renderWeeklyActivity(weeklyData) {
  return `
    <div class="bg-card-beige p-6 rounded-xl border border-border-soft">
      <h2 class="font-nunito text-xl font-bold mb-1 text-text-primary">Weekly Activity</h2>
      <p class="text-sm text-text-secondary mb-4">Your interaction patterns this week</p>
      <div style="height:240px">
        <canvas id="weeklyActivityChart"></canvas>
      </div>
    </div>
  `;
}

/**
 * Draw bar chart with Chart.js
 * @param {{labels:Array<string>, data:Array<number>}} weeklyData
 */
export function drawWeeklyChart(weeklyData) {
  const ctx = document.getElementById('weeklyActivityChart');
  if (!ctx) return;

  // destroy previous instance if re-rendering
  if (window._weeklyChart) {
    try { window._weeklyChart.destroy(); } catch {}
  }

  const maxVal = Math.max(0, ...(weeklyData?.data || [0]));
  const suggestedMax = Math.max(3, maxVal + 1);

  window._weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: weeklyData.labels || [],
      datasets: [{
        label: 'Interactions',
        data: weeklyData.data || [],
        backgroundColor: '#4DB6AC',
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax,
          grid: { color: '#F3EEE8' },
          ticks: { color: '#8A94A6' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#8A94A6' }
        }
      }
    }
  });
}


/**
 * Interactions page.
 */
export function renderInteractionsPage(container, interactions = [], friends = []) {
  if (!container) return;

  container.innerHTML = `
    <div class="p-4 space-y-4">
      <h2 class="text-xl font-semibold">All Interactions</h2>
      ${
        interactions.length === 0
          ? `<p class="text-gray-500">No interactions logged yet.</p>`
          : `<ul class="divide-y divide-gray-200">
              ${interactions
                .map((i) => {
                  const friend = (friends || []).find((f) => f.id === i.friendId);
                  const friendName = friend ? friend.name : `Friend #${i.friendId}`;
                  return `
                    <li class="flex items-center justify-between py-3">
                      <div>
                        <p class="font-medium">${i.type} with ${friendName}</p>
                        <p class="text-sm text-gray-500">${new Date(i.occurredAt).toLocaleString()}</p>
                        ${i.notes ? `<p class="text-sm text-gray-700 italic">${i.notes}</p>` : ""}
                      </div>
                      <button data-role="delete-interaction" data-id="${i.id}"
                        class="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200">
                        Delete
                      </button>
                    </li>
                  `;
                })
                .join("")}
            </ul>`
      }
    </div>
  `;
}


// export function renderInteractionsPage(container) {
//   if (!container) return;

//   // ✅ Load from localStorage instead of relying on caller
//   const interactions = JSON.parse(localStorage.getItem("interactions")) || [];
//   const friends = JSON.parse(localStorage.getItem("friends")) || [];

//   container.innerHTML = `
//     <div class="p-4 space-y-4">
//       <h2 class="text-xl font-semibold">All Interactions</h2>
//       ${
//         interactions.length === 0
//           ? `<p class="text-gray-500">No interactions logged yet.</p>`
//           : `<ul class="divide-y divide-gray-200">
//               ${interactions
//                 .map((i) => {
//                   const friend = friends.find((f) => f.id === i.friendId);
//                   const friendName = friend ? friend.name : `Friend #${i.friendId}`;
//                   return `
//                     <li class="flex items-center justify-between py-3">
//                       <div>
//                         <p class="font-medium">${i.type} with ${friendName}</p>
//                         <p class="text-sm text-gray-500">${new Date(
//                           i.occurredAt
//                         ).toLocaleString()}</p>
//                         ${
//                           i.notes
//                             ? `<p class="text-sm text-gray-700 italic">${i.notes}</p>`
//                             : ""
//                         }
//                       </div>
//                       <button data-role="delete-interaction" data-id="${i.id}"
//                         class="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200">
//                         Delete
//                       </button>
//                     </li>
//                   `;
//                 })
//                 .join("")}
//             </ul>`
//       }
//     </div>
//   `;
// }