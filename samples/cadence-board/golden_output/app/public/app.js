// Cadence board: front-end controller.
//
// Fully client-side: there is no server and no database. The board lives in the
// browser's localStorage under the key "cadence.board". On first load (empty
// storage) the board is seeded from a fixed, embedded snapshot so a fresh
// browser renders the exact same starting board every time. Every mutation
// (add, edit, move, delete) updates the in-memory state AND writes it straight
// back to localStorage, so reloading the page restores exactly the board you
// left.

const STORAGE_KEY = 'cadence.board';

const COLUMNS = [
  { id: 'backlog', name: 'Backlog' },
  { id: 'in-progress', name: 'In Progress' },
  { id: 'done', name: 'Done' },
];

const PRIORITY_CLASS = { High: 'pill--high', Med: 'pill--med', Low: 'pill--low' };
const PRIORITIES = ['Low', 'Med', 'High'];
const COLUMN_IDS = COLUMNS.map((c) => c.id);

// --- Seed -----------------------------------------------------------------
//
// The canonical starting board. This is the single source of truth for a fresh
// load and is byte-identical to resources/data/seed.json (kept in the repo for
// provenance). It is embedded here so the app is self-contained and renders the
// same eight cards (card-001..card-008) with no network call.

const SEED_BOARD = {
  boardTitle: 'Cadence',
  nextId: 9,
  cards: [
    {
      id: 'card-001',
      title: 'Sketch onboarding flow',
      description:
        'Map the three-screen welcome sequence and the empty-state copy a first-time user sees.',
      priority: 'High',
      tag: 'Design',
      column: 'backlog',
      order: 0,
    },
    {
      id: 'card-002',
      title: 'Audit color contrast',
      description:
        'Run every text and surface pairing through a WCAG AA check and log the failures.',
      priority: 'Med',
      tag: 'Design',
      column: 'backlog',
      order: 1,
    },
    {
      id: 'card-003',
      title: 'Draft weekly changelog',
      description:
        'Summarize shipped work in plain language for the Friday subscriber email.',
      priority: 'Low',
      tag: 'Writing',
      column: 'backlog',
      order: 2,
    },
    {
      id: 'card-004',
      title: 'Wire persistence route',
      description:
        'Connect the board to the JSON file API so a reload restores the last saved state.',
      priority: 'High',
      tag: 'Engineering',
      column: 'in-progress',
      order: 0,
    },
    {
      id: 'card-005',
      title: 'Tune card hover states',
      description:
        'Add the lift shadow and border accent without introducing layout shift.',
      priority: 'Med',
      tag: 'Design',
      column: 'in-progress',
      order: 1,
    },
    {
      id: 'card-006',
      title: 'Set up keyboard focus rings',
      description:
        'Make every interactive control reachable and visible when tabbing through the board.',
      priority: 'Med',
      tag: 'Engineering',
      column: 'done',
      order: 0,
    },
    {
      id: 'card-007',
      title: 'Name the columns',
      description:
        'Settle on Backlog, In Progress, and Done after reviewing three naming options.',
      priority: 'Low',
      tag: 'Writing',
      column: 'done',
      order: 1,
    },
    {
      id: 'card-008',
      title: 'Pick the accent palette',
      description:
        'Lock the indigo and amber pairing and record the hex values in the design tokens.',
      priority: 'High',
      tag: 'Design',
      column: 'done',
      order: 2,
    },
  ],
};

// --- State ----------------------------------------------------------------

const state = {
  cards: [],
  nextId: 1,
  filterTag: 'all',
};

// --- DOM handles ----------------------------------------------------------

