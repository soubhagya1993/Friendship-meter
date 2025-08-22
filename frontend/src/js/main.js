// frontend/src/js/main.js
import {
  renderDashboard,
  renderFriendsPage,
  renderSettingsPage,
  renderInteractionsPage,
  populateFriendOptions,
  drawWeeklyChart
} from './ui.js';

import {
  getFriends,
  getInteractions, 
  addInteraction, 
  deleteInteraction,
  getOverviewStats,
  getWeeklyActivity,
  saveInteraction,
  addFriend,
  updateFriend,
  deleteFriend
} from './api.js';

import { toast } from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // ----- persistent DOM -----
  const main = document.getElementById('main-content');
  const headerBtn = document.getElementById('header-action-button');
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');

  // ----- state -----
  let friendsCache = [];
  let selectedInteractionType = null;
  let editingFriendId = null;

  // ----- helpers (Log Interaction modal) -----
  function getLogModalEls() {
    return {
      modal: document.getElementById('log-modal'),
      form: document.getElementById('log-form'),
      typeBtns: document.querySelectorAll('.interaction-btn'),
      friendSelect: document.getElementById('friend-select')
    };
  }

  function toggleLogModal(show) {
    const { modal, form, typeBtns, friendSelect } = getLogModalEls();
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
      type: selectedInteractionType,
      occurredAt: new Date().toISOString(),   // ✅ match backend expectation
      notes: ''
    };
    try {
      await saveInteraction(payload);
      toggleLogModal(false);
      toast({ type:'success', message:'Interaction logged' });
      await go('dashboard'); // refresh stats + chart
    } catch (e) {
      console.error('[saveInteraction]', e);
      toast({ type:'error', message:'Failed to log interaction' });
    }
  }

  // ----- helpers (Add/Edit Friend modal) -----
  function getAddFriendEls() {
    return {
      modal: document.getElementById('add-friend-modal'),
      form: document.getElementById('add-friend-form'),
      id: document.getElementById('af-id'),         // hidden id field
      name: document.getElementById('af-name'),
      email: document.getElementById('af-email'),
      phone: document.getElementById('af-phone'),
      pref: document.getElementById('af-preference'),
      avatar: document.getElementById('af-avatar'),
      bio: document.getElementById('af-bio'),
      error: document.getElementById('af-error'),
      title: document.querySelector('#add-friend-modal h2'),
    };
  }

  function toggleAddFriendModal(show) {
    const { modal, form, error, title, id } = getAddFriendEls();
    if (!modal) return;
    if (show) {
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      error?.classList.add('hidden');
      error.textContent = '';
      setTimeout(() => getAddFriendEls().name?.focus(), 0);
    } else {
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      form?.reset?.();
      editingFriendId = null;
      if (id) id.value = '';
      if (title) title.textContent = 'Add Friend';
    }
  }

  function openAddFriend() {
    const els = getAddFriendEls();
    els.form?.reset?.();
    if (els.id) els.id.value = '';
    editingFriendId = null;
    if (els.title) els.title.textContent = 'Add Friend';
    toggleAddFriendModal(true);
  }

  function validateFriendForm() {
    const { name, email, phone } = getAddFriendEls();
    if (!name.value.trim()) return 'Name is required.';
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return 'Email looks invalid.';
    if (phone.value && phone.value.length < 6) return 'Phone looks too short.';
    return null;
  }

  function openEditFriend(id) {
    const f = friendsCache.find(x => Number(x.id) === Number(id));
    if (!f) return;

    const els = getAddFriendEls();
    if (els.title) els.title.textContent = 'Edit Friend';

    if (els.id) els.id.value = String(id);
    els.name.value = f.name || '';
    els.email.value = f.email || '';
    els.phone.value = f.phone || '';
    els.pref.value = f.preference || 'Text/Chat';
    els.avatar.value = f.avatar || '';
    els.bio.value = f.bio || '';

    editingFriendId = Number(id);
    toggleAddFriendModal(true);
  }

  async function submitAddFriend(form) {
    const { id, name, email, phone, pref, avatar, bio, error } = getAddFriendEls();

    const msg = validateFriendForm();
    if (msg) {
      error.textContent = msg;
      error.classList.remove('hidden');
      toast({ type:'warning', message: msg });
      return;
    }

    const payload = {
      name: name.value.trim(),
      email: email.value.trim() || null,
      phone: phone.value.trim() || null,
      preference: pref.value,
      avatar: avatar.value.trim() || null,
      bio: bio.value.trim() || ''
    };

    const editIdRaw = id?.value ? Number(id.value) : (editingFriendId ?? null);
    const editId = Number.isFinite(editIdRaw) ? editIdRaw : null;
    const exists = editId && friendsCache.some(f => Number(f.id) === Number(editId));

    try {
      if (exists) {
        await updateFriend(editId, payload);
        toast({ type:'success', message:'Friend updated' });
      } else {
        await addFriend(payload);
        toast({ type:'success', message:'Friend added' });
      }

      toggleAddFriendModal(false);

      const active = document.querySelector('.nav-link.active-link')?.dataset.page;
      if (active === 'friends') {
        friendsCache = await getFriends();
        renderFriendsPage(document.getElementById('main-content'), friendsCache);
      } else {
        await go('dashboard');
      }
    } catch (e) {
      console.error('[add/update Friend]', e);
      if (String(e?.message).includes('404')) {
        try { friendsCache = await getFriends(); } catch {}
        error.textContent = 'This friend no longer exists or the form had a stale id. Please try again.';
        toast({ type:'error', message:'Could not save (stale id)' });
      } else {
        error.textContent = 'Failed to save friend. Please try again.';
        toast({ type:'error', message:'Failed to save friend' });
      }
      error.classList.remove('hidden');
    }
  }

  async function handleDeleteFriend(id) {
    const friend = friendsCache.find(x => Number(x.id) === Number(id));
    const name = friend?.name || 'this friend';
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      await deleteFriend(id);
      friendsCache = friendsCache.filter(f => Number(f.id) !== Number(id));
      const active = document.querySelector('.nav-link.active-link')?.dataset.page;
      if (active === 'friends') {
        renderFriendsPage(document.getElementById('main-content'), friendsCache);
      } else {
        await go('dashboard');
      }
      toast({ type:'success', message:'Friend deleted' });
    } catch (e) {
      console.error('[deleteFriend]', e);
      toast({ type:'error', message:'Failed to delete friend' });
    }
  }

  // ----- router -----
  async function go(page) {
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
          friendsCache = friends;
        } catch (e) { console.error('[API fetch error]', e); }

        const stats = [
          { label:'Total Friends', value: String(overview.totalFriends), subtext:'Active connections', icon:'👥' },
          { label:'This Week', value: String(overview.interactionsThisWeek), subtext:'Total interactions', icon:'📈' },
          { label:'Avg Connection', value: `${overview.avgConnection}%`, subtext:'Connection strength', icon:'💚' },
          { label:'Need Attention', value: String(overview.needAttention), subtext:'Friends to reach out to', icon:'🗓️' },
        ];

        const dashFriends = friends.map(f => ({
          name: f.name,
          avatar: f.avatar,
          lastContactDays: f.lastContactDays,
          connection: f.connection,
          interactions: f.interactions
        }));

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

        if (!friendsCache || friendsCache.length === 0) {
          try { friendsCache = await getFriends(); } catch (e) { console.error('[getFriends]', e); }
        }
        renderFriendsPage(main, friendsCache);
        break;
      }

      case 'interactions': {
        pageTitle.textContent = 'Interactions';
        pageSubtitle.textContent = 'Browse all your logged interactions';
        headerBtn.innerHTML = '';
        headerBtn.dataset.action = 'none';

        let interactions = [];
        try {
          interactions = await getInteractions();
        } catch (e) { console.error('[getInteractions]', e); }

        renderInteractionsPage(main, interactions, friendsCache);
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
      go(page);
      return;
    }

    // header button
    const actionBtn = e.target.closest('#header-action-button');
    if (actionBtn) {
      const action = actionBtn.dataset.action;
      if (action === 'log') toggleLogModal(true);
      else if (action === 'add-friend') openAddFriend();
      return;
    }

    // edit friend
    const editBtn = e.target.closest('[data-role="edit-friend"]');
    if (editBtn) {
      const id = editBtn.getAttribute('data-friend-id');
      openEditFriend(id);
      return;
    }

    // delete friend
    const delBtn = e.target.closest('[data-role="delete-friend"]');
    if (delBtn) {
      const id = delBtn.getAttribute('data-friend-id');
      handleDeleteFriend(id);
      return;
    }

    // dismiss modals
    if (e.target.closest('[data-dismiss="modal"]')) {
      toggleLogModal(false);
      toggleAddFriendModal(false);
      return;
    }

    // overlay close
    if (e.target.id === 'log-modal') { toggleLogModal(false); return; }
    if (e.target.id === 'add-friend-modal') { toggleAddFriendModal(false); return; }

    // interaction type select
    const typeBtn = e.target.closest('.interaction-btn');
    if (typeBtn) {
      const { typeBtns } = getLogModalEls();
      typeBtns.forEach(b => b.classList.remove('bg-primary-teal', 'text-white', 'selected'));
      typeBtn.classList.add('bg-primary-teal', 'text-white', 'selected');
      selectedInteractionType = typeBtn.dataset.type;
      return;
    }

    // delete interaction
    const delInteractionBtn = e.target.closest('[data-role="delete-interaction"]');
    if (delInteractionBtn) {
      const id = delInteractionBtn.dataset.id;
      if (confirm('Delete this interaction?')) {
        deleteInteraction(id).then(() => {
          toast({ type:'success', message:'Interaction deleted' });
          go('interactions');
        }).catch(err => {
          console.error('[deleteInteraction]', err);
          toast({ type:'error', message:'Failed to delete interaction' });
        });
      }
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const lm = document.getElementById('log-modal');
      const fm = document.getElementById('add-friend-modal');
      if (lm && !lm.classList.contains('hidden')) toggleLogModal(false);
      if (fm && !fm.classList.contains('hidden')) toggleAddFriendModal(false);
    }
  });

  document.addEventListener('submit', async (e) => {
    if (e.target.closest('#log-form')) {
      e.preventDefault();
      await submitInteraction(e.target);
      return;
    }
    if (e.target.closest('#add-friend-form')) {
      e.preventDefault();
      await submitAddFriend(e.target);
      return;
    }
  });

  // init
  headerBtn.dataset.action = 'log';
  go('dashboard');
});
