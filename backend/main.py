"""
END-TO-END MENU SCORING PIPELINE
=================================
Extract menu from image → Score dishes → Display results
"""

import os
import json
import sys
from mistralai import Mistral
from anthropic import Anthropic

# Load environment variables from .env file
from dotenv import load_dotenv

load_dotenv()

# Import scoring engine (must be in same directory or Python path)
from scoring_multi_resto import score_menu_for_consumer, score_menu_for_restaurant

# Initialize clients
mistral_api_key = os.environ.get("MISTRAL_API_KEY")
anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")

if not mistral_api_key:
    raise ValueError("MISTRAL_API_KEY environment variable not set")
if not anthropic_api_key:
    raise ValueError("ANTHROPIC_API_KEY environment variable not set")

mistral_client = Mistral(api_key=mistral_api_key)
anthropic_client = Anthropic(api_key=anthropic_api_key)


def extract_menu_from_image(
    image_path: str, restaurant_name: str = "Unknown Restaurant"
) -> list:
    """Extract structured menu data from image using Mistral OCR + Claude Haiku"""

    print(f"\n{'=' * 60}")
    print(f"📸 STEP 1: OCR EXTRACTION")
    print(f"{'=' * 60}")
    print(f"Processing: {image_path}")

    # Prepare image for OCR
    if image_path.startswith(("http://", "https://")):
        document = {"type": "image_url", "image_url": image_path}
    else:
        import base64

        with open(image_path, "rb") as f:
            image_data = base64.b64encode(f.read()).decode("utf-8")
        document = {
            "type": "image_url",
            "image_url": f"data:image/jpeg;base64,{image_data}",
        }

    # OCR with Mistral
    ocr_response = mistral_client.ocr.process(
        model="mistral-ocr-latest", document=document, include_image_base64=False
    )

    ocr_text = ocr_response.text if hasattr(ocr_response, "text") else str(ocr_response)
    print(f"✅ Extracted {len(ocr_text)} characters")
    print(f"\n--- OCR Preview (first 300 chars) ---")
    print(f"{ocr_text[:300]}...\n")

    # Parse with Claude Haiku
    print(f"\n{'=' * 60}")
    print(f"🧠 STEP 2: STRUCTURED PARSING (Claude Haiku)")
    print(f"{'=' * 60}")

    parsing_prompt = f"""You are a menu data extractor. Parse this restaurant menu OCR text into structured JSON.

OCR TEXT:
{ocr_text}

INSTRUCTIONS:
1. Extract the restaurant name, type, and location if available from the menu
2. Extract ALL dishes from the menu
3. For each dish, identify: name, description (ingredients/details), price
4. Assign sequential IDs starting from 1
5. If price is missing, use 0.0
6. If description is missing, use empty string
7. Return ONLY valid JSON, no markdown, no explanation

OUTPUT FORMAT:
{{
    "restaurant_id": 1,
    "name": "{restaurant_name}",
    "type": "Restaurant type from OCR or 'Unknown'",
    "location": "Address from OCR or 'Unknown'",
    "menu": [
        {{
            "id": 1,
            "name": "Dish name",
            "description": "Ingredients and details",
            "price": 12.50
        }}
    ]
}}

JSON OUTPUT:"""

    chat_response = anthropic_client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        temperature=0.1,
        messages=[{"role": "user", "content": parsing_prompt}],
    )

    llm_output = chat_response.content[0].text.strip()

    # Clean markdown artifacts
    if llm_output.startswith("```json"):
        llm_output = llm_output[7:]
    if llm_output.startswith("```"):
        llm_output = llm_output[3:]
    if llm_output.endswith("```"):
        llm_output = llm_output[:-3]
    llm_output = llm_output.strip()

    # Parse JSON
    try:
        parsed_data = json.loads(llm_output)

        # Handle structured restaurant format
        if isinstance(parsed_data, dict) and "menu" in parsed_data:
            restaurant_data = parsed_data
            dishes = restaurant_data.get("menu", [])
        elif isinstance(parsed_data, dict):
            # Old format or wrapped data
            dishes = (
                parsed_data.get("dishes")
                or parsed_data.get("menu")
                or next((v for v in parsed_data.values() if isinstance(v, list)), [])
            )
            restaurant_data = {
                "restaurant_id": 1,
                "name": restaurant_name,
                "type": "Unknown",
                "location": "Unknown",
                "menu": dishes,
            }
        else:
            # Array format (fallback)
            dishes = parsed_data
            restaurant_data = {
                "restaurant_id": 1,
                "name": restaurant_name,
                "type": "Unknown",
                "location": "Unknown",
                "menu": dishes,
            }

    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        print(f"LLM OUTPUT:\n{llm_output}")
        return []

    # Format for scoring engine (flatten to dish list with restaurant name)
    menu_data = []
    for dish in dishes:
        menu_data.append(
            {
                "id": dish.get("id", len(menu_data) + 1),
                "name": dish.get("name", "Unknown Dish"),
                "description": dish.get("description", ""),
                "price": float(dish.get("price", 0.0)),
                "restaurant_name": restaurant_data.get("name", restaurant_name),
            }
        )

    print(
        f"✅ Extracted {len(menu_data)} dishes from {restaurant_data.get('name', restaurant_name)}"
    )

    # Return both the full structured data and flattened menu
    return menu_data, restaurant_data


