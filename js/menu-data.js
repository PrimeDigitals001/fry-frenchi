/* Fry Frenchi menu, from the shop's menu card.
   Loaded fries come in two sizes. Every flavour costs the same. */
window.FF_SIZES = [
  { label: 'Regular', price: 249 },
  { label: 'Large', price: 289 },
];

/* sauce: drizzle colour in the sauce lab. bits: the toppings on top. heat: 0 to 3 chillies. */
window.FF_FLAVOURS = [
  {
    name: 'Cheese Overdose',
    tags: 'Creamy, cheesy, buttery',
    desc: 'The ultimate comfort flavour for the true cheese lover.',
    heat: 0, sauce: '#ffc12e', bits: '#fff3b0', img: 'cheese-fries.jpg',
  },
  {
    name: 'Tandoori Tandav',
    tags: 'Smoky, desi spice, bold and fiery',
    desc: 'A dance of classic Indian spices with a smoky kick.',
    heat: 2, sauce: '#d8461b', bits: '#7a2a10', img: 'masala-fries.jpg',
  },
  {
    name: 'Cheesy Jalapeño Sour',
    tags: 'Cheesy, tangy, slightly sour and spicy',
    desc: 'A zesty, spicy flavour that hits all the right notes.',
    heat: 1, sauce: '#f2d84a', bits: '#5c9a2e', img: 'parmesan-fries.jpg',
  },
  {
    name: 'Chipotle BBQ Smoke',
    tags: 'Smoky, BBQ rich, chipotle warmth',
    desc: 'A savoury, rich BBQ flavour with the subtle heat of chipotle.',
    heat: 1, sauce: '#6b2d17', bits: '#c0522a', img: 'sauce-fries.jpg',
  },
  {
    name: 'Korean Fire Melt',
    tags: 'Garlicky, fiery hot, spicy cheese melt',
    desc: 'An intense, hot flavour with a garlicky, cheesy finish.',
    heat: 3, sauce: '#e3261c', bits: '#fffdf8', img: 'cheese-pour.jpg',
  },
  {
    name: 'Fry Frenchi Special',
    tags: 'Mild sweet with a touch of honey, mild heat, tangy',
    desc: 'Our house special. A perfectly balanced sweet and tangy favourite.',
    heat: 1, sauce: '#f08a24', bits: '#ffd76a', img: 'herb-fries.jpg',
  },
];

window.FF_SIDES = [
  {
    group: 'The classic',
    name: 'The Golden Standard Fries',
    price: 69,
    tags: 'Salted, crisp, golden',
    desc: 'Plain, perfect fries. No sauce, no fuss.',
    img: 'golden-fries.jpg',
  },
  {
    group: 'Other savoury',
    name: 'Loaded Fiesta Nachos',
    price: 289,
    tags: 'Crunchy, cheesy, fresh',
    desc: 'Crunchy tortilla chips piled high with seasoned beans, a blanket of warm cheese sauce, cool sour cream, fresh guacamole and garden veggies.',
    img: 'nachos.jpg',
  },
  {
    group: 'Other savoury',
    name: 'Cheesy Khazana Bites',
    price: 179,
    tags: 'Crispy outside, gooey inside',
    desc: 'Golden fried bites bursting with molten cheese. Served with your choice of savoury dip.',
    img: 'cheese-bites.jpg',
  },
];
