// ============================================
// MOCK DISHES SERVICE
// Retourne des plats réalistes basés sur le type de restaurant
// ============================================

// Import des restaurants autour de 42
import { findRestaurant42ByName } from '../data/restaurants42.js'

// Plats par catégorie de restaurant
const DISHES_BY_TYPE = {
  // ============================================
  // RESTAURANTS ASIATIQUES
  // ============================================
  asian: [
    // VÉGÉTARIEN
    {
      id: 'a-1',
      name: 'Pad Thaï Végétarien',
      description: 'Nouilles de riz sautées au tofu, légumes croquants, cacahuètes, citron vert',
      price: 12.90,
      vegetarian: true,
      vegan: true,
      allergens: ['arachides', 'soja', 'gluten']
    },
    {
      id: 'a-2',
      name: 'Curry Vert Légumes',
      description: 'Curry thaï au lait de coco, légumes de saison, basilic thaï, riz jasmin',
      price: 13.50,
      vegetarian: true,
      vegan: true,
      allergens: []
    },
    {
      id: 'a-3',
      name: 'Nems Végétariens (4 pcs)',
      description: 'Nems croustillants aux légumes, sauce nuoc mam végétale',
      price: 6.90,
      vegetarian: true,
      vegan: true,
      allergens: ['gluten', 'soja']
    },
    {
      id: 'a-4',
      name: 'Riz Sauté aux Légumes',
      description: 'Riz sauté au wok, œuf, légumes variés, sauce soja',
      price: 10.90,
      vegetarian: true,
      vegan: false,
      allergens: ['oeufs', 'soja', 'gluten']
    },
    {
      id: 'a-5',
      name: 'Soupe Miso',
      description: 'Bouillon miso, tofu soyeux, wakame, oignons verts',
      price: 4.90,
      vegetarian: true,
      vegan: true,
      allergens: ['soja']
    },
    {
      id: 'a-6',
      name: 'Edamame',
      description: 'Fèves de soja vapeur, fleur de sel',
      price: 5.50,
      vegetarian: true,
      vegan: true,
      allergens: ['soja']
    },
    // NON-VÉGÉTARIEN
    {
      id: 'a-7',
      name: 'Pad Thaï Crevettes',
      description: 'Nouilles de riz sautées aux crevettes, cacahuètes, citron vert',
      price: 14.90,
      vegetarian: false,
      vegan: false,
      allergens: ['crustacés', 'arachides', 'soja', 'gluten']
    },
    {
      id: 'a-8',
      name: 'Poulet Thaï Basilic',
      description: 'Émincé de poulet sauté au basilic thaï, piment, riz jasmin',
      price: 13.90,
      vegetarian: false,
      vegan: false,
      allergens: ['soja']
    },
    {
      id: 'a-9',
      name: 'Bœuf Loc Lac',
      description: 'Bœuf sauté à la citronnelle, oignons, poivrons, riz',
      price: 15.90,
      vegetarian: false,
      vegan: false,
      allergens: ['soja']
    },
    {
      id: 'a-10',
      name: 'Canard Laqué',
      description: 'Canard laqué croustillant, crêpes, concombre, ciboule',
      price: 18.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'soja']
    },
    {
      id: 'a-11',
      name: 'Nems au Porc (4 pcs)',
      description: 'Nems traditionnels au porc et légumes',
      price: 6.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'soja']
    },
    {
      id: 'a-12',
      name: 'Bo Bun',
      description: 'Vermicelles, bœuf sauté, nems, crudités, cacahuètes',
      price: 14.50,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'arachides', 'soja']
    }
  ],

  // ============================================
  // RESTAURANTS JAPONAIS / SUSHI
  // ============================================
  japanese: [
    {
      id: 'j-1',
      name: 'Maki Avocat (6 pcs)',
      description: 'Avocat, riz vinaigré, nori',
      price: 5.90,
      vegetarian: true,
      vegan: true,
      allergens: ['sésame']
    },
    {
      id: 'j-2',
      name: 'Maki Concombre (6 pcs)',
      description: 'Concombre frais, riz vinaigré, nori',
      price: 4.90,
      vegetarian: true,
      vegan: true,
      allergens: ['sésame']
    },
    {
      id: 'j-3',
      name: 'California Végétarien (6 pcs)',
      description: 'Avocat, concombre, carotte, mayonnaise végétale',
      price: 7.90,
      vegetarian: true,
      vegan: true,
      allergens: ['sésame', 'soja']
    },
    {
      id: 'j-4',
      name: 'Tempura de Légumes',
      description: 'Assortiment de légumes en beignet léger, sauce tentsuyu',
      price: 9.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'oeufs']
    },
    {
      id: 'j-5',
      name: 'Salade de Choux',
      description: 'Chou blanc émincé, carotte, sauce sésame',
      price: 4.90,
      vegetarian: true,
      vegan: true,
      allergens: ['sésame']
    },
    {
      id: 'j-6',
      name: 'Riz Nature',
      description: 'Bol de riz japonais nature',
      price: 3.00,
      vegetarian: true,
      vegan: true,
      allergens: []
    }
  ],

  // ============================================
  // PIZZERIAS / ITALIEN
  // ============================================
  italian: [
    // VÉGÉTARIEN
    {
      id: 'i-1',
      name: 'Pizza Margherita',
      description: 'Sauce tomate, mozzarella fior di latte, basilic frais',
      price: 11.00,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'i-2',
      name: 'Pizza Végétarienne',
      description: 'Sauce tomate, mozzarella, poivrons, champignons, oignons, olives',
      price: 13.50,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'i-3',
      name: 'Pizza Marinara',
      description: 'Sauce tomate, ail, origan, huile d\'olive - Sans fromage',
      price: 9.00,
      vegetarian: true,
      vegan: true,
      allergens: ['gluten']
    },
    {
      id: 'i-4',
      name: 'Pâtes Arrabiata',
      description: 'Penne, sauce tomate épicée, ail, persil',
      price: 11.90,
      vegetarian: true,
      vegan: true,
      allergens: ['gluten']
    },
    {
      id: 'i-5',
      name: 'Risotto aux Champignons',
      description: 'Risotto crémeux aux champignons de saison, parmesan',
      price: 14.90,
      vegetarian: true,
      vegan: false,
      allergens: ['lait']
    },
    {
      id: 'i-6',
      name: 'Bruschetta Tomate',
      description: 'Tomates fraîches, basilic, ail, huile d\'olive',
      price: 7.90,
      vegetarian: true,
      vegan: true,
      allergens: ['gluten']
    },
    // NON-VÉGÉTARIEN
    {
      id: 'i-7',
      name: 'Pizza Diavola',
      description: 'Sauce tomate, mozzarella, salami piquant, piments',
      price: 13.50,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'i-8',
      name: 'Pizza Regina',
      description: 'Sauce tomate, mozzarella, jambon, champignons',
      price: 13.00,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'i-9',
      name: 'Pizza Calzone',
      description: 'Chausson farci jambon, mozzarella, champignons, œuf',
      price: 14.50,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'i-10',
      name: 'Spaghetti Carbonara',
      description: 'Spaghetti, pancetta, œuf, parmesan, poivre noir',
      price: 13.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'i-11',
      name: 'Spaghetti Bolognaise',
      description: 'Spaghetti, sauce à la viande de bœuf mijotée, parmesan',
      price: 13.50,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'i-12',
      name: 'Saltimbocca',
      description: 'Escalope de veau, jambon de Parme, sauge, vin blanc',
      price: 18.90,
      vegetarian: false,
      vegan: false,
      allergens: ['sulfites']
    },
    {
      id: 'i-13',
      name: 'Tiramisu',
      description: 'Mascarpone, biscuits, café, cacao',
      price: 7.00,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    }
  ],

  // ============================================
  // CAFÉS / BISTROT
  // ============================================
  cafe: [
    {
      id: 'c-1',
      name: 'Croissant',
      description: 'Croissant pur beurre, doré et feuilleté',
      price: 2.20,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'c-2',
      name: 'Tartine Avocat',
      description: 'Pain de campagne, avocat écrasé, œuf poché, graines',
      price: 9.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'oeufs', 'sésame']
    },
    {
      id: 'c-3',
      name: 'Salade Chèvre Chaud',
      description: 'Mesclun, toasts de chèvre, noix, miel',
      price: 12.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'fruits à coques']
    },
    {
      id: 'c-4',
      name: 'Quiche aux Légumes',
      description: 'Quiche maison aux légumes de saison',
      price: 8.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'c-5',
      name: 'Croque Légumes',
      description: 'Pain de mie, légumes grillés, fromage fondu',
      price: 9.50,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'c-6',
      name: 'Pancakes',
      description: 'Pancakes moelleux, sirop d\'érable, fruits frais',
      price: 8.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'c-7',
      name: 'Granola Bowl',
      description: 'Yaourt, granola maison, fruits frais, miel',
      price: 7.90,
      vegetarian: true,
      vegan: false,
      allergens: ['lait', 'fruits à coques']
    }
  ],

  // ============================================
  // FAST FOOD / BURGER
  // ============================================
  fastfood: [
    // VÉGÉTARIEN
    {
      id: 'f-1',
      name: 'Burger Végétarien',
      description: 'Steak végétal, cheddar, salade, tomate, oignon, sauce maison',
      price: 12.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'soja']
    },
    {
      id: 'f-2',
      name: 'Frites Maison',
      description: 'Frites fraîches croustillantes',
      price: 4.50,
      vegetarian: true,
      vegan: true,
      allergens: []
    },
    {
      id: 'f-3',
      name: 'Frites au Cheddar',
      description: 'Frites nappées de cheddar fondu',
      price: 6.90,
      vegetarian: true,
      vegan: false,
      allergens: ['lait']
    },
    {
      id: 'f-4',
      name: 'Onion Rings',
      description: 'Rondelles d\'oignon panées et frites',
      price: 5.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'oeufs']
    },
    {
      id: 'f-5',
      name: 'Wrap Falafels',
      description: 'Falafels, houmous, crudités, sauce yaourt',
      price: 9.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'sésame', 'lait']
    },
    // NON-VÉGÉTARIEN
    {
      id: 'f-6',
      name: 'Burger Classic',
      description: 'Steak haché 150g, cheddar, salade, tomate, oignon, sauce burger',
      price: 11.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'f-7',
      name: 'Burger Bacon',
      description: 'Steak haché, bacon crispy, cheddar, oignons caramélisés',
      price: 13.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'f-8',
      name: 'Double Cheese',
      description: 'Double steak, double cheddar, cornichons, oignons, sauce spéciale',
      price: 14.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'f-9',
      name: 'Chicken Burger',
      description: 'Filet de poulet pané, salade, tomate, mayo',
      price: 11.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'oeufs']
    },
    {
      id: 'f-10',
      name: 'Nuggets (6 pcs)',
      description: 'Nuggets de poulet croustillants, sauce au choix',
      price: 7.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten']
    },
    {
      id: 'f-11',
      name: 'Hot Dog',
      description: 'Saucisse de Francfort, pain brioché, oignons, moutarde, ketchup',
      price: 8.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten']
    },
    {
      id: 'f-12',
      name: 'Fish Burger',
      description: 'Filet de poisson pané, sauce tartare, salade',
      price: 12.50,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'poisson', 'oeufs']
    }
  ],

  // ============================================
  // BOULANGERIE / PATISSERIE
  // ============================================
  bakery: [
    {
      id: 'b-1',
      name: 'Pain au Chocolat',
      description: 'Viennoiserie feuilletée au chocolat noir',
      price: 2.40,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs', 'soja']
    },
    {
      id: 'b-2',
      name: 'Chausson aux Pommes',
      description: 'Feuilleté aux pommes caramélisées',
      price: 2.80,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'b-3',
      name: 'Tarte aux Fruits',
      description: 'Tarte du jour aux fruits de saison',
      price: 5.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'b-4',
      name: 'Éclair au Chocolat',
      description: 'Pâte à choux, crème pâtissière chocolat',
      price: 4.50,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'b-5',
      name: 'Sandwich Veggie',
      description: 'Pain complet, crudités, fromage frais, avocat',
      price: 6.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait']
    },
    {
      id: 'b-6',
      name: 'Cookie Chocolat',
      description: 'Cookie moelleux aux pépites de chocolat',
      price: 2.50,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    }
  ],

  // ============================================
  // RESTAURANT GÉNÉRIQUE
  // ============================================
  default: [
    // PLATS VÉGÉTARIENS
    {
      id: 'd-1',
      name: 'Salade du Marché',
      description: 'Mesclun, légumes de saison, vinaigrette maison',
      price: 11.90,
      vegetarian: true,
      vegan: true,
      allergens: ['moutarde']
    },
    {
      id: 'd-2',
      name: 'Assiette de Légumes Grillés',
      description: 'Légumes de saison grillés, huile d\'olive, herbes',
      price: 12.90,
      vegetarian: true,
      vegan: true,
      allergens: []
    },
    {
      id: 'd-3',
      name: 'Omelette aux Fines Herbes',
      description: 'Omelette moelleuse, ciboulette, persil, salade verte',
      price: 10.90,
      vegetarian: true,
      vegan: false,
      allergens: ['oeufs', 'lait']
    },
    {
      id: 'd-4',
      name: 'Pâtes aux Légumes',
      description: 'Penne, légumes sautés, sauce tomate maison',
      price: 12.50,
      vegetarian: true,
      vegan: true,
      allergens: ['gluten']
    },
    {
      id: 'd-5',
      name: 'Soupe du Jour',
      description: 'Soupe maison aux légumes de saison',
      price: 6.90,
      vegetarian: true,
      vegan: true,
      allergens: []
    },
    {
      id: 'd-6',
      name: 'Frites Maison',
      description: 'Frites fraîches et croustillantes',
      price: 4.50,
      vegetarian: true,
      vegan: true,
      allergens: []
    },
    // PLATS NON-VÉGÉTARIENS
    {
      id: 'd-7',
      name: 'Entrecôte Grillée',
      description: 'Entrecôte de bœuf 300g, sauce au poivre, frites maison',
      price: 22.90,
      vegetarian: false,
      vegan: false,
      allergens: ['lait']
    },
    {
      id: 'd-8',
      name: 'Poulet Rôti',
      description: 'Demi-poulet fermier rôti, pommes de terre grenaille',
      price: 16.90,
      vegetarian: false,
      vegan: false,
      allergens: []
    },
    {
      id: 'd-9',
      name: 'Saumon Grillé',
      description: 'Pavé de saumon, riz basmati, sauce citronnée',
      price: 18.90,
      vegetarian: false,
      vegan: false,
      allergens: ['poisson']
    },
    {
      id: 'd-10',
      name: 'Burger Classic',
      description: 'Steak haché, cheddar, bacon, salade, tomate, oignon',
      price: 14.90,
      vegetarian: false,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'd-11',
      name: 'Tartare de Bœuf',
      description: 'Bœuf cru assaisonné, câpres, oignon, frites',
      price: 17.90,
      vegetarian: false,
      vegan: false,
      allergens: ['oeufs', 'moutarde']
    },
    {
      id: 'd-12',
      name: 'Moules Marinières',
      description: 'Moules de bouchot, vin blanc, échalotes, frites',
      price: 15.90,
      vegetarian: false,
      vegan: false,
      allergens: ['mollusques', 'sulfites']
    },
    // DESSERTS
    {
      id: 'd-13',
      name: 'Cheese Cake',
      description: 'Cheese cake crémeux, coulis de fruits rouges',
      price: 7.50,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    },
    {
      id: 'd-14',
      name: 'Fondant au Chocolat',
      description: 'Moelleux au chocolat noir, cœur coulant',
      price: 7.90,
      vegetarian: true,
      vegan: false,
      allergens: ['gluten', 'lait', 'oeufs']
    }
  ]
}