const els = {
  board: document.getElementById('board'),
  loading: document.querySelector('[data-loading]'),
  tagFilter: document.querySelector('[data-filter]'),
  clearFilter: document.querySelector('[data-clear-filter]'),
  addCard: document.querySelector('[data-add-card]'),
  modal: document.querySelector('[data-modal]'),
  modalTitle: document.querySelector('[data-modal-title]'),
  form: document.querySelector('[data-card-form]'),
  fieldId: document.querySelector('[data-field-id]'),
  fieldTitle: document.querySelector('[data-field-title]'),
  fieldDescription: document.querySelector('[data-field-description]'),
  fieldPriority: document.querySelector('[data-field-priority]'),
  fieldTag: document.querySelector('[data-field-tag]'),
  titleError: document.querySelector('[data-title-error]'),
  tagSuggestions: document.querySelector('[data-tag-suggestions]'),
  formSubmit: document.querySelector('[data-form-submit]'),
  toast: document.querySelector('[data-toast]'),
  toastMessage: document.querySelector('[data-toast-message]'),
};

let lastFocused = null;
let toastTimer = null;

// --- Store (localStorage as the source of truth) --------------------------
//
// All persistence logic lives here. The board is a single JSON object kept
// under STORAGE_KEY. The store mirrors what a tiny backend would do: mint
// stable ids, keep an ascending order within each column, and validate input
// at the boundary. It throws on bad input so the UI can surface a message,
// exactly as a failed request would.

function deepCloneBoard(board) {
  return {
    boardTitle: board.boardTitle,
    nextId: board.nextId,
    cards: board.cards.map((card) => ({ ...card })),
  };
}

function normalizeBoard(raw) {
  // Defensive: never trust whatever is sitting in localStorage. Fall back to a
  // well-formed shape so the app always renders rather than throwing.
  const board = raw && typeof raw === 'object' ? raw : {};
  const cards = Array.isArray(board.cards) ? board.cards : [];
  const nextId = typeof board.nextId === 'number' ? board.nextId : cards.length + 1;
  return {
    boardTitle: typeof board.boardTitle === 'string' ? board.boardTitle : 'Cadence',
    nextId,
    cards,
  };
}

function readBoard() {
  let raw = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (_) {
    // localStorage can be unavailable (private mode / blocked). Fall back to
    // the seed so the board still renders for the session.
    return deepCloneBoard(SEED_BOARD);
  }
  if (raw === null) {
    // Fresh load: seed the board and persist it so the first render is the
    // deterministic eight-card seed and survives the next reload.
    const seeded = deepCloneBoard(SEED_BOARD);
    writeBoard(seeded);
    return seeded;
  }
  try {
    return normalizeBoard(JSON.parse(raw));
  } catch (_) {
    // Corrupt JSON: reset to the seed rather than leaving the user stuck.
    const seeded = deepCloneBoard(SEED_BOARD);
    writeBoard(seeded);
    return seeded;
  }
}

function writeBoard(board) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  } catch (_) {
    // If we cannot persist (quota / blocked), surface it to the caller so the
    // UI can warn; the in-memory state still reflects the change.
    throw new Error('Could not save to this browser.');
  }
}

function persistState() {
  writeBoard({
    boardTitle: SEED_BOARD.boardTitle,
    nextId: state.nextId,
    cards: state.cards,
  });
}

function sanitizeText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function nextCardId() {
  const id = `card-${String(state.nextId).padStart(3, '0')}`;
  state.nextId += 1;
  return id;
}

function maxOrderInColumn(column) {
  const orders = state.cards
    .filter((c) => c.column === column)
    .map((c) => (typeof c.order === 'number' ? c.order : 0));
  return orders.length ? Math.max(...orders) : -1;
}

// Create a card from validated input. Mirrors POST /api/cards: new cards land
// at the bottom of Backlog. Throws on invalid input.
function createCard(input) {
  const title = sanitizeText(input.title, 120);
  if (!title) throw new Error('title is required');
  const priority = sanitizeText(input.priority, 8);
  if (!PRIORITIES.includes(priority)) {
    throw new Error(`priority must be one of ${PRIORITIES.join(', ')}`);
  }
  const card = {
    id: nextCardId(),
    title,
    description: sanitizeText(input.description, 600),
    priority,
    tag: sanitizeText(input.tag, 40) || 'General',
    column: 'backlog',
    order: maxOrderInColumn('backlog') + 1,
  };
  state.cards.push(card);
  persistState();
  return card;
}

