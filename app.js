const STORE_KEY = 'autolisting.v1';
let items = load();
let view = 'home';
let query = '';

const TRIP_KEY = 'autolisting.trip.v1';
let trip = loadTrip();
let shopMode = 'card';
let summary = null;
let slide = '';
let lastTap = 0;
let toastTimer = null;
let wakeLock = null;

function loadTrip() {
  try {
    const t = JSON.parse(localStorage.getItem(TRIP_KEY));
    if (t && Array.isArray(t.bought) && Array.isArray(t.postponed)) return t;
  } catch (e) {}
  return { bought: [], postponed: [], cursor: null };
}

function saveTrip() {
  try { localStorage.setItem(TRIP_KEY, JSON.stringify(trip)); } catch (e) {}
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) {}
  return seed();
}

function seed() {
  const out = [];
  for (const c of CATEGORIES) {
    for (const [es, nl] of c.items) {
      out.push({ id: c.id + '-' + es, es, nl, cat: c.id, need: false, done: false });
    }
  }
  return out;
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(items)); } catch (e) {}
}

const $ = (sel) => document.querySelector(sel);

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function button(cls, text, onClick) {
  const b = el('button', cls, text);
  b.type = 'button';
  b.addEventListener('click', onClick);
  return b;
}

function go(next) {
  view = next;
  query = '';
  shopMode = 'card';
  summary = null;
  slide = '';
  hideToast();
  if (next === 'shop') acquireWake(); else releaseWake();
  render();
  window.scrollTo(0, 0);
}

function renderHome(root) {
  const needed = items.filter((i) => i.need);

  const panel = el('section', 'panel');
  const head = el('div', 'panel-head');
  head.append(el('h2', null, 'Mi lista'), el('span', 'count', needed.length ? String(needed.length) : ''));
  const scroll = el('div', 'panel-scroll');

  if (!needed.length) {
    scroll.append(el('p', 'empty', 'Aún no hay nada en la lista.\nToca «Editar» para añadir productos.'));
  }
  for (const c of CATEGORIES) {
    const group = needed.filter((i) => i.cat === c.id);
    if (!group.length) continue;
    scroll.append(el('h3', null, c.name));
    const chips = el('div', 'chips');
    for (const it of group) chips.append(el('span', 'chip', it.es));
    scroll.append(chips);
  }

  panel.append(head, scroll, button('fab', '✎ Editar', () => go('edit')));
  root.append(panel, button('buy', trip.bought.length || trip.postponed.length ? '🛒 Continuar compra' : '🛒 Compra', () => go('shop')));
}

function renderEdit(root) {
  const bar = el('div', 'bar');
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Buscar (es / nl)…';
  search.value = query;
  search.addEventListener('input', () => { query = search.value; renderEditList(); });
  bar.append(search);
  root.append(bar);

  const add = el('details', 'add');
  add.append(el('summary', null, '＋ Producto nuevo'));
  const form = el('form');
  const es = el('input'); es.placeholder = 'Nombre (es)'; es.required = true;
  const nl = el('input'); nl.placeholder = 'Nederlands (opcional)';
  const sel = el('select');
  for (const c of CATEGORIES) {
    const o = el('option', null, c.name); o.value = c.id; sel.append(o);
  }
  const submit = el('button', 'primary', 'Añadir a la lista');
  submit.type = 'submit';
  form.append(es, nl, sel, submit);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = es.value.trim();
    if (!name) return;
    items.push({ id: 'u-' + Date.now(), es: name, nl: nl.value.trim(), cat: sel.value, need: true, done: false, custom: true });
    save();
    render();
  });
  add.append(form);
  root.append(add);

  const box = el('div');
  box.id = 'edit-list';
  root.append(box);
  renderEditList();
}

function renderEditList() {
  const box = $('#edit-list');
  box.replaceChildren();
  const q = query.trim().toLowerCase();
  for (const c of CATEGORIES) {
    const group = items.filter((i) =>
      i.cat === c.id && (!q || i.es.toLowerCase().includes(q) || (i.nl || '').toLowerCase().includes(q)));
    if (!group.length) continue;
    box.append(el('h3', null, c.name));
    for (const it of group) box.append(editRow(it));
  }
  if (!box.children.length) box.append(el('p', 'empty', 'Nada encontrado.'));
}

function editRow(it) {
  const row = el('button', 'item' + (it.need ? ' in' : ''));
  row.type = 'button';
  const names = el('span', 'names');
  names.append(el('span', 'es', it.es));
  if (it.nl && it.nl.toLowerCase() !== it.es.toLowerCase()) names.append(el('span', 'nl', it.nl));
  const mark = el('span', 'mark', it.need ? '✓' : '＋');
  row.append(names, mark);
  row.addEventListener('click', () => {
    it.need = !it.need;
    it.done = false;
    it.carry = false;
    save();
    row.classList.toggle('in', it.need);
    mark.textContent = it.need ? '✓' : '＋';
    $('#title').textContent = editTitle();
  });
  return row;
}

function editTitle() {
  return 'Editar lista · ' + items.filter((i) => i.need).length;
}

