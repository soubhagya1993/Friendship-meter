// frontend/src/js/main.js
import {
  renderDashboard,
  renderFriendsPage,
  renderSettingsPage,
  populateFriendOptions,
  drawWeeklyChart
} from "./ui.js";
import { saveInteraction } from "./api.js";

document.addEventListener("DOMContentLoaded", () => {
  // Static chrome elements (don’t get re-rendered)
  const main = document.getElementById("main-content");
  const headerBtn = document.getElementById("header-action-button");
  const pageTitle = document.getElementById("page-title");
  const pageSubtitle = document.getElementById("page-subtitle");

  let friendsCache = [];
  let selectedInteractionType = null;

  // ---- Mock data (keep as is / swap with real) ----
  const mockStats = [
    { label: "Total Friends", value: "4", subtext: "Active connections", icon: "👥" },
    { label: "This Week", value: "30", subtext: "Total interactions", icon: "📈" },
    { label: "Avg Connection", value: "77%", subtext: "Connection strength", icon: "💚" },
    { label: "Need Attention", value: "4", subtext: "Friends to reach out to", icon: "🗓️" }
  ];
  const mockFriends = [
    {
      id: 1, name: "Saloni Pandey", email: "Saloni@example.com", phone: null,
      preference: "Text/Chat",
      bio: "Loves hiking and photography. Always up for weekend adventures.",
      avatar: "https://placehold.co/48x48/FFA07A/36454F?text=AC",
      interactions: 24, lastContactDays: 582, connection: 85
    },
    {
      id: 2, name: "Sarah Connor", email: "sarah@example.com",
      phone: "+1 (555) 123-4567", preference: "Phone Call",
      bio: "Great listener. Enjoys deep conversations about books and philosophy.",
      avatar: "https://placehold.co/48x48/4DB6AC/FFFFFF?text=SJ",
      interactions: 18, lastContactDays: 585, connection: 72
    }
  ];
  const mockWeeklyActivity = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [3, 5, 2, 7, 4, 6, 3]
  };

  // -------- Helpers (fresh queries prevent stale-node bugs) --------
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
        // ✅ pass (selectEl, friends) per your ui.js signature
        try { populateFriendOptions(friendSelect, friendsCache); } catch {}
        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => friendSelect?.focus(), 0);
    } else {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        form?.reset?.();
        typeBtns.forEach(btn => btn.classList.remove('bg-primary-teal','text-white','selected'));
        selectedInteractionType = null;
    }
 }
//   function getModalEls() {
//     return {
//       modal: document.getElementById("log-modal"),
//       form: document.getElementById("log-form"),
//       typeBtns: document.querySelectorAll(".interaction-btn"),
//       friendSelect: document.querySelector('#log-form select[name="friend"]'),
//       cancelBtn: document.getElementById("cancel-btn")
//     };
//   }
  
  
//   function toggleModal(show) {
//     const { modal, form, typeBtns, friendSelect } = getModalEls();
//     if (!modal) {
//       console.warn("Modal #log-modal not found. Ensure it is OUTSIDE #main-content.");
//       return;
//     }
//     if (show) {
//       try { populateFriendOptions(friendsCache); } catch {}
//       modal.classList.remove("hidden");
//       modal.setAttribute("aria-hidden", "false");
//       setTimeout(() => friendSelect?.focus(), 0);
//     } else {
//       modal.classList.add("hidden");
//       modal.setAttribute("aria-hidden", "true");
//       form?.reset?.();
//       typeBtns.forEach(b => b.classList.remove("bg-primary-teal", "text-white", "selected"));
//       selectedInteractionType = null;
//     }
//   }

  async function submitInteraction(form) {
    const friendId = form.friend?.value;
    if (!friendId || !selectedInteractionType) {
      alert("Please select a friend and an interaction type.");
      return;
    }
    const payload = {
      friendId: Number(friendId),
      type: selectedInteractionType,
      date: new Date().toISOString().slice(0, 10)
    };
    const ok = await saveInteraction(payload);
    if (ok) {
      toggleModal(false);
      // optionally refresh dashboard stats
    } else {
      alert("Failed to log interaction. Please try again.");
    }
  }

  // -------- Navigation (single source of truth) --------
  function go(page) {
    const links = document.querySelectorAll(".nav-link");
    links.forEach(a => a.classList.toggle("active-link", a.dataset.page === page));

    switch (page) {
      case "dashboard":
        pageTitle.textContent = "Your Friendship Dashboard";
        pageSubtitle.textContent = "A mindful way to nurture your meaningful connections";
        headerBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Log Interaction</span>`;
        headerBtn.dataset.action = "log";

        renderDashboard(main, { stats: mockStats, friends: friendsCache, weeklyActivity: mockWeeklyActivity });
        try { drawWeeklyChart(mockWeeklyActivity); } catch (e) { console.error("Chart error:", e); }
        break;

      case "friends":
        pageTitle.textContent = "Manage Friends";
        pageSubtitle.textContent = "Add, edit, and organize your meaningful connections";
        headerBtn.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Add Friend</span>`;
        headerBtn.dataset.action = "add-friend";

        renderFriendsPage(main, friendsCache);
        break;

      case "settings":
        pageTitle.textContent = "Settings";
        pageSubtitle.textContent = "Manage your application";
        headerBtn.innerHTML = "";
        headerBtn.dataset.action = "none";

        renderSettingsPage(main);
        break;
    }
  }

  // -------- Global event delegation (survives re-renders) --------
  document.addEventListener("click", (e) => {
    // Sidebar/top nav links
    const nav = e.target.closest(".nav-link");
    if (nav) {
      e.preventDefault();
      const page = nav.dataset.page;
      if (page === "log") toggleModal(true);
      else go(page);
      return;
    }

    // Header primary action
    const headerAction = e.target.closest("#header-action-button");
    if (headerAction) {
      const action = headerAction.dataset.action;
      if (action === "log") toggleModal(true);
      else if (action === "add-friend") alert("Add Friend form TODO");
      return;
    }

    // Modal dismiss (X, cancel, backdrop)
    if (e.target.closest("[data-dismiss='modal']")) {
      toggleModal(false);
      return;
    }
    
    // Close when clicking the dark overlay (outside the white card)
    if (e.target.id === 'log-modal') {
        toggleModal(false);
        return;
    }

    // Close via any element marked data-dismiss="modal" (e.g., Cancel)
    if (e.target.closest('[data-dismiss="modal"]')) {
        toggleModal(false);
        return;
    }

    // Interaction type pickers
    const typeBtn = e.target.closest(".interaction-btn");
    if (typeBtn) {
      getModalEls().typeBtns.forEach(b => b.classList.remove("bg-primary-teal", "text-white", "selected"));
      typeBtn.classList.add("bg-primary-teal", "text-white", "selected");
      selectedInteractionType = typeBtn.dataset.type;
      return;
    }
  });

  // Modal form submit (delegated)
//   document.addEventListener("submit", async (e) => {
//     const form = e.target.closest("#log-form");
//     if (!form) return;
//     e.preventDefault();
//     await submitInteraction(form);
//   });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const m = document.getElementById('log-modal');
        if (m && !m.classList.contains('hidden')) toggleModal(false);
    }
 });

  // -------- Init --------
  friendsCache = mockFriends;
  headerBtn.dataset.action = "log";
  go("dashboard");
});