// ============================================
// MAPPING DES TYPES GOOGLE PLACES -> CATÉGORIES
// ============================================
const TYPE_MAPPING = {
  // Asian
  'chinese_restaurant': 'asian',
  'thai_restaurant': 'asian',
  'vietnamese_restaurant': 'asian',
  'korean_restaurant': 'asian',
  'asian_restaurant': 'asian',
  'ramen_restaurant': 'japanese',
  'noodle_restaurant': 'asian',
  
  // Japanese
  'japanese_restaurant': 'japanese',
  'sushi_restaurant': 'japanese',
  
  // Italian
  'italian_restaurant': 'italian',
  'pizza_restaurant': 'italian',
  'pizzeria': 'italian',
  
  // Cafe
  'cafe': 'cafe',
  'coffee_shop': 'cafe',
  'breakfast_restaurant': 'cafe',
  'brunch_restaurant': 'cafe',
  
  // Fast food
  'fast_food_restaurant': 'fastfood',
  'hamburger_restaurant': 'fastfood',
  'burger_restaurant': 'fastfood',
  'sandwich_shop': 'fastfood',
  
  // Bakery
  'bakery': 'bakery',
  'pastry_shop': 'bakery',
  
  // Default
  'restaurant': 'default',
  'food': 'default'
}

