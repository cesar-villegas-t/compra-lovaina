const STORE_KEY = 'autolisting.v1';
let items = load();
let view = 'home';
let query = '';
let enter = false;

const TRIP_KEY = 'autolisting.trip.v1';
let trip = loadTrip();
let shopMode = 'card';
let summary = null;
let slide = '';
let lastTap = 0;
let lastProgress = 0;
let toastTimer = null;
let wakeLock = null;

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

// ---- Utilidades de interfaz ----

const $ = (sel) => document.querySelector(sel);

const ICONS = {
  chevron: '<path d="M15 5l-7 7 7 7"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>',
  cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2.5l2.2 11h10.6l2-8H6.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
};

function icon(name) {
  const s = document.createElement('span');
  s.className = 'ico';
  s.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  return s;
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function button(cls, text, onClick, iconName) {
  const b = el('button', cls);
  b.type = 'button';
  if (iconName) b.append(icon(iconName));
  if (text) b.append(el('span', null, text));
  b.addEventListener('click', onClick);
  return b;
}

const catOf = (id) => CATEGORIES.find((c) => c.id === id) || { id, name: 'Otros', icon: '🛒', hue: 150 };

function tinted(node, cat) {
  node.style.setProperty('--h', cat.hue);
  return node;
}

function namesOf(it) {
  const names = el('span', 'names');
  names.append(el('span', 'es', it.es));
  if (it.nl && it.nl.toLowerCase() !== it.es.toLowerCase()) names.append(el('span', 'nl', it.nl));
  return names;
}

function toggleDot(on) {
  const t = el('span', 'toggle');
  t.append(icon(on ? 'check' : 'plus'));
  return t;
}

function popIn(node) {
  node.classList.remove('pop');
  void node.offsetWidth;
  node.classList.add('pop');
}

function go(next) {
  view = next;
  query = '';
  shopMode = 'card';
  summary = null;
  slide = '';
  enter = true;
  hideToast();
  if (next === 'shop') acquireWake(); else releaseWake();
  render();
  window.scrollTo(0, 0);
}

function today() {
  const d = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

// ---- Inicio ----

function renderHome(root) {
  const needed = items.filter((i) => i.need);

  const large = el('div', 'large');
  large.append(el('p', 'eyebrow', 'Lovaina · ' + today()), el('h1', null, 'Mi compra'));

  const panel = el('section', 'panel');
  const head = el('div', 'panel-head');
  head.append(el('h2', null, 'En la lista'), el('span', 'count', needed.length ? String(needed.length) : ''));
  const scroll = el('div', 'panel-scroll');

  if (!needed.length) {
    const empty = el('div', 'empty-state');
    const hero = el('div', 'hero soft');
    hero.append(icon('cart'));
    empty.append(hero, el('h3', null, 'Tu lista está vacía'), el('p', null, 'Toca «Editar» para añadir productos.'));
    scroll.append(empty);
  }
  for (const c of CATEGORIES) {
    const group = needed.filter((i) => i.cat === c.id);
    if (!group.length) continue;
    const wrap = tinted(el('div', 'cat'), c);
    const label = el('div', 'cat-label');
    label.append(el('span', 'dot', c.icon), el('span', null, c.name));
    const chips = el('div', 'chips');
    for (const it of group) chips.append(el('span', 'chip', it.es));
    wrap.append(label, chips);
    scroll.append(wrap);
  }

  panel.append(head, scroll, button('fab', 'Editar', () => go('edit'), 'pencil'));
  const active = trip.bought.length || trip.postponed.length;
  root.append(large, panel,
    button('btn primary buy', active ? 'Continuar compra' : 'Compra', () => go('shop'), 'cart'));
}

// ---- Edición ----

function renderEdit(root) {
  const large = el('div', 'large');
  large.append(el('h1', null, 'Editar lista'), el('p', 'sub'));
  large.lastChild.id = 'edit-count';
  root.append(large);

  const bar = el('div', 'searchbar');
  const search = el('label', 'search');
  const input = el('input');
  input.type = 'search';
  input.placeholder = 'Buscar en español o neerlandés';
  input.value = query;
  input.addEventListener('input', () => { query = input.value; renderEditList(); });
  search.append(icon('search'), input);
  bar.append(search);
  root.append(bar);

  const add = el('details', 'add');
  const summ = el('summary');
  const plus = toggleDot(false);
  summ.append(plus, el('span', null, 'Producto nuevo'));
  add.append(summ);
  const form = el('form');
  const es = el('input'); es.placeholder = 'Nombre'; es.required = true;
  const nl = el('input'); nl.placeholder = 'Nederlands (opcional)';
  const sel = el('select');
  for (const c of CATEGORIES) {
    const o = el('option', null, c.icon + '  ' + c.name); o.value = c.id; sel.append(o);
  }
  const submit = el('button', 'btn primary wide', 'Añadir a la lista');
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
  updateEditCount();
}

function updateEditCount() {
  const n = items.filter((i) => i.need).length;
  const c = $('#edit-count');
  if (c) c.textContent = n === 0 ? 'Toca un producto para añadirlo' : n === 1 ? '1 producto en la lista' : n + ' productos en la lista';
}

function renderEditList() {
  const box = $('#edit-list');
  box.replaceChildren();
  const q = query.trim().toLowerCase();
  for (const c of CATEGORIES) {
    const list = items.filter((i) =>
      i.cat === c.id && (!q || i.es.toLowerCase().includes(q) || (i.nl || '').toLowerCase().includes(q)));
    if (!list.length) continue;
    const h = el('h3', 'section');
    h.append(el('span', null, c.icon), el('span', null, c.name));
    const group = el('div', 'group');
    for (const it of list) group.append(editRow(it));
    box.append(h, group);
  }
  if (!box.children.length) {
    const empty = el('div', 'empty-state');
    empty.append(el('h3', null, 'Nada encontrado'), el('p', null, 'Prueba con otra palabra o crea un producto nuevo.'));
    box.append(empty);
  }
}

function editRow(it) {
  const row = el('button', 'row' + (it.need ? ' on' : ''));
  row.type = 'button';
  const tog = toggleDot(it.need);
  row.append(namesOf(it), tog);
  row.addEventListener('click', () => {
    it.need = !it.need;
    it.done = false;
    it.carry = false;
    save();
    row.classList.toggle('on', it.need);
    tog.replaceChildren(icon(it.need ? 'check' : 'plus'));
    popIn(tog);
    updateEditCount();
  });
  return row;
}

// ---- Compra: un producto cada vez ----

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
  const c = catOf(it.cat);

  const top = el('div', 'shop-top');
  const tag = tinted(el('span', 'tag'), c);
  tag.append(el('span', null, c.icon), el('span', null, c.name));
  const counter = button('counter', (idx + 1) + ' / ' + st.seq.length, () => { shopMode = 'overview'; enter = true; render(); }, null);
  counter.append(icon('down'));
  top.append(tag, counter);

  const pct = st.seq.length ? Math.round((st.bought.length / st.seq.length) * 100) : 0;
  const bar = el('div', 'progress');
  const fill = el('div', 'fill');
  fill.style.width = lastProgress + '%';
  bar.append(fill);
  requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct + '%'; }));
  lastProgress = pct;

  const card = tinted(el('div', 'card' + (isBought ? ' bought' : '') + (slide ? ' slide-' + slide : '')), c);
  slide = '';
  card.append(el('div', 'badge', c.icon), el('div', 'big', it.es));
  if (it.nl && it.nl.toLowerCase() !== it.es.toLowerCase()) card.append(el('div', 'bignl', it.nl));
  if (isBought) {
    const cb = el('div', 'check-badge');
    cb.append(icon('check'));
    card.append(cb);
  }
  card.append(el('div', 'hint', isBought
    ? 'Doble toque para desmarcar'
    : 'Doble toque para marcar · Desliza para navegar'));
  attachGestures(card, st, it, isBought);

  const actions = el('div', 'actions');
  if (!isBought) actions.append(button('btn secondary', 'Posponer', () => postpone(st, it), 'clock'));
  actions.append(isBought
    ? button('btn secondary', 'Desmarcar', () => unmark(it), null)
    : button('btn primary', 'Comprado', () => markBought(st, it), 'check'));
  if (isBought) actions.lastChild.style.flex = '1';
  root.append(top, bar, card, actions);
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

