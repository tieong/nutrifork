/**
 * Perplexity API Service
 * Fetches real restaurant menu data using Perplexity AI
 */

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

/**
 * Fetch restaurant menu using Perplexity AI
 * @param {string} restaurantName - Name of the restaurant
 * @param {string} address - Restaurant address for context
 * @returns {Promise<Array>} Array of dishes with allergen information
 */
export async function fetchRestaurantMenu(restaurantName, address) {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY

  if (!apiKey) {
    console.warn('Perplexity API key not found, using mock data')
    return generateFallbackDishes(restaurantName)
  }

  try {
    const prompt = `Find the current menu for the restaurant "${restaurantName}" located at "${address}".

For each dish on their menu, provide:
- name: Dish name in French
- description: Detailed appetizing description in French (1-2 sentences)
- price: Price in euros (number)
- vegetarian: Whether it's vegetarian or vegan (boolean true/false)
- allergens: Array of common allergens from this list: gluten, lactose, nuts, eggs, fish, shellfish, soy, sesame

Include BOTH vegetarian and non-vegetarian dishes to give a complete picture of the menu.

Return the response as a JSON array with this EXACT structure:
[
  {
    "name": "Bowl de lentilles bio",
    "description": "Lentilles vertes du Puy, légumes frais croquants, vinaigrette à l'huile d'olive. 100% végétal et sans gluten",
    "price": 12.50,
    "vegetarian": true,
    "allergens": []
  },
  {
    "name": "Burger au bœuf",
    "description": "Bœuf grillé juteux avec fromage cheddar et sauce maison",
    "price": 15.90,
    "vegetarian": false,
    "allergens": ["gluten", "lactose"]
  }
]

If you cannot find the exact menu, provide typical dishes for this type of restaurant with realistic descriptions and educated guesses about allergens.`

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides restaurant menu information in JSON format. Always respond with valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      })
    })

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in Perplexity response')
    }

    // Extract JSON from the response (it might be wrapped in markdown code blocks)
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1]
    }

    // Parse the JSON response
    const dishes = JSON.parse(jsonContent)

    // Validate and format the dishes
    return dishes.map((dish, index) => ({
      id: `${restaurantName}-${index}`,
      name: dish.name || 'Plat sans nom',
      price: typeof dish.price === 'number' ? dish.price : parseFloat(dish.price) || 10.0,
      vegetarian: dish.vegetarian === true,
      allergens: Array.isArray(dish.allergens) ? dish.allergens : [],
      description: dish.description || 'Description non disponible'
    }))

  } catch (error) {
    console.error('Error fetching menu from Perplexity:', error)
    console.log('Falling back to mock data for', restaurantName)
    return generateFallbackDishes(restaurantName)
  }
}

/**
 * Generate fallback dishes when Perplexity API fails
 * @param {string} restaurantName - Name of the restaurant
 * @returns {Array} Array of mock dishes
 */
function generateFallbackDishes(restaurantName) {
  const dishTemplates = [
    {
      name: 'Burger au bœuf',
      description: 'Bœuf grillé juteux avec fromage cheddar et sauce maison',
      price: 15.90,
      vegetarian: false,
      allergens: ['gluten', 'lactose']
    },
    {
      name: 'Bowl de lentilles bio',
      description: 'Lentilles vertes du Puy, légumes frais croquants, vinaigrette à l\'huile d\'olive. 100% végétal et sans gluten',
      price: 12.50,
      vegetarian: true,
      allergens: []
    },
    {
      name: 'Poulet César',
      description: 'Poulet tendre grillé, salade romaine fraîche, parmesan et croutons croustillants',
      price: 13.90,
      vegetarian: false,
      allergens: ['gluten', 'lactose', 'eggs']
    },
    {
      name: 'Curry de tempeh',
      description: 'Tempeh mariné, sauce curry crémeuse aux noix de cajou, riz basmati. Vegan',
      price: 14.20,
      vegetarian: true,
      allergens: ['soy', 'nuts']
    },
    {
      name: 'Risotto aux champignons',
      description: 'Riz arborio crémeux, champignons forestiers sautés, parmesan affiné et persil frais',
      price: 14.00,
      vegetarian: true,
      allergens: ['lactose']
    },
    {
      name: 'Salade César végétarienne',
      description: 'Salade romaine croquante, croûtons maison, parmesan et sauce César crémeuse',
      price: 11.50,
      vegetarian: true,
      allergens: ['gluten', 'lactose', 'eggs']
    },
    {
      name: 'Poke bowl au tofu',
      description: 'Riz vinaigré, tofu mariné, avocat, edamame, algues wakame et sauce soja sucrée',
      price: 13.50,
      vegetarian: true,
      allergens: ['soy', 'sesame', 'gluten']
    },
    {
      name: 'Tarte aux légumes du soleil',
      description: 'Pâte feuilletée croustillante garnie de courgettes, aubergines, tomates et herbes de Provence',
      price: 11.90,
      vegetarian: true,
      allergens: ['gluten', 'eggs']
    },
  ]

  // Select 3-5 random dishes
  const numberOfDishes = 3 + Math.floor(Math.random() * 3)
  const shuffled = [...dishTemplates].sort(() => 0.5 - Math.random())
  const selectedDishes = shuffled.slice(0, numberOfDishes)

  return selectedDishes.map((dish, index) => ({
    id: `${restaurantName}-${index}`,
    name: dish.name,
    description: dish.description,
    price: dish.price,
    vegetarian: dish.vegetarian,
    allergens: dish.allergens
  }))
}

/**
 * Batch fetch menus for multiple restaurants with rate limiting
 * @param {Array} restaurants - Array of restaurant objects
 * @param {number} delayMs - Delay between requests in milliseconds
 * @returns {Promise<Map>} Map of restaurant IDs to their dishes
 */
export async function batchFetchMenus(restaurants, delayMs = 1000) {
  const menuMap = new Map()

  for (const restaurant of restaurants) {
    try {
      const dishes = await fetchRestaurantMenu(restaurant.name, restaurant.address)
      menuMap.set(restaurant.id, dishes)

      // Add delay to respect rate limits
      if (restaurants.indexOf(restaurant) < restaurants.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Failed to fetch menu for ${restaurant.name}:`, error)
      menuMap.set(restaurant.id, generateFallbackDishes(restaurant.name))
    }
  }

  return menuMap
}
