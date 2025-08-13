// frontend/src/js/ui.js

/**
 * Creates an HTML card for a single stat.
 * @param {object} stat - The stat object { label, value, subtext, icon }.
 * @returns {string} - The HTML string for the stat card.
 */
function createStatCard({ label, value, subtext, icon }) {
    // Matched padding, border, and font sizes from Figma
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
 * Creates an HTML list item for a single friend.
 * @param {object} friend - The friend object.
 * @returns {string} - The HTML string for the friend list item.
 */
function createFriendListItem({ name, avatar, lastContact, connection, interactions }) {
    // Matched layout, font sizes, and pill styles from Figma
    return `
        <div class="flex items-center p-3 hover:bg-background-beige rounded-lg">
            <img src="${avatar}" alt="${name}" class="w-10 h-10 rounded-full mr-4">
            <div class="flex-grow">
                <p class="font-bold text-sm text-text-primary">${name}</p>
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
 * Renders the main dashboard UI.
 * @param {HTMLElement} container - The element to render the dashboard into.
 * @param {object} data - The data for the dashboard.
 */
export function renderDashboard(container, data) {
    const statsGrid = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${data.stats.map(createStatCard).join('')}
        </div>
    `;

    const friendsSection = `
        <div class="bg-card-beige p-6 rounded-xl border border-border-soft">
            <h2 class="font-nunito text-xl font-bold mb-1 text-text-primary">Your Friends</h2>
            <p class="text-sm text-text-secondary mb-4">Connection overview and recent activity</p>
            <div class="space-y-1">
                ${data.friends.map(createFriendListItem).join('')}
            </div>
        </div>
    `;

    container.innerHTML = statsGrid + friendsSection;
}

/**
 * Renders the full "Friends" page.
 * @param {HTMLElement} container - The element to render the page into.
 * @param {Array} friends - The array of friend objects.
 */
export function renderFriendsPage(container, friends) {
    const friendsList = `
        <div class="bg-card-beige p-6 rounded-xl border border-border-soft">
            <div class="space-y-1">
                ${friends.map(createFriendListItem).join('')}
            </div>
        </div>
    `;
    container.innerHTML = friendsList;
}


/**
 * Populates a <select> dropdown with friend options.
 * @param {HTMLSelectElement} selectElement - The <select> element to populate.
 * @param {Array} friends - The array of friend objects.
 */
export function populateFriendOptions(selectElement, friends) {
    selectElement.innerHTML = '<option disabled selected>Select a friend</option>';
    friends.forEach(friend => {
        const option = document.createElement('option');
        option.value = friend.id;
        option.textContent = friend.name;
        selectElement.appendChild(option);
    });
}