// ---- Compra: un producto cada vez ----

function catName(id) {
  return (CATEGORIES.find((c) => c.id === id) || {}).name || '';
}

function aisleRank(it) {
  const r = SHOP_ORDER.indexOf(it.cat);
  return r < 0 ? SHOP_ORDER.length : r;
}

// Pospuestos de la compra anterior primero; después por pasillos.
function inAisleOrder(list) {
  return list.slice().sort((a, b) =>
    (b.carry ? 1 : 0) - (a.carry ? 1 : 0) ||
    aisleRank(a) - aisleRank(b) ||
    items.indexOf(a) - items.indexOf(b));
}

// seq = comprados (en orden de compra) + pendientes: los comprados quedan al principio.
function tripState() {
  const byId = (id) => items.find((i) => i.id === id && i.need);
  const bought = trip.bought.map(byId).filter(Boolean);
  const postponed = trip.postponed.map(byId).filter(Boolean);
  const out = new Set(trip.bought.concat(trip.postponed));
  const pending = inAisleOrder(items.filter((i) => i.need && !out.has(i.id)));
  return { bought, postponed, pending, seq: bought.concat(pending) };
}

function renderShop(root) {
  if (summary) return renderSummary(root);
  const st = tripState();
  if (trip.cursor !== 'end' && !st.seq.some((i) => i.id === trip.cursor)) {
    trip.cursor = st.pending.length ? st.pending[0].id : 'end';
    saveTrip();
  }
  if (shopMode === 'overview') return renderOverview(root, st);
  if (trip.cursor === 'end') return renderEnd(root, st);
  renderCard(root, st);
}

function renderCard(root, st) {
  const idx = st.seq.findIndex((i) => i.id === trip.cursor);
  const it = st.seq[idx];
  const isBought = idx < st.bought.length;

  const top = el('div', 'shop-top');
  top.append(
    el('span', 'tag', catName(it.cat)),
    button('counter', (idx + 1) + ' / ' + st.seq.length + ' ▾', () => { shopMode = 'overview'; render(); }));

  const card = el('div', 'card' + (isBought ? ' bought' : '') + (slide ? ' slide-' + slide : ''));
  slide = '';
  card.append(el('div', 'big', it.es));
  if (it.nl && it.nl.toLowerCase() !== it.es.toLowerCase()) card.append(el('div', 'bignl', it.nl));
  if (isBought) card.append(el('div', 'check', '✓'));
  attachGestures(card, st, it, isBought);

  const actions = el('div', 'actions');
  if (!isBought) actions.append(button('ghost', 'Posponer', () => postpone(st, it)));
  actions.append(button('primary big-btn', isBought ? '↩ Desmarcar' : '✓ Comprado',
    () => (isBought ? unmark(it) : markBought(st, it))));
  root.append(top, card, actions);
}

function attachGestures(card, st, it, isBought) {
  let sx = 0;
  let sy = 0;
  card.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; });
  card.addEventListener('pointerup', (e) => {
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      lastTap = 0;
      step(st, dx < 0 ? 1 : -1);
    } else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const now = Date.now();
      if (now - lastTap < 320) {
        lastTap = 0;
        if (isBought) unmark(it); else markBought(st, it);
      } else {
        lastTap = now;
      }
    }
  });
}

function step(st, dir) {
  const idx = st.seq.findIndex((i) => i.id === trip.cursor);
  let next;
  if (dir > 0) {
    if (trip.cursor === 'end') return;
    next = idx + 1 < st.seq.length ? st.seq[idx + 1].id : 'end';
  } else if (trip.cursor === 'end') {
    if (!st.seq.length) return;
    next = st.seq[st.seq.length - 1].id;
  } else if (idx > 0) {
    next = st.seq[idx - 1].id;
  } else {
    return;
  }
  slide = dir > 0 ? 'next' : 'prev';
  trip.cursor = next;
  saveTrip();
  render();
}

function commitTrip(msg, undo) {
  saveTrip();
  render();
  showToast(msg, () => { undo(); saveTrip(); render(); });
}

function markBought(st, it) {
  const nxt = st.pending[st.pending.indexOf(it) + 1];
  trip.bought.push(it.id);
  trip.cursor = nxt ? nxt.id : 'end';
  slide = 'next';
  commitTrip(it.es + ' comprado', () => {
    trip.bought = trip.bought.filter((x) => x !== it.id);
    trip.cursor = it.id;
    slide = 'prev';
  });
}

function unmark(it) {
  trip.bought = trip.bought.filter((x) => x !== it.id);
  trip.cursor = it.id;
  commitTrip(it.es + ' desmarcado', () => {
    trip.bought.push(it.id);
    trip.cursor = it.id;
  });
}

function postpone(st, it) {
  const nxt = st.pending[st.pending.indexOf(it) + 1];
  trip.postponed.push(it.id);
  trip.cursor = nxt ? nxt.id : 'end';
  slide = 'next';
  commitTrip(it.es + ' pospuesto', () => {
    trip.postponed = trip.postponed.filter((x) => x !== it.id);
    trip.cursor = it.id;
    slide = 'prev';
  });
}