function listRow(it, trailing, cls, onTap) {
  const row = el('button', 'row ' + cls);
  row.type = 'button';
  row.append(namesOf(it));
  if (trailing) row.append(trailing);
  row.addEventListener('click', onTap);
  return row;
}

function renderOverview(root, st) {
  const large = el('div', 'large');
  const n = st.seq.length;
  large.append(el('h1', null, 'Lista completa'),
    el('p', 'sub', st.bought.length + ' de ' + n + ' comprados'));
  root.append(large);

  const jump = (it) => () => { trip.cursor = it.id; shopMode = 'card'; enter = true; saveTrip(); render(); };
  const section = (title, list, trailing, cls, onTap) => {
    if (!list.length) return;
    root.append(el('h3', 'section', title + ' · ' + list.length));
    const group = el('div', 'group');
    for (const it of list) {
      group.append(listRow(it, trailing(it), cls + (it.id === trip.cursor ? ' current' : ''), onTap(it)));
    }
    root.append(group);
  };
  section('Pendientes', st.pending, () => null, '', jump);
  section('Comprados', st.bought, () => {
    const t = el('span', 'toggle on');
    t.append(icon('check'));
    return t;
  }, 'on', jump);
  section('Pospuestos', st.postponed, () => el('span', 'pill', 'Recuperar'), '', (it) => () => recover(it));
  if (!n && !st.postponed.length) {
    const empty = el('div', 'empty-state');
    empty.append(el('h3', null, 'No hay nada en la lista'));
    root.append(empty);
  }
  root.append(button('btn primary wide finish', 'Terminar compra', () => finishTrip(st), 'check'));
}