/**
 * Détermine la catégorie d'un restaurant basée sur son type ou nom
 */
function getRestaurantCategory(restaurant) {
  const name = (restaurant.name || '').toLowerCase()
  const type = (restaurant.type || '').toLowerCase()
  const primaryType = restaurant.primaryType || ''
  
  // Check par nom d'abord
  if (name.includes('sushi') || name.includes('japan') || name.includes('maki')) {
    return 'japanese'
  }
  if (name.includes('pizza') || name.includes('pasta') || name.includes('italien') || name.includes('trattoria')) {
    return 'italian'
  }
  if (name.includes('thai') || name.includes('viet') || name.includes('chinois') || name.includes('wok') || name.includes('asia')) {
    return 'asian'
  }
  if (name.includes('burger') || name.includes('tacos') || name.includes('kebab') || name.includes('fast')) {
    return 'fastfood'
  }
  if (name.includes('café') || name.includes('cafe') || name.includes('coffee') || name.includes('brunch')) {
    return 'cafe'
  }
  if (name.includes('boulangerie') || name.includes('bakery') || name.includes('pâtisserie')) {
    return 'bakery'
  }
  
  // Check par type Google
  if (TYPE_MAPPING[primaryType]) {
    return TYPE_MAPPING[primaryType]
  }
  
  // Check par type affiché
  if (type.includes('japonais')) return 'japanese'
  if (type.includes('italien') || type.includes('pizza')) return 'italian'
  if (type.includes('asiatique') || type.includes('thaï') || type.includes('chinois')) return 'asian'
  if (type.includes('café') || type.includes('bistrot')) return 'cafe'
  if (type.includes('boulangerie')) return 'bakery'
  
  return 'default'
}