// Update a card in place. Mirrors PUT /api/cards/:id: a column change moves the
// card to the bottom of the new column. Throws on invalid input or missing id.
function updateCard(id, input) {
  const card = state.cards.find((c) => c.id === id);
  if (!card) throw new Error('Card not found.');

  const patch = {};
  if (input.title !== undefined) {
    const title = sanitizeText(input.title, 120);
    if (!title) throw new Error('title is required');
    patch.title = title;
  }
  if (input.description !== undefined) {
    patch.description = sanitizeText(input.description, 600);
  }
  if (input.priority !== undefined) {
    const priority = sanitizeText(input.priority, 8);
    if (!PRIORITIES.includes(priority)) {
      throw new Error(`priority must be one of ${PRIORITIES.join(', ')}`);
    }
    patch.priority = priority;
  }
  if (input.tag !== undefined) {
    patch.tag = sanitizeText(input.tag, 40) || 'General';
  }
  if (input.column !== undefined) {
    const column = sanitizeText(input.column, 20);
    if (!COLUMN_IDS.includes(column)) {
      throw new Error(`column must be one of ${COLUMN_IDS.join(', ')}`);
    }
    if (column !== card.column) {
      patch.column = column;
      patch.order = maxOrderInColumn(column) + 1;
    }
  }

  Object.assign(card, patch);
  persistState();
  return card;
}

// Remove a card. Mirrors DELETE /api/cards/:id. Throws on missing id.
function deleteCardById(id) {
  const before = state.cards.length;
  state.cards = state.cards.filter((c) => c.id !== id);
  if (state.cards.length === before) throw new Error('Card not found.');
  persistState();
}

// --- Rendering ------------------------------------------------------------

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function priorityPill(priority) {
  const cls = PRIORITY_CLASS[priority] || 'pill--med';
  return `<span class="pill ${cls}"><span class="pill__dot"></span>${escapeHtml(
    priority,
  )}</span>`;
}

function tagChip(tag) {
  if (!tag) return '';
  return `<span class="chip"><svg class="chip__icon" aria-hidden="true"><use href="#i-tag" /></svg>${escapeHtml(
    tag,
  )}</span>`;
}

function cardMarkup(card, columnIndex) {
  const canLeft = columnIndex > 0;
  const canRight = columnIndex < COLUMNS.length - 1;
  const desc = card.description
    ? `<p class="card__desc">${escapeHtml(card.description)}</p>`
    : '';

  return `
    <article class="card" data-card-id="${escapeHtml(card.id)}">
      <div class="card__top">
        ${priorityPill(card.priority)}
        ${tagChip(card.tag)}
      </div>
      <h3 class="card__title">${escapeHtml(card.title)}</h3>
      ${desc}
      <div class="card__foot">
        <button
          class="move move--left"
          type="button"
          data-move="left"
          aria-label="Move ${escapeHtml(card.title)} left"
          ${canLeft ? '' : 'disabled'}
        >
          <svg class="move__icon" aria-hidden="true"><use href="#i-chevron-left" /></svg>
          Move
        </button>
        <button
          class="move move--right"
          type="button"
          data-move="right"
          aria-label="Move ${escapeHtml(card.title)} right"
          ${canRight ? '' : 'disabled'}
        >
          Move
          <svg class="move__icon" aria-hidden="true"><use href="#i-chevron-right" /></svg>
        </button>
        <span class="card__spacer"></span>
        <button
          class="icon-btn icon-btn--edit"
          type="button"
          data-edit
          aria-label="Edit ${escapeHtml(card.title)}"
        >
          <svg aria-hidden="true"><use href="#i-pencil" /></svg>
        </button>
        <button
          class="icon-btn icon-btn--danger"
          type="button"
          data-delete
          aria-label="Delete ${escapeHtml(card.title)}"
        >
          <svg aria-hidden="true"><use href="#i-trash" /></svg>
        </button>
      </div>
    </article>
  `;
}

