/**
 * Script to batch-fetch menus for restaurants around École 42 using Perplexity
 * Run with: node scripts/fetchMenus42.js
 */

import { batchFetchMenus } from '../src/services/perplexityService.js'
import { RESTAURANTS_42 } from '../src/data/restaurants42.js'

async function main() {
  console.log('🍽️  Starting menu fetch for', RESTAURANTS_42.length, 'restaurants around École 42...\n')

  // Convert RESTAURANTS_42 format to the format expected by perplexityService
  const restaurantsForFetch = RESTAURANTS_42.map(r => ({
    id: r.restaurant_id,
    name: r.name,
    address: r.location
  }))

  // Fetch menus with 2 second delay between requests to respect rate limits
  const menuMap = await batchFetchMenus(restaurantsForFetch, 2000)

  console.log('\n✅ Fetch complete!\n')
  console.log('📊 Results:')
  console.log('─'.repeat(80))

  // Display results
  for (const restaurant of RESTAURANTS_42) {
    const dishes = menuMap.get(restaurant.restaurant_id)
    console.log(`\n${restaurant.name} (${restaurant.type})`)
    console.log(`📍 ${restaurant.location}`)
    console.log(`📋 ${dishes?.length || 0} plats trouvés`)

    if (dishes && dishes.length > 0) {
      const veggieCount = dishes.filter(d => d.vegetarian).length
      const veggiePercent = Math.round((veggieCount / dishes.length) * 100)
      console.log(`🌱 ${veggieCount}/${dishes.length} végétarien (${veggiePercent}%)`)

      console.log('\nPlats:')
      dishes.forEach((dish, i) => {
        const veggieIcon = dish.vegetarian ? '🌱' : '🍖'
        console.log(`  ${i + 1}. ${veggieIcon} ${dish.name} - ${dish.price}€`)
      })
    }
    console.log('─'.repeat(80))
  }

  // Save to JSON file
  const fs = await import('fs/promises')
  const output = {}
  for (const [id, dishes] of menuMap.entries()) {
    output[id] = dishes
  }

  await fs.writeFile(
    'scripts/menus_fetched.json',
    JSON.stringify(output, null, 2),
    'utf-8'
  )

  console.log('\n💾 Menus saved to scripts/menus_fetched.json')
  console.log('\n🎉 Done!')
}

main().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
