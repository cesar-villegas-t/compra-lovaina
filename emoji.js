// Fluent Emoji 3D de Microsoft (licencia MIT, ver emoji/LICENSE).
// [archivo sin extensión, palabras clave sin tildes (es / nl) para sugerir icono]
const EMOJI = [
  ['tomato', 'tomate tomaat'], ['onion', 'cebolla ui'], ['garlic', 'ajo knoflook'],
  ['potato', 'patata papa aardappel'], ['carrot', 'zanahoria wortel'], ['bell_pepper', 'pimiento paprika'],
  ['cucumber', 'pepino calabacin komkommer courgette'],
  ['leafy_green', 'lechuga espinaca acelga rucula verdura sla spinazie'],
  ['mushroom', 'champinon champinones seta setas paddenstoel'], ['banana', 'platano banana banaan'],
  ['red_apple', 'manzana appel'], ['green_apple', 'manzana verde'],
  ['tangerine', 'naranja mandarina clementina sinaasappel'], ['lemon', 'limon citroen lima'],
  ['avocado', 'aguacate avocado'], ['strawberry', 'fresa fresas aardbei'], ['grapes', 'uva uvas druiven'],
  ['watermelon', 'sandia watermeloen'], ['melon', 'melon'], ['pineapple', 'pina ananas'],
  ['peach', 'melocoton nectarina albaricoque perzik'], ['pear', 'pera peer'], ['cherries', 'cereza cerezas kers'],
  ['mango', 'mango'], ['kiwi_fruit', 'kiwi'], ['coconut', 'coco kokos'],
  ['blueberries', 'arandano arandanos frutos rojos bosbes'], ['ear_of_corn', 'maiz mais'],
  ['eggplant', 'berenjena aubergine'], ['broccoli', 'brocoli coliflor bloemkool'],
  ['hot_pepper', 'guindilla picante chile peper'], ['ginger_root', 'jengibre gember'],
  ['seedling', 'brotes germinados'], ['herb', 'perejil albahaca cilantro hierbas kruiden'],
  ['olive', 'aceituna aceitunas oliva olijf'], ['green_salad', 'ensalada salade'],
  ['glass_of_milk', 'leche melk'], ['egg', 'huevo huevos ei eieren'], ['butter', 'mantequilla boter margarina'],
  ['bowl_with_spoon', 'yogur yogures yoghurt avena muesli'], ['cheese_wedge', 'queso quesos kaas'],
  ['pouring_liquid', 'nata crema room'], ['ice_cream', 'helado helados ijs'], ['custard', 'flan natillas pudin'],
  ['poultry_leg', 'pollo pavo kip'], ['cut_of_meat', 'carne ternera cerdo filete gehakt vlees'],
  ['meat_on_bone', 'chuleta costillas'], ['bacon', 'jamon bacon beicon chorizo salchichon embutido ham'],
  ['hamburger', 'hamburguesa burger'], ['hot_dog', 'salchicha salchichas worst'],
  ['fish', 'pescado salmon merluza bacalao vis zalm'], ['shrimp', 'gamba gambas langostino garnaal'],
  ['lobster', 'langosta bogavante'], ['crab', 'cangrejo krab'], ['squid', 'calamar pulpo sepia'],
  ['sushi', 'sushi'], ['fried_shrimp', 'rebozado'],
  ['bread', 'pan brood'], ['baguette_bread', 'baguette barra'], ['croissant', 'croissant bollo bolleria'],
  ['bagel', 'bagel'], ['pretzel', 'pretzel'], ['flatbread', 'tortilla tortillas wrap wraps pita'],
  ['stuffed_flatbread', 'kebab'], ['pancakes', 'tortita tortitas pancake'], ['waffle', 'gofre wafel'],
  ['doughnut', 'donut rosquilla'], ['cookie', 'galleta galletas koekje'], ['cupcake', 'magdalena'],
  ['pie', 'tarta empanada pastel taart'], ['shortcake', 'bizcocho'], ['birthday_cake', 'cumpleanos'],
  ['cooked_rice', 'arroz rijst'], ['rice_ball', 'onigiri'], ['spaghetti', 'pasta espagueti macarrones fideos'],
  ['salt', 'sal zout'], ['honey_pot', 'azucar miel suiker honing'],
  ['beans', 'garbanzos lentejas alubias judias legumbres kikkererwten linzen bonen'],
  ['canned_food', 'conserva conservas lata atun sardinas tonijn'],
  ['jar', 'vinagre mermelada salsa mayonesa azijn pot tomate frito'],
  ['pot_of_food', 'sopa caldo guiso soep'], ['bento_box', 'preparada'],
  ['peanuts', 'cacahuete cacahuetes nueces almendras pinda'], ['chestnut', 'castana'],
  ['popcorn', 'palomitas'], ['chocolate_bar', 'chocolate chocolade'], ['candy', 'caramelo caramelos snoep'],
  ['lollipop', 'piruleta chupachups'], ['pizza', 'pizza'], ['sandwich', 'sandwich bocadillo'],
  ['taco', 'taco'], ['burrito', 'burrito'], ['falafel', 'falafel hummus'], ['dumpling', 'empanadilla gyoza'],
  ['french_fries', 'frieten chips'], ['fondue', 'fondue'], ['cooking', 'aceite sarten'],
  ['fork_and_knife_with_plate', 'plato comida'],
  ['hot_beverage', 'cafe koffie'], ['teapot', 'te infusion thee'], ['mate', 'mate'],
  ['droplet', 'agua water'], ['beverage_box', 'zumo sap brik'], ['cup_with_straw', 'refresco batido cola'],
  ['bubble_tea', 'bubble'], ['beer_mug', 'cerveza bier'], ['clinking_beer_mugs', 'cervezas'],
  ['wine_glass', 'vino wijn'], ['bottle_with_popping_cork', 'cava champan'],
  ['tropical_drink', 'coctel'], ['ice', 'hielo'],
  ['roll_of_paper', 'papel higienico cocina wc toiletpapier keukenrol'],
  ['soap', 'jabon gel champu detergente lavadora wasmiddel zeep'],
  ['sponge', 'estropajo lavavajillas esponja fregona afwasmiddel'],
  ['wastebasket', 'basura bolsas vuilniszakken'], ['broom', 'escoba barrer'], ['bucket', 'cubo fregar emmer'],
  ['toothbrush', 'cepillo dientes dental tandpasta'], ['razor', 'maquinilla afeitar'],
  ['shower', 'ducha'], ['bathtub', 'bano'], ['baby_bottle', 'biberon panales bebe'],
  ['pill', 'medicina pastillas ibuprofeno paracetamol'], ['dog_face', 'perro mascota'],
  ['cat_face', 'gato mascota kat'], ['light_bulb', 'bombilla'], ['battery', 'pilas bateria'],
  ['candle', 'vela'], ['basket', 'cesta'], ['package', 'paquete harina'],
  ['shopping_cart', 'otros compra'],
];

const emojiSrc = (id) => 'emoji/' + id + '.png';

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Propone el emoji cuyo vocabulario coincide mejor con el nombre escrito.
function guessEmoji(name) {
  const words = normalize(name).split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  let best = 'shopping_cart';
  let bestScore = 0;
  for (const [id, kws] of EMOJI) {
    const list = kws.split(' ');
    let score = 0;
    for (const w of words) {
      for (const k of list) {
        if (k === w) score = Math.max(score, 3);
        else if (w.length >= 4 && k.length >= 4 && (k.startsWith(w) || w.startsWith(k))) score = Math.max(score, 2);
      }
    }
    if (score > bestScore) { best = id; bestScore = score; }
  }
  return best;
}
