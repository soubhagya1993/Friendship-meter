// frontend/src/js/main.js
import { renderDashboard, renderFriendsPage, populateFriendOptions } from './ui.js';
import { saveInteraction } from './api.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Element Selections ---
    const mainContentContainer = document.getElementById('main-content');
    const headerLogBtn = document.getElementById('log-interaction-btn'); // The button in the header
    const logModal = document.getElementById('log-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const logForm = document.getElementById('log-form');
    const friendSelect = document.getElementById('friend-select');
    const interactionBtns = document.querySelectorAll('.interaction-btn');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');

    // --- State Management ---
    let friendsCache = [];
    let selectedInteractionType = null;

    // --- Mock Data ---
    const mockStats = [
        { label: 'Total Friends', value: '4', subtext: 'Active connections', icon: '👥' },
        { label: 'This Week', value: '30', subtext: 'Total interactions', icon: '📈' },
        { label: 'Avg Connection', value: '77%', subtext: 'Connection strength', icon: '💚' },
        { label: 'Need Attention', value: '4', subtext: 'Friends to reach out to', icon: '🗓️' }
    ];
    const mockFriends = [
        { id: 1, name: 'Alex Chen', avatar: 'https://placehold.co/40x40/FFA07A/36454F?text=AC', lastContact: 'Last contact: 582 days ago', connection: 85, interactions: 24 },
        { id: 2, name: 'Sarah Johnson', avatar: 'https://placehold.co/40x40/4DB6AC/FFFFFF?text=SJ', lastContact: 'Last contact: 584 days ago', connection: 72, interactions: 18 },
        { id: 3, name: 'Mike Rodriguez', avatar: 'https://placehold.co/40x40/6495ED/FFFFFF?text=MR', lastContact: 'Last contact: 584 days ago', connection: 92, interactions: 31 }
    ];

    // --- Functions ---

    function toggleModal(show) {
        if (!logModal) return;
        if (show) {
            populateFriendOptions(friendSelect, friendsCache);
            logModal.classList.remove('hidden');
        } else {
            logModal.classList.add('hidden');
            if (logForm) logForm.reset();
            interactionBtns.forEach(btn => btn.classList.remove('bg-primary-teal', 'text-white'));
            selectedInteractionType = null;
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault();
        const friendId = friendSelect.value;
        if (!friendId || friendId === "Select a friend" || !selectedInteractionType) {
            alert('Please select a friend and an interaction type.');
            return;
        }
        const newInteraction = {
            friendId: parseInt(friendId),
            type: selectedInteractionType,
            date: new Date().toISOString().split('T')[0]
        };
        const result = await saveInteraction(newInteraction);
        if (result) {
            alert('Interaction logged successfully!');
            toggleModal(false);
        } else {
            alert('Failed to log interaction. Please try again.');
        }
    }

    function handleInteractionSelect(event) {
        const selectedBtn = event.currentTarget;
        interactionBtns.forEach(btn => btn.classList.remove('bg-primary-teal', 'text-white'));
        selectedBtn.classList.add('bg-primary-teal', 'text-white');
        selectedInteractionType = selectedBtn.dataset.type;
    }

    function handleNavigation(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const page = link.dataset.page;

        // If the log interaction link in the sidebar is clicked, just open the modal.
        if (page === 'log') {
            toggleModal(true);
            return; // Stop further execution
        }
        
        // Don't re-render if the active link is clicked again
        if (link.classList.contains('active-link')) return;

        // Handle page navigation for Dashboard and Friends
        navLinks.forEach(l => l.classList.remove('active-link'));
        link.classList.add('active-link');

        switch (page) {
            case 'dashboard':
                pageTitle.textContent = 'Your Friendship Dashboard';
                pageSubtitle.textContent = 'A mindful way to nurture your meaningful connections';
                renderDashboard(mainContentContainer, { stats: mockStats, friends: mockFriends });
                break;
            case 'friends':
                pageTitle.textContent = 'Your Friends';
                pageSubtitle.textContent = 'Manage your connections';
                renderFriendsPage(mainContentContainer, friendsCache);
                break;
        }
    }

    // --- Initializer ---
    function initializeApp() {
        friendsCache = mockFriends;

        // Attach listeners to all required elements
        if (headerLogBtn) {
            headerLogBtn.addEventListener('click', () => toggleModal(true));
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => toggleModal(false));
        }
        if (logForm) {
            logForm.addEventListener('submit', handleFormSubmit);
        }
        interactionBtns.forEach(btn => btn.addEventListener('click', handleInteractionSelect));
        navLinks.forEach(link => link.addEventListener('click', handleNavigation));

        // Initial page load
        if (mainContentContainer) {
            renderDashboard(mainContentContainer, { stats: mockStats, friends: mockFriends });
        }
    }

    initializeApp();
});