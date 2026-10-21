// Orden en que se recorre el súper en la pantalla de compra
const SHOP_ORDER = ['fruta', 'pan', 'carne', 'lacteos', 'despensa', 'bebidas', 'limpieza'];

// Catálogo inicial: [español, neerlandés]
const CATEGORIES = [
  { id: 'fruta', name: 'Frutas y verduras', items: [
    ['Tomate', 'Tomaat'], ['Cebolla', 'Ui'], ['Ajo', 'Knoflook'], ['Patata', 'Aardappel'],
    ['Zanahoria', 'Wortel'], ['Pimiento', 'Paprika'], ['Pepino', 'Komkommer'], ['Lechuga', 'Sla'],
    ['Calabacín', 'Courgette'], ['Champiñones', 'Champignons'], ['Plátano', 'Banaan'],
    ['Manzana', 'Appel'], ['Naranja', 'Sinaasappel'], ['Limón', 'Citroen'], ['Aguacate', 'Avocado'],
  ]},
  { id: 'lacteos', name: 'Lácteos y huevos', items: [
    ['Leche', 'Melk'], ['Huevos', 'Eieren'], ['Mantequilla', 'Boter'], ['Yogur', 'Yoghurt'],
    ['Queso', 'Kaas'], ['Queso rallado', 'Geraspte kaas'], ['Nata', 'Room'],
  ]},
  { id: 'carne', name: 'Carne y pescado', items: [
    ['Pollo', 'Kip'], ['Carne picada', 'Gehakt'], ['Jamón', 'Ham'], ['Salmón', 'Zalm'],
    ['Atún en lata', 'Tonijn'],
  ]},
  { id: 'pan', name: 'Panadería', items: [
    ['Pan', 'Brood'], ['Tortillas', 'Wraps'],
  ]},
  { id: 'despensa', name: 'Despensa', items: [
    ['Arroz', 'Rijst'], ['Pasta', 'Pasta'], ['Aceite de oliva', 'Olijfolie'], ['Sal', 'Zout'],
    ['Harina', 'Bloem'], ['Azúcar', 'Suiker'], ['Tomate frito', 'Tomatensaus'],
    ['Garbanzos', 'Kikkererwten'], ['Lentejas', 'Linzen'], ['Café', 'Koffie'],
    ['Cereales', 'Ontbijtgranen'], ['Vinagre', 'Azijn'],
  ]},
  { id: 'bebidas', name: 'Bebidas', items: [
    ['Agua', 'Water'], ['Zumo', 'Sap'], ['Cerveza', 'Bier'], ['Vino', 'Wijn'],
  ]},
  { id: 'limpieza', name: 'Limpieza e higiene', items: [
    ['Papel higiénico', 'Toiletpapier'], ['Detergente ropa', 'Wasmiddel'],
    ['Lavavajillas', 'Afwasmiddel'], ['Bolsas de basura', 'Vuilniszakken'],
    ['Papel de cocina', 'Keukenrol'],
  ]},
];