// ============================================
// CACHE DES MENUS PAR RESTAURANT
// ============================================
const menuCache = new Map()

/**
 * Génère un nombre pseudo-aléatoire déterministe basé sur une seed
 * @param {string} seed - La seed (par exemple, l'ID du restaurant)
 * @returns {number} Un nombre entre 0 et 1
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Calcule l'empreinte carbone estimée d'un plat en kg CO2
 * Basé sur le type de plat et les ingrédients
 */
function calculateCarbonEstimate(dish) {
  // Facteurs carbone moyens (kg CO2 par portion)
  if (dish.vegan) {
    return 0.5 + Math.random() * 1.0  // 0.5-1.5 kg CO2
  } else if (dish.vegetarian) {
    return 1.5 + Math.random() * 1.5  // 1.5-3.0 kg CO2
  } else {
    // Non-végétarien
    const name = dish.name.toLowerCase()
    if (name.includes('bœuf') || name.includes('beef') || name.includes('veau')) {
      return 10.0 + Math.random() * 15.0  // 10-25 kg CO2 (viande rouge)
    } else if (name.includes('agneau') || name.includes('lamb')) {
      return 8.0 + Math.random() * 12.0  // 8-20 kg CO2
    } else if (name.includes('porc') || name.includes('pork') || name.includes('jambon') || name.includes('bacon')) {
      return 4.0 + Math.random() * 4.0  // 4-8 kg CO2
    } else if (name.includes('poulet') || name.includes('chicken') || name.includes('canard') || name.includes('duck')) {
      return 3.0 + Math.random() * 3.0  // 3-6 kg CO2
    } else if (name.includes('poisson') || name.includes('fish') || name.includes('saumon') || name.includes('thon')) {
      return 2.5 + Math.random() * 2.5  // 2.5-5 kg CO2
    } else if (name.includes('crevette') || name.includes('homard') || name.includes('langouste') || name.includes('shellfish')) {
      return 5.0 + Math.random() * 5.0  // 5-10 kg CO2 (crustacés)
    } else {
      return 3.0 + Math.random() * 4.0  // 3-7 kg CO2 (viande générique)
    }
  }
}

