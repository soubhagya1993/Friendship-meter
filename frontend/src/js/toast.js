// frontend/src/js/toast.js
// Lightweight toast utility for vanilla JS + Tailwind

const ACCENT = {
  success: '#10b981', // emerald-500
  error:   '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  info:    '#0ea5e9', // sky-500
};

const ICON = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

function ensureRoot() {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none';
    root.setAttribute('aria-live','polite');
    root.setAttribute('aria-atomic','true');
    document.body.appendChild(root);
  }
  return root;
}

export function toast({
  message,
  type = 'info',
  duration = 2800,
  dismissible = true,
  actionText,
  onAction
} = {}) {
  const root = ensureRoot();
  const color = ACCENT[type] || ACCENT.info;
  const icon  = ICON[type]  || ICON.info;

  const card = document.createElement('div');
  card.role = 'status';
  card.className =
    'pointer-events-auto w-80 max-w-[90vw] overflow-hidden rounded-lg border border-border-soft bg-white shadow-xl ring-1 ring-black/5 ' +
    'transition duration-200 ease-out transform opacity-0 translate-y-2';

  card.innerHTML = `
    <div class="flex">
      <div class="w-1" style="background:${color}"></div>
      <div class="flex-1 p-3 pr-2 text-sm text-text-primary">
        <div class="flex items-start gap-2">
          <span class="leading-5 mt-[1px]">${icon}</span>
          <div class="flex-1">${message || ''}</div>
          ${dismissible ? `
            <button type="button" aria-label="Close"
              class="ml-2 -mr-1 rounded p-1 text-text-secondary hover:bg-gray-100">
              &times;
            </button>` : ''}
        </div>
        ${actionText ? `
          <button type="button" class="mt-2 text-primary-teal font-semibold hover:underline">
            ${actionText}
          </button>` : ''}
      </div>
    </div>
  `;

  const [closeBtn] = card.querySelectorAll('button[aria-label="Close"]');
  const actionBtn  = actionText ? card.querySelector('button.mt-2') : null;

  let hideTimer;

  function remove() {
    card.classList.add('opacity-0','translate-y-2');
    card.addEventListener('transitionend', () => {
      card.remove();
    }, { once: true });
  }

  // interactions
  if (dismissible && closeBtn) {
    closeBtn.addEventListener('click', remove);
  }
  if (actionBtn && typeof onAction === 'function') {
    actionBtn.addEventListener('click', () => {
      try { onAction(); } finally { remove(); }
    });
  }

  // pause on hover
  card.addEventListener('mouseenter', () => { clearTimeout(hideTimer); });
  card.addEventListener('mouseleave', () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(remove, duration);
  });

  // add to DOM + animate in
  root.appendChild(card);
  requestAnimationFrame(() => {
    card.classList.remove('opacity-0','translate-y-2');
    card.classList.add('opacity-100','translate-y-0');
  });

  // auto-hide
  hideTimer = setTimeout(remove, duration);
}