function emptyMarkup() {
  return `
    <div class="empty">
      <svg class="empty__icon" aria-hidden="true"><use href="#i-inbox" /></svg>
      <p class="empty__text">Nothing here yet</p>
      <p class="empty__hint">Cards you add or move will show up in this column.</p>
    </div>
  `;
}

function visibleCards() {
  if (state.filterTag === 'all') return state.cards;
  return state.cards.filter((c) => c.tag === state.filterTag);
}

function columnCardsFor(columnId, cards) {
  return cards
    .filter((c) => c.column === columnId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function renderBoard() {
  const cards = visibleCards();
  // Counts reflect the filtered view so the header stays honest under a filter.
  els.board.setAttribute('aria-busy', 'false');

  els.board.innerHTML = COLUMNS.map((col, index) => {
    const colCards = columnCardsFor(col.id, cards);
    const body = colCards.length
      ? colCards.map((c) => cardMarkup(c, index)).join('')
      : emptyMarkup();
    return `
      <section class="column" data-column="${col.id}">
        <header class="column__head">
          <span class="column__dot" aria-hidden="true"></span>
          <span class="column__name">${col.name}</span>
          <span class="column__count" data-count>${colCards.length}</span>
        </header>
        <div class="column__list" data-list>${body}</div>
      </section>
    `;
  }).join('');
}

function renderTagControls() {
  const tags = Array.from(new Set(state.cards.map((c) => c.tag).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  );

  // Filter dropdown (preserve current selection if it still exists).
  const current = state.filterTag;
  els.tagFilter.innerHTML =
    `<option value="all">All tags</option>` +
    tags
      .map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`)
      .join('');
  els.tagFilter.value = tags.includes(current) || current === 'all' ? current : 'all';
  state.filterTag = els.tagFilter.value;
  els.clearFilter.hidden = state.filterTag === 'all';

  // Datalist suggestions for the editor.
  els.tagSuggestions.innerHTML = tags
    .map((t) => `<option value="${escapeHtml(t)}"></option>`)
    .join('');
}

function render() {
  renderTagControls();
  renderBoard();
}

// --- Toast ----------------------------------------------------------------

function showToast(message) {
  els.toastMessage.textContent = message;
  els.toast.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 4000);
}

// --- Modal ----------------------------------------------------------------

function openModal(mode, card) {
  lastFocused = document.activeElement;
  els.form.reset();
  els.titleError.hidden = true;
  els.fieldTitle.removeAttribute('aria-invalid');

  if (mode === 'edit' && card) {
    els.modalTitle.textContent = 'Edit card';
    els.formSubmit.textContent = 'Save changes';
    els.fieldId.value = card.id;
    els.fieldTitle.value = card.title;
    els.fieldDescription.value = card.description || '';
    els.fieldPriority.value = card.priority || 'Med';
    els.fieldTag.value = card.tag || '';
  } else {
    els.modalTitle.textContent = 'Add a card';
    els.formSubmit.textContent = 'Save card';
    els.fieldId.value = '';
    els.fieldPriority.value = 'Med';
  }

  els.modal.hidden = false;
  window.requestAnimationFrame(() => els.fieldTitle.focus());
}

function closeModal() {
  els.modal.hidden = true;
  if (lastFocused && typeof lastFocused.focus === 'function') {
    lastFocused.focus();
  }
}

// --- Actions --------------------------------------------------------------

function loadBoard() {
  try {
    const board = readBoard();
    state.cards = Array.isArray(board.cards) ? board.cards : [];
    state.nextId = board.nextId || state.cards.length + 1;
    render();
  } catch (err) {
    els.board.setAttribute('aria-busy', 'false');
    els.board.innerHTML = `
      <div class="board__loading">
        <p>We could not load the board. Please refresh to try again.</p>
      </div>`;
    showToast('Could not load the board.');
  }
}

function submitForm(event) {
  event.preventDefault();
  const id = els.fieldId.value.trim();
  const title = els.fieldTitle.value.trim();

  if (!title) {
    els.titleError.hidden = false;
    els.fieldTitle.setAttribute('aria-invalid', 'true');
    els.fieldTitle.focus();
    return;
  }

  const payload = {
    title,
    description: els.fieldDescription.value.trim(),
    priority: els.fieldPriority.value,
    tag: els.fieldTag.value.trim() || 'General',
  };

  els.formSubmit.disabled = true;
  try {
    if (id) {
      updateCard(id, payload);
    } else {
      createCard(payload);
    }
    render();
    closeModal();
  } catch (err) {
    showToast(err.message || 'Could not save the card.');
  } finally {
    els.formSubmit.disabled = false;
  }
}

function moveCard(card, direction) {
  const index = COLUMNS.findIndex((c) => c.id === card.column);
  const targetIndex = direction === 'left' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= COLUMNS.length) return;
  const targetColumn = COLUMNS[targetIndex].id;

  try {
    updateCard(card.id, { column: targetColumn });
    render();
  } catch (err) {
    showToast(err.message || 'Could not move the card.');
  }
}

function deleteCard(card) {
  try {
    deleteCardById(card.id);
    render();
  } catch (err) {
    showToast(err.message || 'Could not delete the card.');
  }
}

// --- Event wiring ---------------------------------------------------------

function cardFromEvent(target) {
  const article = target.closest('[data-card-id]');
  if (!article) return null;
  const id = article.getAttribute('data-card-id');
  return state.cards.find((c) => c.id === id) || null;
}

function onBoardClick(event) {
  const moveBtn = event.target.closest('[data-move]');
  const editBtn = event.target.closest('[data-edit]');
  const deleteBtn = event.target.closest('[data-delete]');
  if (!moveBtn && !editBtn && !deleteBtn) return;

  const card = cardFromEvent(event.target);
  if (!card) return;

  if (moveBtn) moveCard(card, moveBtn.getAttribute('data-move'));
  else if (editBtn) openModal('edit', card);
  else if (deleteBtn) deleteCard(card);
}

function onModalClick(event) {
  if (event.target.closest('[data-modal-dismiss]')) {
    closeModal();
  }
}

function onKeydown(event) {
  if (event.key === 'Escape' && !els.modal.hidden) {
    closeModal();
  }
}

function onFilterChange() {
  state.filterTag = els.tagFilter.value;
  els.clearFilter.hidden = state.filterTag === 'all';
  renderBoard();
}

function onClearFilter() {
  state.filterTag = 'all';
  els.tagFilter.value = 'all';
  els.clearFilter.hidden = true;
  renderBoard();
}

function init() {
  els.addCard.addEventListener('click', () => openModal('add'));
  els.board.addEventListener('click', onBoardClick);
  els.modal.addEventListener('click', onModalClick);
  els.form.addEventListener('submit', submitForm);
  els.tagFilter.addEventListener('change', onFilterChange);
  els.clearFilter.addEventListener('click', onClearFilter);
  document.addEventListener('keydown', onKeydown);
  loadBoard();
}

init();

// Expose the store for headless verification (no effect on the UI). This lets a
// Node/JSDOM harness exercise the localStorage data layer directly.
if (typeof window !== 'undefined') {
  window.__cadence = {
    STORAGE_KEY,
    SEED_BOARD,
    state,
    readBoard,
    writeBoard,
    createCard,
    updateCard,
    deleteCardById,
  };
}
