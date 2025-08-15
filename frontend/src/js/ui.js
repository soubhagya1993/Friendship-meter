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
    // The container is now just a simple list of cards
    const friendsList = `
        <div class="space-y-6">
            ${friends.map(createManageFriendCard).join('')}
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


/**
 * Renders the "Settings" page placeholder.
 * @param {HTMLElement} container - The element to render the page into.
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

function createManageFriendCard({ name, avatar, email, phone, preference, bio, interactions, lastContactDays }) {
    return `
        <div class="bg-card-beige p-6 rounded-xl border border-border-soft space-y-4">
            <div class="flex justify-between items-start">
                <div class="flex items-center space-x-4">
                    <img src="${avatar}" alt="${name}" class="w-12 h-12 rounded-full">
                    <div>
                        <h3 class="font-bold text-lg text-text-primary">${name}</h3>
                        <p class="text-sm text-text-secondary">${email}</p>
                        ${phone ? `<p class="text-sm text-text-secondary">${phone}</p>` : ''}
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button class="p-2 hover:bg-gray-200 rounded-md">
                        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button class="p-2 hover:bg-gray-200 rounded-md">
                        <svg class="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
            <div>
                <div class="flex items-center text-sm text-text-secondary mb-3">
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                    <span>Prefers ${preference}</span>
                </div>
                <p class="text-sm text-text-secondary bg-background-beige p-3 rounded-md">${bio}</p>
            </div>
            <div class="flex items-center space-x-2">
                <span class="bg-gray-200 text-text-secondary text-xs font-semibold px-3 py-1 rounded-full">${interactions} interactions</span>
                <span class="bg-pill-red-bg text-pill-red-text text-xs font-semibold px-3 py-1 rounded-full">Last contact: ${lastContactDays} days ago</span>
            </div>
        </div>
    `;
}