def display_results(results: dict, mode: str = "consumer"):
    """Display scoring results in a readable format"""

    print(f"\n{'=' * 60}")
    print(f"📊 SCORING RESULTS ({mode.upper()})")
    print(f"{'=' * 60}\n")

    # Overall stats
    stats = results.get("overall_menu_stats", {})
    print(f"📈 MENU STATISTICS:")
    print(f"   Total dishes: {stats.get('total_dishes', 0)}")
    print(
        f"   Avg sustainability: {stats.get('average_sustainability_score', 0):.1f}/10"
    )
    print(f"   Avg pleasure: {stats.get('average_pleasure_score', 0):.1f}/10")
    print(f"   Avg fit: {stats.get('average_fit_score', 0):.1f}/10")
    print(f"   Plant-based: {stats.get('plant_based_percentage', 0):.1f}%")
    print(f"   High NOVA (processed): {stats.get('high_nova_percentage', 0):.1f}%\n")

    # Filter info (if applicable)
    if "filter_info" in results:
        finfo = results["filter_info"]
        print(f"🔍 FILTER INFO:")
        print(f"   {finfo.get('message', '')}")
        print(f"   Compatible dishes: {finfo.get('compatible_dishes_found', 0)}")
        print(f"   Filtered out: {finfo.get('filtered_out_count', 0)}\n")

    # Top dishes
    print(f"🏆 TOP RECOMMENDED DISHES:\n")
    for i, dish in enumerate(results.get("scored_dishes", [])[:10], 1):
        print(f"{i}. {dish['name']} - €{dish['price']:.2f}")
        print(f"   Score: {dish['total_score']:.1f}/10 | {dish['comment']}")
        print(
            f"   🌍 Planet: {dish['sub_scores']['s_planet']:.1f} | "
            f"😋 Pleasure: {dish['sub_scores']['s_pleasure']:.1f} | "
            f"💪 Fit: {dish['sub_scores']['s_fit']:.1f}"
        )

        tags = dish["enriched_attributes"].get("dietary_tags", [])
        if tags:
            print(f"   Tags: {', '.join(tags)}")

        allergens = dish["enriched_attributes"].get("allergens", [])
        if allergens:
            print(f"   ⚠️ Allergens: {', '.join(allergens[:5])}")
        print()

    # Swap suggestions (B2B only)
    if "swap_suggestions" in results and results["swap_suggestions"]:
        print(f"\n💡 SWAP SUGGESTIONS (for restaurant):\n")
        for swap in results["swap_suggestions"][:5]:
            print(f"   {swap['dish_name']}")
            print(
                f"   Replace {swap['current_ingredient']} → {swap['suggested_ingredient']}"
            )
            print(f"   {swap['rationale']}\n")


def main():
    """Main pipeline execution"""

    # ========================================================================
    # CONFIGURATION
    # ========================================================================

    IMAGE_PATH = "test_image.JPG"  # Update with your image path
    RESTAURANT_NAME = "Test Restaurant"  # Update with actual name

    # User profile for B2C scoring
    USER_PROFILE = {
        "dietary_restriction": "vegetarian",  # "vegan", "vegetarian", "halal", "gluten-free", ""
        "goal": "",  # "weight_loss", "muscle_gain", "athlete", ""
        "allergens": ["gluten"],  # ["lactose", "gluten", "nuts", "shellfish", ...]
        "strict_filter": True,  # True = hide incompatible, False = show with low scores
    }

    SCORING_MODE = "consumer"  # "consumer" or "restaurant"

    # ========================================================================
    # PIPELINE EXECUTION
    # ========================================================================

    print(f"\n{'#' * 60}")
    print(f"# PLANT-BASED RESTAURANT SCORING PIPELINE")
    print(f"{'#' * 60}")

    # Step 1 & 2: Extract menu from image
    menu_data, restaurant_data = extract_menu_from_image(IMAGE_PATH, RESTAURANT_NAME)

    if not menu_data:
        print("❌ No menu data extracted. Exiting.")
        sys.exit(1)

    # Save full structured restaurant data
    with open("extracted_menu.json", "w", encoding="utf-8") as f:
        json.dump(restaurant_data, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Saved structured restaurant data to: extracted_menu.json")

    # Step 3: Score menu
    print(f"\n{'=' * 60}")
    print(f"🎯 STEP 3: SCORING ENGINE")
    print(f"{'=' * 60}")

    if SCORING_MODE == "consumer":
        print(f"Mode: B2C (Consumer)")
        print(f"Profile: {USER_PROFILE}")
        results = score_menu_for_consumer(menu_data, USER_PROFILE, top_n=10)
    else:
        print(f"Mode: B2B (Restaurant)")
        results = score_menu_for_restaurant(menu_data, top_n=10)

    # Step 4: Display results
    display_results(results, SCORING_MODE)

    # Save results
    output_file = f"scoring_results_{SCORING_MODE}.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n💾 Saved scoring results to: {output_file}")

    print(f"\n{'=' * 60}")
    print(f"✅ PIPELINE COMPLETE!")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