/**
 * Calcule le score planète (durabilité) sur 10
 * Plus l'empreinte carbone est faible, meilleur est le score
 */
function calculatePlanetScore(carbonEstimate) {
  // Score inversement proportionnel au carbone
  // 0-2 kg CO2 = 9-10/10
  // 2-5 kg CO2 = 7-9/10
  // 5-10 kg CO2 = 4-7/10
  // 10-15 kg CO2 = 2-4/10
  // 15+ kg CO2 = 0-2/10
  if (carbonEstimate < 2) {
    return 9.0 + (2 - carbonEstimate) * 0.5
  } else if (carbonEstimate < 5) {
    return 7.0 + (5 - carbonEstimate) / 1.5
  } else if (carbonEstimate < 10) {
    return 4.0 + (10 - carbonEstimate) / 1.7
  } else if (carbonEstimate < 15) {
    return 2.0 + (15 - carbonEstimate) / 2.5
  } else {
    return Math.max(0, 2.0 - (carbonEstimate - 15) / 5)
  }
}

/**
 * Calcule le score plaisir (goût/expérience) sur 10
 * Basé sur le prix et le type de plat
 */
function calculatePleasureScore(dish, dishId) {
  // Score de base entre 5 et 9 (déterministe par ID)
  const baseScore = 5.0 + seededRandom(dishId) * 4.0

  // Bonus pour les prix élevés (plats premium)
  const priceBonus = Math.min(1.5, (dish.price - 10) / 10)

  // Bonus pour certains types de plats populaires
  const name = dish.name.toLowerCase()
  let typeBonus = 0
  if (name.includes('burger') || name.includes('pizza') || name.includes('chocolate') || name.includes('chocolat')) {
    typeBonus = 0.5
  } else if (name.includes('frites') || name.includes('nuggets')) {
    typeBonus = 0.3
  }

  return Math.min(10, baseScore + priceBonus + typeBonus)
}

