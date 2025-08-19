// frontend/src/js/main.js
import {
  renderDashboard,
  renderFriendsPage,
  renderSettingsPage,
  populateFriendOptions,
  drawWeeklyChart
} from './ui.js';

import {
  getFriends,
  getOverviewStats,
  getWeeklyActivity,
  saveInteraction
} from './api.js';

document.addEventListener('DOMContentLoaded', () => {
  // ----- persistent DOM -----
  const main = document.getElementById('main-content');
  const headerBtn = document.getElementById('header-action-button');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  // ----- state -----
  let friendsCache = [];
  let selectedInteractionType = null;

  // ----- helpers -----
  function getModalEls() {
    return {
      modal: document.getElementById('log-modal'),
      form: document.getElementById('log-form'),
      typeBtns: document.querySelectorAll('.interaction-btn'),
      friendSelect: document.getElementById('friend-select')
    };
  }

  function toggleModal(show) {
    const { modal, form, typeBtns, friendSelect } = getModalEls();
    if (!modal) return;

    if (show) {
      try { populateFriendOptions(friendSelect, friendsCache); } catch {}
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      setTimeout(() => friendSelect?.focus(), 0);
    } else {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      form?.reset?.();
      typeBtns.forEach(b => b.classList.remove('bg-primary-teal', 'text-white', 'selected'));
      selectedInteractionType = null;
    }
  }

  async function submitInteraction(form) {
    const friendId = form.friend?.value;
    if (!friendId || !selectedInteractionType) {
      alert('Please select a friend and an interaction type.');
      return;
    }
    const payload = {
      friendId: Number(friendId),
      type: selectedInteractionType,                 // meetup | call | video | text
      date: new Date().toISOString().slice(0, 10),
      notes: ''                                      // optional
    };
    try {
      await saveInteraction(payload);
      toggleModal(false);
      // refresh dashboard to reflect new stats/chart
      await go('dashboard');
    } catch (e) {
      console.error('[saveInteraction]', e);
      alert('Failed to log interaction. Please try again.');
    }
  }

  function mapFriendsForDashboard(friends) {
    // ui.createFriendListItem expects: { name, avatar, lastContact (string) OR lastContactDays, connection, interactions }
    return friends.map(f => ({
      name: f.name,
      avatar: f.avatar,
      lastContactDays: f.lastContactDays,
      connection: f.connection,
      interactions: f.interactions
    }));
  }

  // ----- router -----
  async function go(page) {
    // highlight active
    document.querySelectorAll('.nav-link').forEach(a => {
      a.classList.toggle('active-link', a.dataset.page === page);
    });

    switch (page) {
      case 'dashboard': {
        pageTitle.textContent = 'Your Friendship Dashboard';
        pageSubtitle.textContent = 'A mindful way to nurture your meaningful connections';
        headerBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Log Interaction</span>`;
        headerBtn.dataset.action = 'log';

        let friends = [];
        let weekly = { labels: [], data: [] };
        let overview = { totalFriends: 0, interactionsThisWeek: 0, avgConnection: 0, needAttention: 0 };

        try {
          const res = await Promise.all([ getFriends(), getWeeklyActivity(), getOverviewStats() ]);
          [friends, weekly, overview] = res;
          // cache for modal & friends page
          friendsCache = friends;
        } catch (e) {
          console.error('[API fetch error]', e);
        }

        const stats = [
          { label:'Total Friends', value: String(overview.totalFriends), subtext:'Active connections', icon:'👥' },
          { label:'This Week', value: String(overview.interactionsThisWeek), subtext:'Total interactions', icon:'📈' },
          { label:'Avg Connection', value: `${overview.avgConnection}%`, subtext:'Connection strength', icon:'💚' },
          { label:'Need Attention', value: String(overview.needAttention), subtext:'Friends to reach out to', icon:'🗓️' },
        ];

        const dashFriends = mapFriendsForDashboard(friends);
        renderDashboard(main, { stats, friends: dashFriends, weeklyActivity: weekly });
        try { drawWeeklyChart(weekly); } catch (e) { console.error('[Chart]', e); }
        break;
      }

      case 'friends': {
        pageTitle.textContent = 'Manage Friends';
        pageSubtitle.textContent = 'Add, edit, and organize your meaningful connections';
        headerBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Add Friend</span>`;
        headerBtn.dataset.action = 'add-friend';

        // refresh cache if empty
        if (!friendsCache || friendsCache.length === 0) {
          try { friendsCache = await getFriends(); } catch (e) { console.error('[getFriends]', e); }
        }
        renderFriendsPage(main, friendsCache);
        break;
      }

      case 'settings': {
        pageTitle.textContent = 'Settings';
        pageSubtitle.textContent = 'Manage your application';
        headerBtn.innerHTML = '';
        headerBtn.dataset.action = 'none';

        renderSettingsPage(main);
        break;
      }
    }
  }

  // ----- global event delegation -----
  document.addEventListener('click', (e) => {
    // sidebar links
    const nav = e.target.closest('.nav-link');
    if (nav) {
      e.preventDefault();
      const page = nav.dataset.page;
      if (page === 'log') toggleModal(true);
      else go(page);
      return;
    }

    // header primary button
    const actionBtn = e.target.closest('#header-action-button');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === 'log') toggleModal(true);
      else if (action === 'add-friend') alert('Add Friend form coming soon!');
      return;
    }

    // modal dismiss via Cancel/X/etc.
    if (e.target.closest('[data-dismiss="modal"]')) {
      toggleModal(false);
      return;
    }

    // close by clicking overlay
    if (e.target.id === 'log-modal') {
      toggleModal(false);
      return;
    }

    // interaction type buttons
    const typeBtn = e.target.closest('.interaction-btn');
    if (typeBtn) {
      const { typeBtns } = getModalEls();
      typeBtns.forEach(b => b.classList.remove('bg-primary-teal', 'text-white', 'selected'));
      typeBtn.classList.add('bg-primary-teal', 'text-white', 'selected');
      selectedInteractionType = typeBtn.dataset.type; // meetup | call | video | text
      return;
    }
  });

  // close on Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const m = document.getElementById('log-modal');
      if (m && !m.classList.contains('hidden')) toggleModal(false);
    }
  });

  // modal submit
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('#log-form');
    if (!form) return;
    e.preventDefault();
    await submitInteraction(form);
  });

  // ----- init -----
  headerBtn.dataset.action = 'log';
  go('dashboard');
});
