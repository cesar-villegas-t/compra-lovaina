const STORE_KEY = 'autolisting.v1';
let items = load();
let view = 'home';
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
  root.append(panel, button('buy', '🛒 Compra', () => go('shop')));
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

function renderShop(root) {
  root.append(el('p', 'empty', 'La pantalla de compra llegará más adelante.'));
}

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

$('#back').addEventListener('click', () => go('home'));

render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
