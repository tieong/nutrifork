"""
API TEST CLIENT
===============
Test your FastAPI endpoints locally
"""

import requests
import json
from pathlib import Path

# Configuration
API_URL = "https://unverdured-connatural-ladonna.ngrok-free.dev"  # Change to ngrok URL when deployed
TEST_IMAGE = "test_image.JPG"  # Update with your test image path


def test_health_check():
    """Test health check endpoint"""
    print("\n" + "=" * 60)
    print("🏥 TESTING HEALTH CHECK")
    print("=" * 60)

    response = requests.get(f"{API_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}\n")
    return response.status_code == 200


def test_extract_menu(image_path: str):
    """Test menu extraction endpoint"""
    print("\n" + "=" * 60)
    print("📸 TESTING MENU EXTRACTION")
    print("=" * 60)

    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        return None

    with open(image_path, "rb") as f:
        files = {"file": ("menu.jpg", f, "image/jpeg")}
        data = {"restaurant_name": "Test Restaurant"}

        response = requests.post(f"{API_URL}/api/extract-menu", files=files, data=data)

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Extracted {result['count']} dishes")
        print(f"Restaurant: {result['restaurant']['name']}")
        print(f"\nFirst 3 dishes:")
        for dish in result["menu_items"][:3]:
            print(f"  - {dish['name']}: €{dish['price']}")
        return result["menu_items"]
    else:
        print(f"❌ Error: {response.text}")
        return None


def test_score_menu(menu_items: list):
    """Test menu scoring endpoint"""
    print("\n" + "=" * 60)
    print("🎯 TESTING MENU SCORING")
    print("=" * 60)

    if not menu_items:
        print("❌ No menu items provided")
        return

    request_data = {
        "menu_data": menu_items,
        "user_profile": {
            "dietary_restriction": "vegetarian",
            "goal": "",
            "allergens": ["gluten"],
            "strict_filter": True,
        },
        "mode": "consumer",
        "top_n": 5,
    }

    response = requests.post(f"{API_URL}/api/score-menu", json=request_data)

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Scored {len(result['results']['scored_dishes'])} dishes")
        print(f"\nTop 3 recommendations:")
        for i, dish in enumerate(result["results"]["scored_dishes"][:3], 1):
            print(f"{i}. {dish['name']}")
            print(f"   Score: {dish['total_score']:.1f}/10 | {dish['comment']}")
            print(
                f"   🌍 Planet: {dish['sub_scores']['s_planet']:.1f} | "
                f"😋 Pleasure: {dish['sub_scores']['s_pleasure']:.1f}"
            )
    else:
        print(f"❌ Error: {response.text}")


def test_full_pipeline(image_path: str):
    """Test complete pipeline endpoint"""
    print("\n" + "=" * 60)
    print("🚀 TESTING FULL PIPELINE")
    print("=" * 60)

    if not Path(image_path).exists():
        print(f"❌ Image not found: {image_path}")
        return

    with open(image_path, "rb") as f:
        files = {"file": ("menu.jpg", f, "image/jpeg")}
        data = {
            "restaurant_name": "Full Pipeline Test",
            "dietary_restriction": "vegan",
            "goal": "weight_loss",
            "allergens": "nuts,soy",
            "strict_filter": "true",
            "mode": "consumer",
            "top_n": "5",
        }

        print("⏳ Processing (this may take 30-60 seconds)...")
        response = requests.post(
            f"{API_URL}/api/full-pipeline",
            files=files,
            data=data,
            timeout=120,  # 2 minute timeout
        )

    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print(f"✅ Pipeline completed!")
        print(f"\nRestaurant: {result['restaurant']['name']}")
        print(f"Dishes found: {result['restaurant'].get('menu', []).__len__()}")
        print(f"\nTop recommendations:")
        for i, dish in enumerate(result["scoring"]["scored_dishes"][:3], 1):
            print(f"{i}. {dish['name']} - €{dish['price']}")
            print(f"   Score: {dish['total_score']:.1f}/10")

        # Save full results
        with open("test_pipeline_results.json", "w") as f:
            json.dump(result, f, indent=2)
        print(f"\n💾 Full results saved to: test_pipeline_results.json")
    else:
        print(f"❌ Error: {response.text}")


def main():
    """Run all tests"""
    print("\n" + "#" * 60)
    print("# API TEST SUITE")
    print("#" * 60)

    # Test 1: Health check
    if not test_health_check():
        print("❌ Server not responding. Is it running?")
        print("Run: python deploy.py")
        return

    # Test 2: Extract menu
    menu_items = test_extract_menu(TEST_IMAGE)

    # Test 3: Score menu (if extraction worked)
    if menu_items:
        test_score_menu(menu_items)

    # Test 4: Full pipeline
    test_full_pipeline(TEST_IMAGE)

    print("\n" + "=" * 60)
    print("✅ ALL TESTS COMPLETE!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