/**
 * Calcule le score de compatibilité personnelle sur 10
 * Basé sur les allergènes et les préférences végétariennes
 */
function calculateFitScore(dish, userAllergies = []) {
  let score = 10.0

  // Pénalité pour chaque allergène de l'utilisateur présent
  if (userAllergies && userAllergies.length > 0 && dish.allergens) {
    const dishAllergens = dish.allergens.map(a => a.toLowerCase())
    const userAllergensList = userAllergies.map(a => a.toLowerCase())

    dishAllergens.forEach(allergen => {
      if (userAllergensList.some(ua => allergen.includes(ua) || ua.includes(allergen))) {
        score -= 3.0  // -3 points par allergène
      }
    })
  }

  // Bonus pour végétarien/vegan si c'est la préférence
  if (dish.vegetarian) {
    score += 0.5
  }
  if (dish.vegan) {
    score += 0.5
  }

  return Math.max(0, Math.min(10, score))
}

/**
 * Enrichit un plat avec des scores et attributs supplémentaires
 */
function enrichDish(dish, dishId, userAllergies = []) {
  const carbonEstimate = calculateCarbonEstimate(dish)
  const planetScore = calculatePlanetScore(carbonEstimate)
  const pleasureScore = calculatePleasureScore(dish, dishId)
  const fitScore = calculateFitScore(dish, userAllergies)

  // Score total = moyenne pondérée
  const totalScore = (planetScore * 0.35 + pleasureScore * 0.35 + fitScore * 0.30)

  return {
    ...dish,
    total_score: Math.round(totalScore * 10) / 10,
    sub_scores: {
      s_planet: Math.round(planetScore * 10) / 10,
      s_pleasure: Math.round(pleasureScore * 10) / 10,
      s_fit: Math.round(fitScore * 10) / 10
    },
    enriched_attributes: {
      carbon_estimate: Math.round(carbonEstimate * 10) / 10,
      ingredients: [],  // Pourrait être enrichi plus tard
      nova_score: dish.vegan ? 1 : (dish.vegetarian ? 2 : 3),
      nutriscore: dish.vegan ? 'A' : (dish.vegetarian ? 'B' : 'C'),
      dietary_tags: [
        ...(dish.vegan ? ['vegan'] : []),
        ...(dish.vegetarian ? ['vegetarian'] : [])
      ],
      allergens: dish.allergens || []
    }
  }
}

/**
 * Mélange un tableau de manière déterministe basée sur une seed
 * @param {Array} array - Le tableau à mélanger
 * @param {string} seed - La seed pour le mélange
 * @returns {Array} Le tableau mélangé
 */
