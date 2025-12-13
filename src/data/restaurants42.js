// ============================================
// RESTAURANTS AUTOUR DE 42 PARIS
// Données fournies par l'équipe + infos végé/allergènes
// ============================================

export const RESTAURANTS_42 = [
  {
    restaurant_id: 1,
    name: 'Le Paris 17',
    type: 'Bistrot Parisien',
    location: 'Rue Guersant, 75017 Paris (400m from 42)',
    menu: [
      {
        id: 101,
        name: 'Foie de veau persillé',
        description: 'Tranche de foie de veau poêlée au beurre, ail et persil, servie avec purée maison',
        price: 20.00,
        vegetarian: false,
        vegan: false,
        allergens: ['lait']
      },
      {
        id: 102,
        name: 'Ravioles du Dauphiné',
        description: 'Ravioles pochées à la crème de ciboulette et comté',
        price: 15.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait', 'oeufs']
      },
      {
        id: 103,
        name: 'Tartare de Bœuf Tradition',
        description: "Viande de bœuf crue hachée au couteau, câpres, oignons, jaune d'oeuf, servi avec frites",
        price: 18.00,
        vegetarian: false,
        vegan: false,
        allergens: ['oeufs', 'moutarde']
      },
      {
        id: 104,
        name: 'Magret de Canard entier',
        description: 'Magret rôti rosé, sauce au miel et épices, pommes grenailles',
        price: 24.00,
        vegetarian: false,
        vegan: false,
        allergens: []
      },
      {
        id: 105,
        name: "Harengs Pommes à l'Huile",
        description: 'Filets de harengs marinés, pommes de terre tièdes, carottes et oignons',
        price: 9.00,
        vegetarian: false,
        vegan: false,
        allergens: ['poisson']
      },
      // Plats végé ajoutés (typiques d'un bistrot parisien)
      {
        id: 106,
        name: 'Salade de Chèvre Chaud',
        description: 'Mesclun, toasts de chèvre gratiné, noix, miel',
        price: 14.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait', 'fruits à coques']
      },
      {
        id: 107,
        name: 'Omelette aux Fines Herbes',
        description: 'Omelette baveuse, ciboulette, persil, cerfeuil, salade verte',
        price: 12.00,
        vegetarian: true,
        vegan: false,
        allergens: ['oeufs', 'lait']
      },
      {
        id: 108,
        name: 'Tarte Tatin',
        description: 'Tarte aux pommes caramélisées renversée, crème fraîche',
        price: 8.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait', 'oeufs']
      }
    ]
  },
  {
    restaurant_id: 2,
    name: 'Dar El Bey',
    type: 'Tunisien / Maghreb',
    location: 'Boulevard Bessières, 75017 Paris (100m from 42)',
    menu: [
      {
        id: 201,
        name: 'Couscous Merguez',
        description: 'Semoule fine, pois chiches, légumes mijotés (navet, carotte, courgette) et merguez grillées',
        price: 12.00,
        vegetarian: false,
        vegan: false,
        allergens: ['gluten']
      },
      {
        id: 202,
        name: 'Ojja Merguez',
        description: 'Plat traditionnel tunisien aux oeufs brouillés, tomates, poivrons, épices et merguez',
        price: 11.00,
        vegetarian: false,
        vegan: false,
        allergens: ['oeufs']
      },
      {
        id: 203,
        name: "Brick à l'oeuf",
        description: "Feuille de brick croustillante farcie à l'oeuf, persil et pommes de terre",
        price: 6.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'oeufs']
      },
      {
        id: 204,
        name: 'Thé à la menthe',
        description: 'Thé vert chaud à la menthe fraîche et pignons de pin',
        price: 2.50,
        vegetarian: true,
        vegan: true,
        allergens: ['fruits à coques']
      },
      // Plats végé ajoutés (typiques cuisine tunisienne)
      {
        id: 205,
        name: 'Couscous Légumes',
        description: 'Semoule fine, pois chiches, légumes mijotés (navet, carotte, courgette, potiron)',
        price: 10.00,
        vegetarian: true,
        vegan: true,
        allergens: ['gluten']
      },
      {
        id: 206,
        name: 'Salade Mechouia',
        description: "Salade de poivrons et tomates grillés, ail, huile d'olive, harissa légère",
        price: 5.00,
        vegetarian: true,
        vegan: true,
        allergens: []
      },
      {
        id: 207,
        name: 'Ojja aux Légumes',
        description: 'Oeufs brouillés, tomates, poivrons, oignons, épices (sans viande)',
        price: 9.00,
        vegetarian: true,
        vegan: false,
        allergens: ['oeufs']
      },
      {
        id: 208,
        name: 'Makroud aux Dattes',
        description: 'Pâtisserie traditionnelle à la semoule et pâte de dattes, miel',
        price: 3.50,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten']
      }
    ]
  },
  {
    restaurant_id: 3,
    name: 'Resto 17',
    type: 'Fast Food / Tacos',
    location: 'Avenue de Clichy, 75017 Paris (300m from 42)',
    menu: [
      {
        id: 301,
        name: 'French Tacos XL',
        description: 'Galette de blé, nuggets, cordon bleu, frites, sauce fromagère maison',
        price: 10.50,
        vegetarian: false,
        vegan: false,
        allergens: ['gluten', 'lait', 'oeufs']
      },
      {
        id: 302,
        name: 'Menu Chicken Wings',
        description: '8 pièces de wings de poulet épicées frites, servies avec frites et coca',
        price: 8.50,
        vegetarian: false,
        vegan: false,
        allergens: ['gluten']
      },
      {
        id: 303,
        name: 'Kebab Grec Frites',
        description: 'Pain rond, viande de veau et dinde à la broche, salade tomates oignons, sauce blanche',
        price: 9.00,
        vegetarian: false,
        vegan: false,
        allergens: ['gluten', 'lait']
      },
      {
        id: 304,
        name: 'Tenders x5',
        description: 'Filets de poulet panés croustillants',
        price: 7.00,
        vegetarian: false,
        vegan: false,
        allergens: ['gluten', 'oeufs']
      },
      // Plats végé ajoutés (options fast food)
      {
        id: 305,
        name: 'Frites Maison',
        description: 'Portion de frites fraîches croustillantes',
        price: 3.50,
        vegetarian: true,
        vegan: true,
        allergens: []
      },
      {
        id: 306,
        name: 'Tacos Végé',
        description: 'Galette de blé, falafels, légumes grillés, sauce fromagère',
        price: 9.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait', 'sésame']
      },
      {
        id: 307,
        name: 'Salade Mixte',
        description: 'Salade verte, tomates, maïs, carottes râpées, vinaigrette',
        price: 5.00,
        vegetarian: true,
        vegan: true,
        allergens: ['moutarde']
      },
      {
        id: 308,
        name: 'Frites Cheddar',
        description: 'Frites nappées de sauce cheddar fondu',
        price: 5.50,
        vegetarian: true,
        vegan: false,
        allergens: ['lait']
      }
    ]
  },
  {
    restaurant_id: 4,
    name: 'Papilla',
    type: 'Italien',
    location: 'Rue de Courcelles / Batignolles (800m from 42)',
    menu: [
      {
        id: 401,
        name: 'Gnocchi à la Sorrentina',
        description: 'Gnocchi de pomme de terre, sauce tomate San Marzano, mozzarella fior di latte fondue et basilic',
        price: 16.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait']
      },
      {
        id: 402,
        name: 'Burrata des Pouilles',
        description: "Burrata crémeuse 125g, tomates cerises, roquette et filet d'huile de truffe",
        price: 18.00,
        vegetarian: true,
        vegan: false,
        allergens: ['lait']
      },
      {
        id: 403,
        name: 'Lasagne Bolognaise',
        description: 'Pâtes fraîches, ragù de boeuf mijoté, béchamel, parmesan',
        price: 17.00,
        vegetarian: false,
        vegan: false,
        allergens: ['gluten', 'lait', 'oeufs']
      },
      // Plats végé ajoutés (typiques italien)
      {
        id: 404,
        name: 'Pizza Margherita',
        description: 'Sauce tomate San Marzano, mozzarella fior di latte, basilic frais',
        price: 12.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait']
      },
      {
        id: 405,
        name: 'Pizza Quattro Formaggi',
        description: 'Mozzarella, gorgonzola, parmesan, chèvre',
        price: 15.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait']
      },
      {
        id: 406,
        name: 'Penne Arrabiata',
        description: 'Penne al dente, sauce tomate épicée, ail, piment, persil',
        price: 13.00,
        vegetarian: true,
        vegan: true,
        allergens: ['gluten']
      },
      {
        id: 407,
        name: 'Pizza Marinara',
        description: "Sauce tomate, ail, origan, huile d'olive (sans fromage)",
        price: 10.00,
        vegetarian: true,
        vegan: true,
        allergens: ['gluten']
      },
      {
        id: 408,
        name: 'Tiramisu Maison',
        description: 'Mascarpone, biscuits savoiardi, café espresso, cacao amer',
        price: 8.00,
        vegetarian: true,
        vegan: false,
        allergens: ['gluten', 'lait', 'oeufs']
      }
    ]
  }
]

// Fonction pour récupérer un resto par son nom (matching partiel)
export function findRestaurant42ByName(name) {
  const searchName = name.toLowerCase()
  return RESTAURANTS_42.find(r => 
    searchName.includes(r.name.toLowerCase()) || 
    r.name.toLowerCase().includes(searchName)
  )
}

// Fonction pour récupérer les plats d'un resto 42
export function getDishes42(restaurantName) {
  const resto = findRestaurant42ByName(restaurantName)
  return resto ? resto.menu : null
}

export default RESTAURANTS_42
