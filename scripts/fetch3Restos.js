/**
 * Script to fetch menus for 3 specific restaurants near École 42
 * Run with: node scripts/fetch3Restos.js
 */

import 'dotenv/config'

// Create a Node.js compatible version of fetchRestaurantMenu
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

async function fetchRestaurantMenu(restaurantName, address) {
  const apiKey = process.env.VITE_PERPLEXITY_API_KEY

  if (!apiKey) {
    throw new Error('VITE_PERPLEXITY_API_KEY not found in .env file')
  }

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
    const errorData = await response.json().catch(() => null)
    console.error('Perplexity API Error Details:', errorData)
    throw new Error(`Perplexity API error: ${response.status} - ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No content in Perplexity response')
  }

  // Extract JSON from the response
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
}

const RESTAURANTS = [
  {
    id: 'full-moon-kebab',
    name: 'Full Moon Kebab',
    address: 'Boulevard Bessières, 75017 Paris'
  },
  {
    id: 'le-95',
    name: 'Le 95',
    address: 'Boulevard Bessières, 75017 Paris'
  },
  {
    id: 'la-petite-cabane',
    name: 'La Petite Cabane - Delices & Mo',
    address: 'Boulevard Bessières, 75017 Paris'
  }
]

async function main() {
  console.log('🍽️  Fetching menus for 3 restaurants near École 42...\n')

  const results = []

  for (const restaurant of RESTAURANTS) {
    console.log(`📍 Fetching menu for ${restaurant.name}...`)

    try {
      const dishes = await fetchRestaurantMenu(restaurant.name, restaurant.address)

      console.log(`✅ Found ${dishes.length} dishes`)

      const veggieCount = dishes.filter(d => d.vegetarian).length
      const veggiePercent = Math.round((veggieCount / dishes.length) * 100)
      console.log(`🌱 ${veggieCount}/${dishes.length} vegetarian (${veggiePercent}%)`)

      results.push({
        ...restaurant,
        dishes,
        veggieScore: veggiePercent
      })

      // Wait 2 seconds before next request
      if (RESTAURANTS.indexOf(restaurant) < RESTAURANTS.length - 1) {
        console.log('⏳ Waiting 2s before next request...\n')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      console.error(`❌ Error for ${restaurant.name}:`, error.message)
      results.push({
        ...restaurant,
        dishes: [],
        error: error.message
      })
    }
  }

  console.log('\n' + '═'.repeat(80))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(80))

  for (const result of results) {
    console.log(`\n${result.name}`)
    console.log(`📍 ${result.address}`)
    if (result.error) {
      console.log(`❌ Error: ${result.error}`)
    } else {
      console.log(`🌱 Veggie Score: ${result.veggieScore}%`)
      console.log(`📋 ${result.dishes.length} dishes:`)
      result.dishes.forEach((dish, i) => {
        const icon = dish.vegetarian ? '🌱' : '🍖'
        console.log(`   ${i + 1}. ${icon} ${dish.name} - ${dish.price}€`)
        if (dish.allergens && dish.allergens.length > 0) {
          console.log(`      ⚠️  Allergens: ${dish.allergens.join(', ')}`)
        }
      })
    }
    console.log('─'.repeat(80))
  }

  // Save to JSON
  const fs = await import('fs/promises')
  await fs.writeFile(
    'scripts/menus_3restos.json',
    JSON.stringify(results, null, 2),
    'utf-8'
  )

  console.log('\n💾 Results saved to scripts/menus_3restos.json')
  console.log('🎉 Done!')
}

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