function seededShuffle(array, seed) {
  const arr = [...array]
  let currentIndex = arr.length
  let seedValue = 0

  // Convertir la seed en nombre
  for (let i = 0; i < seed.length; i++) {
    seedValue += seed.charCodeAt(i)
  }

  while (currentIndex !== 0) {
    // Utiliser la seed pour générer un index
    seedValue = (seedValue * 9301 + 49297) % 233280
    const randomIndex = Math.floor((seedValue / 233280) * currentIndex)
    currentIndex--

    // Échanger les éléments
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]]
  }

  return arr
}

/**
 * Retourne des plats mock pour un restaurant
 * @param {Object} restaurant - Le restaurant (de Google Places)
 * @param {Array} userAllergies - Allergies de l'utilisateur (optionnel)
 * @returns {Array} Liste de plats enrichis avec scores
 */
export function getMockDishesForRestaurant(restaurant, userAllergies = []) {
  // Vérifier si le menu est déjà en cache
  // Utiliser stableId en priorité pour garantir la cohérence
  const restaurantId = restaurant.stableId || restaurant.id || restaurant.place_id || restaurant.name
  const cacheKey = `${restaurantId}-${(userAllergies || []).join(',')}`

  if (menuCache.has(cacheKey)) {
    return menuCache.get(cacheKey)
  }

  // D'abord, vérifier si c'est un restaurant connu autour de 42
  const resto42 = findRestaurant42ByName(restaurant.name || '')
  if (resto42 && resto42.menu) {
    // Enrichir les plats du resto 42 avec les scores
    const enrichedMenu = resto42.menu.map((dish, index) =>
      enrichDish(dish, `${restaurantId}-${index}`, userAllergies)
    )
    menuCache.set(cacheKey, enrichedMenu)
    return enrichedMenu
  }

  // Sinon, utiliser les plats génériques par catégorie
  const category = getRestaurantCategory(restaurant)
  const dishes = DISHES_BY_TYPE[category] || DISHES_BY_TYPE.default

  // Pour les restaurants vegan/vegetarian, avoir 70-100% de plats végétariens
  const isVeggieRestaurant = restaurant.primaryType === 'vegan_restaurant' ||
                             restaurant.primaryType === 'vegetarian_restaurant' ||
                             restaurant.isVeggie === true

  // Mélanger tous les plats
  const shuffled = seededShuffle(dishes, restaurantId)

  // Déterminer le nombre de plats de manière déterministe (entre 5 et 8)
  const seedNum = seededRandom(restaurantId.length)
  const count = 5 + Math.floor(seedNum * 4)

  let menu
  if (isVeggieRestaurant) {
    // Pour les restos veggie : 70-100% de plats végétariens
    const veggieDishes = shuffled.filter(dish => dish.vegetarian === true)
    const nonVeggieDishes = shuffled.filter(dish => dish.vegetarian === false)

    // Calculer combien de plats non-végé ajouter (0-30% du total)
    const targetVeggiePercent = 70 + (seededRandom(restaurantId.length * 2) * 30) // 70-100%
    const veggieCount = Math.ceil(count * targetVeggiePercent / 100)
    const nonVeggieCount = count - veggieCount

    // Composer le menu
    menu = [
      ...veggieDishes.slice(0, veggieCount),
      ...nonVeggieDishes.slice(0, nonVeggieCount)
    ]
  } else {
    // Pour les restos normaux, garder le mélange normal
    menu = shuffled.slice(0, count)
  }

  // Enrichir tous les plats avec les scores
  const enrichedMenu = menu.map((dish, index) =>
    enrichDish(dish, `${restaurantId}-${index}`, userAllergies)
  )

  menuCache.set(cacheKey, enrichedMenu)

  return enrichedMenu
}

/**
 * Simule un délai de chargement (pour le réalisme)
 * @param {Object} restaurant - Le restaurant
 * @param {number} delay - Délai en ms
 * @param {Array} userAllergies - Allergies de l'utilisateur
 */
export function getMockDishesWithDelay(restaurant, delay = 500, userAllergies = []) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getMockDishesForRestaurant(restaurant, userAllergies))
    }, delay)
  })
}

export default getMockDishesForRestaurant