function recover(it) {
  trip.postponed = trip.postponed.filter((x) => x !== it.id);
  trip.cursor = it.id;
  shopMode = 'card';
  saveTrip();
  render();
}

function listRow(it, mark, cls, onTap) {
  const row = el('button', 'item ' + cls);
  row.type = 'button';
  const names = el('span', 'names');
  names.append(el('span', 'es', it.es));
  if (it.nl && it.nl.toLowerCase() !== it.es.toLowerCase()) names.append(el('span', 'nl', it.nl));
  row.append(names, el('span', 'mark', mark));
  row.addEventListener('click', onTap);
  return row;
}

function renderOverview(root, st) {
  const jump = (it) => () => { trip.cursor = it.id; shopMode = 'card'; saveTrip(); render(); };
  const section = (title, list, mark, cls, onTap) => {
    if (!list.length) return;
    root.append(el('h3', null, title + ' (' + list.length + ')'));
    for (const it of list) root.append(listRow(it, mark, cls + (it.id === trip.cursor ? ' in' : ''), onTap(it)));
  };
  section('Pendientes', st.pending, '', '', jump);
  section('Comprados', st.bought, '✓', 'bought-row', jump);
  section('Pospuestos', st.postponed, 'Recuperar', '', (it) => () => recover(it));
  if (!st.seq.length && !st.postponed.length) root.append(el('p', 'empty', 'No hay nada en la lista.'));
  root.append(button('primary finish', 'Terminar compra', () => finishTrip(st)));
}

function renderEnd(root, st) {
  const box = el('div', 'endbox');
  if (st.pending.length) {
    box.append(el('p', 'msg', 'Has llegado al final.\nTe faltan ' + st.pending.length + ' productos.'));
    box.append(button('primary', 'Ver pendientes', () => {
      trip.cursor = st.pending[0].id; saveTrip(); render();
    }));
  } else if (st.bought.length) {
    box.append(el('p', 'msg', '¡Todo comprado! 🎉'));
  } else if (st.postponed.length) {
    box.append(el('p', 'msg', 'Todo lo que queda está pospuesto.'));
    box.append(button('primary', 'Ver pospuestos', () => { shopMode = 'overview'; render(); }));
  } else {
    box.append(el('p', 'msg', 'La lista está vacía.'));
    box.append(button('primary', 'Editar lista', () => go('edit')));
  }
  if (st.bought.length || st.postponed.length) {
    box.append(button('ghost', 'Terminar compra', () => finishTrip(st)));
    box.append(button('ghost', 'Ver lista completa', () => { shopMode = 'overview'; render(); }));
  }
  root.append(box);
}

function finishTrip(st) {
  if (st.pending.length &&
      !confirm('Quedan ' + st.pending.length + ' sin comprar. Se quedan en la lista. ¿Terminar la compra?')) return;
  for (const it of st.bought) { it.need = false; it.carry = false; it.done = false; }
  for (const it of st.postponed) it.carry = true;
  summary = { bought: st.bought.length, postponed: st.postponed.length, left: st.pending.length };
  trip = { bought: [], postponed: [], cursor: null };
  save();
  saveTrip();
  shopMode = 'card';
  hideToast();
  render();
}

function renderSummary(root) {
  const box = el('div', 'endbox');
  box.append(el('p', 'msg', 'Compra terminada ✓'));
  box.append(el('p', 'empty', summary.bought + ' comprados' +
    (summary.postponed ? '\n' + summary.postponed + ' pospuestos: saldrán los primeros la próxima vez' : '') +
    (summary.left ? '\n' + summary.left + ' sin comprar siguen en la lista' : '')));
  box.append(button('primary', 'Volver al inicio', () => go('home')));
  root.append(box);
}

function hideToast() {
  clearTimeout(toastTimer);
  const t = $('#toast');
  if (t) t.remove();
}

function showToast(msg, undo) {
  hideToast();
  const t = el('div', 'toast');
  t.id = 'toast';
  t.append(el('span', null, msg), button('undo', 'Deshacer', () => { hideToast(); undo(); }));
  document.body.append(t);
  toastTimer = setTimeout(hideToast, 5000);
}

async function acquireWake() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) {}
}

function releaseWake() {
  if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && view === 'shop') acquireWake();
});

document.addEventListener('keydown', (e) => {
  if (view !== 'shop' || shopMode !== 'card' || summary) return;
  if (e.key === 'ArrowRight') step(tripState(), 1);
  else if (e.key === 'ArrowLeft') step(tripState(), -1);
});

function render() {
  const root = $('#content');
  root.replaceChildren();
  root.className = view;
  $('#back').hidden = view === 'home';
  $('#title').textContent = view === 'edit' ? editTitle() : view === 'shop' ? 'Compra' : 'Compra Lovaina';
  if (view === 'home') renderHome(root);
  else if (view === 'edit') renderEdit(root);
  else renderShop(root);
}

$('#back').addEventListener('click', () => {
  if (view === 'shop' && shopMode === 'overview') { shopMode = 'card'; render(); }
  else go('home');
});

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
