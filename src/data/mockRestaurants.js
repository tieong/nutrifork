// Mock data for restaurants with vegetarian dishes and allergen information
export const mockRestaurants = [
  {
    id: 1,
    name: "Le Jardin Vert",
    position: { lat: 48.8566, lng: 2.3522 }, // Paris
    address: "15 Rue de Rivoli, 75001 Paris",
    type: "Vegetarian",
    rating: 4.5,
    dishes: [
      {
        id: 101,
        name: "Buddha Bowl Quinoa",
        price: 12.50,
        allergens: ['sesame'],
        vegetarian: true,
        description: "Quinoa, avocat, légumes de saison, sauce tahini"
      },
      {
        id: 102,
        name: "Risotto aux champignons",
        price: 14.00,
        allergens: ['lactose'],
        vegetarian: true,
        description: "Riz arborio, champignons forestiers, parmesan"
      },
      {
        id: 103,
        name: "Salade méditerranéenne",
        price: 11.00,
        allergens: [],
        vegetarian: true,
        description: "Tomates, concombre, olives, huile d'olive"
      },
    ]
  },
  {
    id: 2,
    name: "Green & Co",
    position: { lat: 48.8606, lng: 2.3376 },
    address: "42 Boulevard Saint-Germain, 75005 Paris",
    type: "Healthy Food",
    rating: 4.7,
    dishes: [
      {
        id: 201,
        name: "Wrap de légumes grillés",
        price: 9.50,
        allergens: ['gluten'],
        vegetarian: true,
        description: "Tortilla, légumes grillés, houmous"
      },
      {
        id: 202,
        name: "Curry de pois chiches",
        price: 13.00,
        allergens: [],
        vegetarian: true,
        description: "Pois chiches, lait de coco, épices, riz basmati"
      },
      {
        id: 203,
        name: "Tarte aux légumes du soleil",
        price: 11.50,
        allergens: ['gluten', 'eggs'],
        vegetarian: true,
        description: "Pâte feuilletée, courgettes, aubergines, tomates"
      },
    ]
  },
  {
    id: 3,
    name: "Veggie Paradise",
    position: { lat: 48.8520, lng: 2.3500 },
    address: "28 Rue des Écoles, 75005 Paris",
    type: "Vegan",
    rating: 4.8,
    dishes: [
      {
        id: 301,
        name: "Bowl açaï fruits rouges",
        price: 10.00,
        allergens: ['nuts'],
        vegetarian: true,
        description: "Açaï, fruits rouges, granola, amandes"
      },
      {
        id: 302,
        name: "Lasagnes végétales",
        price: 13.50,
        allergens: ['gluten', 'soy'],
        vegetarian: true,
        description: "Pâtes, béchamel végétale, légumes, tofu"
      },
      {
        id: 303,
        name: "Soupe de lentilles corail",
        price: 8.00,
        allergens: [],
        vegetarian: true,
        description: "Lentilles corail, légumes, épices douces"
      },
    ]
  },
  {
    id: 4,
    name: "Bio Bistrot",
    position: { lat: 48.8650, lng: 2.3450 },
    address: "10 Rue du Temple, 75004 Paris",
    type: "Organic",
    rating: 4.3,
    dishes: [
      {
        id: 401,
        name: "Burger végétarien maison",
        price: 14.50,
        allergens: ['gluten', 'soy', 'sesame'],
        vegetarian: true,
        description: "Pain artisanal, steak de soja, crudités, sauce maison"
      },
      {
        id: 402,
        name: "Assiette de crudités bio",
        price: 9.00,
        allergens: [],
        vegetarian: true,
        description: "Carottes, betteraves, radis, vinaigrette"
      },
      {
        id: 403,
        name: "Gratin de légumes",
        price: 12.00,
        allergens: ['lactose'],
        vegetarian: true,
        description: "Pommes de terre, courgettes, crème fraîche, fromage"
      },
    ]
  },
  {
    id: 5,
    name: "L'Assiette Verte",
    position: { lat: 48.8500, lng: 2.3600 },
    address: "55 Rue de la Roquette, 75011 Paris",
    type: "Vegetarian & Vegan",
    rating: 4.6,
    dishes: [
      {
        id: 501,
        name: "Poke bowl végétarien",
        price: 13.00,
        allergens: ['soy', 'sesame'],
        vegetarian: true,
        description: "Riz, tofu mariné, avocat, edamame, sauce soja"
      },
      {
        id: 502,
        name: "Tajine de légumes",
        price: 14.00,
        allergens: [],
        vegetarian: true,
        description: "Légumes de saison, semoule, épices orientales"
      },
      {
        id: 503,
        name: "Crêpe complète végétarienne",
        price: 10.50,
        allergens: ['gluten', 'eggs', 'lactose'],
        vegetarian: true,
        description: "Galette de sarrasin, œuf, fromage, champignons"
      },
    ]
  }
]

// Helper function to filter dishes based on user allergies
export const filterDishesByAllergies = (dishes, userAllergies) => {
  if (!userAllergies || userAllergies.length === 0) {
    return dishes.filter(dish => dish.vegetarian)
  }

  return dishes.filter(dish => {
    // Only show vegetarian dishes
    if (!dish.vegetarian) return false

    // Check if dish contains any of the user's allergies
    const hasAllergen = dish.allergens.some(allergen =>
      userAllergies.includes(allergen)
    )

    return !hasAllergen
  })
}