function renderEnd(root, st) {
  const box = el('div', 'endbox');
  const hero = el('div', 'hero');
  if (st.pending.length) {
    hero.classList.add('soft');
    hero.append(icon('list'));
    box.append(hero, el('p', 'msg', 'Has llegado al final'),
      el('p', 'lead', 'Te faltan ' + st.pending.length + (st.pending.length === 1 ? ' producto.' : ' productos.')),
      button('btn primary', 'Ver pendientes', () => {
        trip.cursor = st.pending[0].id; slide = 'prev'; saveTrip(); render();
      }));
  } else if (st.bought.length) {
    hero.append(icon('check'));
    box.append(hero, el('p', 'msg', '¡Todo comprado!'), el('p', 'lead', 'Buen trabajo. Ya puedes ir a la caja.'));
  } else if (st.postponed.length) {
    hero.classList.add('soft');
    hero.append(icon('clock'));
    box.append(hero, el('p', 'msg', 'Solo quedan pospuestos'),
      button('btn primary', 'Ver pospuestos', () => { shopMode = 'overview'; enter = true; render(); }));
  } else {
    hero.classList.add('soft');
    hero.append(icon('cart'));
    box.append(hero, el('p', 'msg', 'La lista está vacía'),
      button('btn primary', 'Editar lista', () => go('edit'), 'pencil'));
  }
  if (st.bought.length || st.postponed.length) {
    box.append(button('btn secondary', 'Terminar compra', () => finishTrip(st)));
    box.append(button('btn text', 'Ver lista completa', () => { shopMode = 'overview'; enter = true; render(); }));
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
  lastProgress = 0;
  save();
  saveTrip();
  shopMode = 'card';
  enter = true;
  hideToast();
  render();
}

function renderSummary(root) {
  const box = el('div', 'endbox');
  const hero = el('div', 'hero');
  hero.append(icon('check'));
  const lines = [summary.bought + (summary.bought === 1 ? ' comprado' : ' comprados')];
  if (summary.postponed) lines.push(summary.postponed + ' pospuestos: saldrán los primeros la próxima vez');
  if (summary.left) lines.push(summary.left + ' sin comprar siguen en la lista');
  box.append(hero, el('p', 'msg', 'Compra terminada'), el('p', 'lead', lines.join('\n')),
    button('btn primary', 'Volver al inicio', () => go('home')));
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

// ---- Raíz ----

function backLabel() {
  if (view === 'edit') return 'Listo';
  if (view === 'shop' && shopMode === 'overview') return 'Compra';
  return 'Inicio';
}

function render() {
  const root = $('#content');
  root.replaceChildren();
  root.className = view + (enter ? ' enter' : '');
  enter = false;
  const back = $('#back');
  back.hidden = view === 'home';
  if (view !== 'home') back.replaceChildren(icon('chevron'), el('span', null, backLabel()));
  if (view === 'home') renderHome(root);
  else if (view === 'edit') renderEdit(root);
  else renderShop(root);
}

$('#back').addEventListener('click', () => {
  if (view === 'shop' && shopMode === 'overview') { shopMode = 'card'; enter = true; render(); }
  else go('home');
});

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
