"""
FASTAPI MENU SCORING API
========================
Endpoints for menu extraction and scoring
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
import json
import base64
import tempfile
from dotenv import load_dotenv

# Import your existing modules
from scoring_multi_resto import score_menu_for_consumer, score_menu_for_restaurant
from mistralai import Mistral
from anthropic import Anthropic

load_dotenv()

# Initialize API clients
mistral_api_key = os.environ.get("MISTRAL_API_KEY")
anthropic_api_key = os.environ.get("ANTHROPIC_API_KEY")

if not mistral_api_key or not anthropic_api_key:
    raise ValueError("Missing API keys in environment variables")

mistral_client = Mistral(api_key=mistral_api_key)
anthropic_client = Anthropic(api_key=anthropic_api_key)

# Initialize FastAPI
app = FastAPI(
    title="Plant-Based Menu Scoring API",
    description="OCR + AI-powered restaurant menu analysis for vegetarian/vegan friendliness",
    version="1.0.0"
)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class UserProfile(BaseModel):
    dietary_restriction: str = ""  # "vegan", "vegetarian", "halal", "gluten-free", etc.
    goal: str = ""  # "weight_loss", "muscle_gain", "athlete"
    allergens: List[str] = []  # ["gluten", "lactose", "nuts", etc.]
    strict_filter: bool = True  # Hide incompatible dishes vs show with low scores


class MenuDish(BaseModel):
    id: int
    name: str
    description: str
    price: float
    restaurant_name: str


class ScoringRequest(BaseModel):
    menu_data: List[MenuDish]
    user_profile: Optional[UserProfile] = None
    mode: str = "consumer"  # "consumer" or "restaurant"
    top_n: int = 10


class HealthCheckResponse(BaseModel):
    status: str
    message: str


# ============================================================================
# HELPER FUNCTIONS (from main.py)
# ============================================================================

def extract_menu_from_image(image_data: bytes, restaurant_name: str = "Unknown Restaurant"):
    """Extract structured menu data from image bytes"""
    
    # Encode image for API
    image_base64 = base64.b64encode(image_data).decode("utf-8")
    document = {
        "type": "image_url",
        "image_url": f"data:image/jpeg;base64,{image_base64}",
    }

    # OCR with Mistral
    ocr_response = mistral_client.ocr.process(
        model="mistral-ocr-latest",
        document=document,
        include_image_base64=False
    )

    ocr_text = ocr_response.text if hasattr(ocr_response, "text") else str(ocr_response)

    # Parse with Claude Haiku
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
            dishes = parsed_data
            restaurant_data = {
                "restaurant_id": 1,
                "name": restaurant_name,
                "type": "Unknown",
                "location": "Unknown",
                "menu": dishes,
            }

    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"JSON parsing error: {str(e)}")

    # Format for scoring engine
    menu_data = []
    for dish in dishes:
        menu_data.append({
            "id": dish.get("id", len(menu_data) + 1),
            "name": dish.get("name", "Unknown Dish"),
            "description": dish.get("description", ""),
            "price": float(dish.get("price", 0.0)),
            "restaurant_name": restaurant_data.get("name", restaurant_name),
        })

    return menu_data, restaurant_data


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Plant-Based Menu Scoring API is running"
    }


@app.post("/api/extract-menu")
async def extract_menu(
    file: UploadFile = File(...),
    restaurant_name: str = Form("Unknown Restaurant")
):
    """
    Extract menu from uploaded image
    
    - **file**: Menu image (JPG, PNG, etc.)
    - **restaurant_name**: Optional restaurant name
    """
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image data
        image_data = await file.read()
        
        # Extract menu
        menu_data, restaurant_data = extract_menu_from_image(image_data, restaurant_name)
        
        return {
            "success": True,
            "restaurant": restaurant_data,
            "menu_items": menu_data,
            "count": len(menu_data)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.post("/api/score-menu")
async def score_menu(request: ScoringRequest):
    """
    Score menu dishes based on user preferences
    
    - **menu_data**: List of dishes to score
    - **user_profile**: User dietary preferences (optional)
    - **mode**: "consumer" or "restaurant"
    - **top_n**: Number of top dishes to return
    """
    
    try:
        # Convert Pydantic models to dicts
        menu_list = [dish.dict() for dish in request.menu_data]
        
        if request.mode == "consumer":
            user_profile_dict = request.user_profile.dict() if request.user_profile else {
                "dietary_restriction": "",
                "goal": "",
                "allergens": [],
                "strict_filter": True
            }
            results = score_menu_for_consumer(menu_list, user_profile_dict, request.top_n)
        else:
            results = score_menu_for_restaurant(menu_list, request.top_n)
        
        return {
            "success": True,
            "mode": request.mode,
            "results": results
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


@app.post("/api/full-pipeline")
async def full_pipeline(
    file: UploadFile = File(...),
    restaurant_name: str = Form("Unknown Restaurant"),
    dietary_restriction: str = Form(""),
    goal: str = Form(""),
    allergens: str = Form(""),  # Comma-separated
    strict_filter: bool = Form(True),
    mode: str = Form("consumer"),
    top_n: int = Form(10)
):
    """
    Complete pipeline: Extract menu from image + Score dishes
    
    This is the main endpoint for frontend integration.
    """
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Step 1: Extract menu
        image_data = await file.read()
        menu_data, restaurant_data = extract_menu_from_image(image_data, restaurant_name)
        
        if not menu_data:
            raise HTTPException(status_code=400, detail="No menu items extracted from image")
        
        # Step 2: Score menu
        if mode == "consumer":
            user_profile = {
                "dietary_restriction": dietary_restriction,
                "goal": goal,
                "allergens": [a.strip() for a in allergens.split(",") if a.strip()],
                "strict_filter": strict_filter
            }
            scoring_results = score_menu_for_consumer(menu_data, user_profile, top_n)
        else:
            scoring_results = score_menu_for_restaurant(menu_data, top_n)
        
        return {
            "success": True,
            "restaurant": restaurant_data,
            "scoring": scoring_results,
            "mode": mode
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")


# ============================================================================
# STARTUP MESSAGE
# ============================================================================

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 Plant-Based Menu Scoring API Started!")
    print("="*60)
    print("📖 API Docs: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/")
    print("="*60 + "\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
