// Zonas genéricas de un súper, en el orden en que se suelen recorrer.
// Productos: [español, neerlandés, emoji]
const ZONES = [
  { id: 'fruta', emoji: 'leafy_green', hue: 140, name: 'Frutas y verduras', items: [
    ['Tomate', 'Tomaat', 'tomato'], ['Cebolla', 'Ui', 'onion'], ['Ajo', 'Knoflook', 'garlic'],
    ['Patata', 'Aardappel', 'potato'], ['Zanahoria', 'Wortel', 'carrot'], ['Pimiento', 'Paprika', 'bell_pepper'],
    ['Pepino', 'Komkommer', 'cucumber'], ['Lechuga', 'Sla', 'leafy_green'], ['Calabacín', 'Courgette', 'cucumber'],
    ['Champiñones', 'Champignons', 'mushroom'], ['Plátano', 'Banaan', 'banana'], ['Manzana', 'Appel', 'red_apple'],
    ['Naranja', 'Sinaasappel', 'tangerine'], ['Limón', 'Citroen', 'lemon'], ['Aguacate', 'Avocado', 'avocado'],
  ]},
  { id: 'pan', emoji: 'baguette_bread', hue: 32, name: 'Panadería', items: [
    ['Pan', 'Brood', 'bread'], ['Tortillas', 'Wraps', 'flatbread'],
  ]},
  { id: 'carne', emoji: 'cut_of_meat', hue: 350, name: 'Carne y pescado', items: [
    ['Pollo', 'Kip', 'poultry_leg'], ['Carne picada', 'Gehakt', 'cut_of_meat'], ['Salmón', 'Zalm', 'fish'],
  ]},
  { id: 'fiambre', emoji: 'cheese_wedge', hue: 50, name: 'Charcutería y quesos', items: [
    ['Jamón', 'Ham', 'bacon'], ['Queso', 'Kaas', 'cheese_wedge'], ['Queso rallado', 'Geraspte kaas', 'cheese_wedge'],
  ]},
  { id: 'lacteos', emoji: 'glass_of_milk', hue: 212, name: 'Lácteos y huevos', items: [
    ['Leche', 'Melk', 'glass_of_milk'], ['Huevos', 'Eieren', 'egg'], ['Mantequilla', 'Boter', 'butter'],
    ['Yogur', 'Yoghurt', 'bowl_with_spoon'], ['Nata', 'Room', 'pouring_liquid'],
  ]},
  { id: 'conservas', emoji: 'canned_food', hue: 172, name: 'Conservas y salsas', items: [
    ['Atún en lata', 'Tonijn', 'canned_food'], ['Tomate frito', 'Tomatensaus', 'jar'],
    ['Garbanzos', 'Kikkererwten', 'beans'], ['Lentejas', 'Linzen', 'beans'],
  ]},
  { id: 'secos', emoji: 'spaghetti', hue: 85, name: 'Pasta, arroz y básicos', items: [
    ['Arroz', 'Rijst', 'cooked_rice'], ['Pasta', 'Pasta', 'spaghetti'], ['Aceite de oliva', 'Olijfolie', 'olive'],
    ['Sal', 'Zout', 'salt'], ['Harina', 'Bloem', 'package'], ['Azúcar', 'Suiker', 'honey_pot'],
    ['Vinagre', 'Azijn', 'jar'],
  ]},
  { id: 'desayuno', emoji: 'hot_beverage', hue: 18, name: 'Desayuno y café', items: [
    ['Café', 'Koffie', 'hot_beverage'], ['Cereales', 'Ontbijtgranen', 'bowl_with_spoon'],
  ]},
  { id: 'bebidas', emoji: 'cup_with_straw', hue: 272, name: 'Bebidas', items: [
    ['Agua', 'Water', 'droplet'], ['Zumo', 'Sap', 'beverage_box'], ['Cerveza', 'Bier', 'beer_mug'],
    ['Vino', 'Wijn', 'wine_glass'],
  ]},
  { id: 'hogar', emoji: 'soap', hue: 235, name: 'Droguería y hogar', items: [
    ['Papel higiénico', 'Toiletpapier', 'roll_of_paper'], ['Detergente ropa', 'Wasmiddel', 'soap'],
    ['Lavavajillas', 'Afwasmiddel', 'sponge'], ['Bolsas de basura', 'Vuilniszakken', 'wastebasket'],
    ['Papel de cocina', 'Keukenrol', 'roll_of_paper'],
  ]},
];

// Categorías de la versión anterior -> zona actual (para migrar datos guardados)
const OLD_ZONES = { despensa: 'secos', limpieza: 'hogar' };
