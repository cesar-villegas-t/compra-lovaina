const STORE_KEY = 'autolisting.v1';
let items = load();
let view = 'lista';
let editing = false;
let query = '';

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
const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function itemRow(it, onTap, state) {
  const row = el('button', 'item ' + (state || ''));
  row.type = 'button';
  const names = el('span', 'names');
  names.append(el('span', 'es', it.es));
  if (it.nl && it.nl.toLowerCase() !== it.es.toLowerCase()) names.append(el('span', 'nl', it.nl));
  row.append(names, el('span', 'mark', state === 'checked' ? '✓' : state === 'in' ? '＋' : ''));
  row.addEventListener('click', onTap);
  return row;
}

function renderList() {
  const root = $('#content');
  root.replaceChildren();
  const need = items.filter((i) => i.need && !i.done);
  const done = items.filter((i) => i.need && i.done);

  if (!need.length && !done.length) {
    root.append(el('p', 'empty', 'La lista está vacía. Ve a «Catálogo» y toca lo que necesites.'));
  }

  for (const c of CATEGORIES.concat([{ id: 'otros', name: 'Otros' }])) {
    const group = need.filter((i) => i.cat === c.id);
    if (!group.length) continue;
    root.append(el('h2', null, c.name));
    for (const it of group) {
      root.append(itemRow(it, () => { it.done = true; commit(); }, 'todo'));
    }
  }

  if (done.length) {
    root.append(el('h2', 'done-h', 'Comprado (' + done.length + ')'));
    for (const it of done) {
      root.append(itemRow(it, () => { it.done = false; commit(); }, 'checked'));
    }
    const btn = el('button', 'primary', 'Nueva compra (vaciar comprados)');
    btn.type = 'button';
    btn.addEventListener('click', () => {
      for (const it of items) if (it.done) { it.need = false; it.done = false; }
      commit();
    });
    root.append(btn);
  }
}

function renderCatalog() {
  const root = $('#content');
  root.replaceChildren();

  const bar = el('div', 'bar');
  const search = el('input');
  search.type = 'search';
  search.placeholder = 'Buscar (es / nl)…';
  search.value = query;
  search.addEventListener('input', () => { query = search.value; renderCatalogList(); });
  const editBtn = el('button', 'ghost', editing ? 'Listo' : 'Editar');
  editBtn.type = 'button';
  editBtn.addEventListener('click', () => { editing = !editing; render(); });
  bar.append(search, editBtn);
  root.append(bar);

  const add = el('form', 'add');
  const es = el('input'); es.placeholder = 'Nuevo producto (es)'; es.required = true;
  const nl = el('input'); nl.placeholder = 'Nederlands (opcional)';
  const sel = el('select');
  for (const c of CATEGORIES) {
    const o = el('option', null, c.name); o.value = c.id; sel.append(o);
  }
  const go = el('button', 'primary', 'Añadir al catálogo y a la lista');
  go.type = 'submit';
  add.append(es, nl, sel, go);
  add.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = es.value.trim();
    if (!name) return;
    items.push({ id: 'u-' + Date.now(), es: name, nl: nl.value.trim(), cat: sel.value, need: true, done: false, custom: true });
    commit();
  });
  root.append(add);

  const listBox = el('div');
  listBox.id = 'cat-list';
  root.append(listBox);
  renderCatalogList();
}

function renderCatalogList() {
  const box = $('#cat-list');
  if (!box) return;
  box.replaceChildren();
  const q = query.trim().toLowerCase();
  for (const c of CATEGORIES) {
    const group = items.filter((i) =>
      i.cat === c.id && (!q || i.es.toLowerCase().includes(q) || (i.nl || '').toLowerCase().includes(q)));
    if (!group.length) continue;
    box.append(el('h2', null, c.name));
    for (const it of group) {
      if (editing) {
        const row = itemRow(it, () => {
          if (confirm('¿Quitar «' + it.es + '» del catálogo?')) {
            items = items.filter((x) => x !== it);
            commit();
          }
        }, 'edit');
        row.querySelector('.mark').textContent = '🗑';
        box.append(row);
      } else {
        const state = it.need ? 'in' : '';
        const row = itemRow(it, () => {
          it.need = !it.need;
          it.done = false;
          commit();
        }, state);
        if (it.need) row.querySelector('.mark').textContent = '✓ en lista';
        box.append(row);
      }
    }
  }
  if (!box.children.length) box.append(el('p', 'empty', 'Nada encontrado.'));
}

function render() {
  document.querySelectorAll('nav button').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === view));
  const pending = items.filter((i) => i.need && !i.done).length;
  $('#badge').textContent = pending ? String(pending) : '';
  if (view === 'lista') renderList(); else renderCatalog();
}

function commit() {
  save();
  const y = window.scrollY;
  render();
  window.scrollTo(0, y);
}

document.querySelectorAll('nav button').forEach((b) =>
  b.addEventListener('click', () => { view = b.dataset.view; editing = false; render(); window.scrollTo(0, 0); }));

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
