"""
SCORING ENGINE MVP HACKATHON - MULTI-RESTAURANT VERSION
========================================================
Moteur de scoring avec support multi-restaurants + allergènes
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field
import os
import json

# LLM Integration (optional - falls back to rules if no API key)
try:
    import requests

    BLACKBOX_API_KEY = os.getenv("BLACKBOX_API_KEY", "")
    HAS_LLM = bool(BLACKBOX_API_KEY)
except:
    HAS_LLM = False


# ============================================================================
# BASES DE DONNÉES ÉTENDUES (ZONE ÉCOLE 42 / PARIS 17 - CLICHY-BATIGNOLLES)
# ============================================================================

# Prix grossiste Rungis/Metro 2024-2025 (€/kg) - Estimations B2B Paris
PRICE_DB = {
    # --- VIANDES (Bistro & Grill) ---
    "beef": 18.0,
    "boeuf": 18.0,
    "steak": 22.0,
    "entrecote": 26.0,
    "tartare": 24.0,
    "veal": 22.0,
    "veau": 22.0,
    "liver": 15.0,
    "foie": 15.0,
    "foie de veau": 18.0,
    "pork": 9.0,
    "porc": 9.0,
    "ribs": 11.0,
    "travers": 11.0,
    "lardon": 10.0,
    "duck": 16.0,
    "canard": 16.0,
    "magret": 22.0,
    "confit": 18.0,
    "sausage": 9.0,
    "saucisse": 9.0,
    "saucisson": 15.0,
    "andouillette": 16.0,
    # --- STREET FOOD & Étudiant (Tacos, Burger, Kebab) ---
    "chicken": 8.5,
    "poulet": 8.5,
    "tenders": 10.0,
    "nuggets": 8.0,
    "wings": 7.0,
    "kebab": 11.0,
    "viande grecque": 11.0,
    "gyros": 11.0,
    "cordon bleu": 10.0,
    "merguez": 9.5,  # Pour Couscous/Sandwich
    "minced meat": 10.0,
    "viande hachée": 10.0,
    # --- POISSONS & MER (Brasserie) ---
    "salmon": 17.0,
    "saumon": 17.0,
    "gravlax": 25.0,
    "cod": 15.0,
    "cabillaud": 15.0,
    "fish and chips": 12.0,
    "herring": 8.0,
    "hareng": 8.0,
    "shrimp": 18.0,
    "crevette": 18.0,
    "gambas": 24.0,
    "tuna": 22.0,
    "thon": 22.0,
    "calamari": 12.0,
    "calamar": 12.0,
    "squid": 12.0,
    # --- ITALIEN & PÂTES ---
    "pasta": 1.5,
    "pâtes": 1.5,
    "ravioles": 8.0,
    "gnocchi": 4.0,
    "lasagne": 6.0,
    "rice": 1.8,
    "riz": 1.8,
    "risotto": 2.5,
    "pizza dough": 2.0,
    "pâte à pizza": 2.0,
    # --- COUSCOUS & MAGHREB (Dar El Bey) ---
    "couscous": 1.5,
    "semoule": 1.5,
    "semolina": 1.5,
    "chickpeas": 2.5,
    "pois chiches": 2.5,
    "brick": 5.0,
    "feuille de brick": 5.0,
    # --- LÉGUMES & ACCOMPAGNEMENTS ---
    "potato": 1.0,
    "pomme de terre": 1.0,
    "fries": 1.5,
    "frites": 1.5,
    "purée": 2.0,
    "carrot": 1.0,
    "carotte": 1.0,
    "salad": 3.0,
    "salade": 3.0,
    "roquette": 6.0,
    "tomato": 2.5,
    "tomate": 2.5,
    "cherry tomato": 4.0,
    "eggplant": 2.5,
    "aubergine": 2.5,
    "zucchini": 2.2,
    "courgette": 2.2,
    "spinach": 3.0,
    "épinard": 3.0,
    "mushroom": 5.0,
    "champignon": 5.0,
    "morel": 60.0,
    "morilles": 60.0,
    "avocado": 7.0,
    "avocat": 7.0,
    # --- FROMAGES & CRÈMES ---
    "cheese": 11.0,
    "fromage": 11.0,
    "mozzarella": 10.0,
    "burrata": 18.0,
    "parmesan": 18.0,
    "pecorino": 16.0,
    "comte": 16.0,
    "comté": 16.0,
    "goat cheese": 14.0,
    "chèvre": 14.0,
    "blue cheese": 13.0,
    "bleu": 13.0,
    "gorgonzola": 13.0,
    "cheese sauce": 5.0,
    "sauce fromagère": 5.0,
    "cream": 4.0,
    "crème": 4.0,
    "butter": 8.0,
    "beurre": 8.0,
    # --- BASES ---
    "egg": 3.5,
    "oeuf": 3.5,
    "œuf": 3.5,
    "bread": 1.5,
    "pain": 1.5,
    "bun": 2.5,
    "tortilla": 3.0,
    "sugar": 1.0,
    "sucre": 1.0,
    "chocolate": 10.0,
    "chocolat": 10.0,
}

# Nutri-Score simplifié (A=5, B=4, C=3, D=2, E=1)
NUTRISCORE_DB = {
    # --- A (Excellent) ---
    "fish": 5,
    "poisson": 5,
    "cod": 5,
    "cabillaud": 5,
    "haddock": 5,
    "hareng": 5,
    "vegetables": 5,
    "légumes": 5,
    "spinach": 5,
    "épinard": 5,
    "mushroom": 5,
    "lentils": 5,
    "lentilles": 5,
    "chickpeas": 5,
    "pois chiches": 5,
    "chicken breast": 5,
    "blanc de poulet": 5,
    "tofu": 5,
    # --- B (Bon) ---
    "chicken": 4,
    "poulet": 4,
    "turkey": 4,
    "dinde": 4,
    "rice": 4,
    "riz": 4,
    "couscous": 4,
    "semoule": 4,
    "pasta": 4,
    "pâtes": 4,
    "ravioles": 4,
    "egg": 4,
    "oeuf": 4,
    "shrimp": 4,
    "crevette": 4,
    "salmon": 4,
    "saumon": 4,
    "scargots": 4,
    "snails": 4,
    "potato": 4,
    "pomme de terre": 4,
    "purée": 4,
    # --- C (Moyen) ---
    "beef": 3,
    "boeuf": 3,
    "steak": 3,
    "bavette": 3,
    "tartare": 3,
    "duck": 3,
    "canard": 3,
    "veal": 3,
    "veau": 3,
    "liver": 3,
    "foie": 3,
    "pork": 3,
    "porc": 3,
    "ham": 3,
    "jambon": 3,
    "mozzarella": 3,
    "goat cheese": 3,
    "chèvre": 3,
    "bread": 3,
    "pain": 3,
    "bun": 3,
    "tortilla": 3,
    # --- D (Limité - Gras/Salé) ---
    "cheese": 2,
    "fromage": 2,
    "comté": 2,
    "parmesan": 2,
    "bleu": 2,
    "merguez": 2,
    "sausage": 2,
    "saucisse": 2,
    "kebab": 2,
    "gyros": 2,
    "lamb": 2,
    "agneau": 2,
    "cream": 2,
    "crème": 2,
    "butter": 2,
    "beurre": 2,
    "fries": 2,
    "frites": 2,
    "potatoes": 2,
    "duck confit": 2,
    "confit": 2,
    "sauce": 2,
    "pesto": 2,
    # --- E (À éviter - Très transformé/Gras) ---
    "fried": 1,
    "frit": 1,
    "nuggets": 1,
    "tenders": 1,
    "cordon bleu": 1,
    "cheese sauce": 1,
    "sauce fromagère": 1,
    "mayonnaise": 1,
    "ketchup": 1,
    "bbq": 1,
    "salami": 1,
    "chorizo": 1,
    "lardon": 1,
    "bacon": 1,
    "foie gras": 1,
    "cake": 1,
    "gâteau": 1,
    "chocolate": 1,
    "chocolat": 1,
}

# Carbone (kg CO2e/kg) - Agribalyse 3.1
CARBON_DB = {
    # --- VIANDES ROUGES (High Carbon) ---
    "snails": 2.0,  # Low impact (like mushrooms)
    "escargot": 2.0,
    "escargots": 2.0,
    "beef": 28.0,
    "boeuf": 28.0,
    "steak": 28.0,
    "burger": 28.0,
    "lamb": 34.0,
    "agneau": 34.0,
    "merguez": 26.0,
    "veal": 16.0,
    "veau": 16.0,
    "liver": 16.0,
    # --- VIANDES BLANCHES & PORC ---
    "pork": 6.0,
    "porc": 6.0,
    "lardon": 7.0,
    "ham": 5.5,
    "chicken": 4.0,
    "poulet": 4.0,
    "nuggets": 5.0,
    "duck": 8.0,
    "canard": 8.0,
    "magret": 8.5,
    # --- POISSONS ---
    "shrimp": 22.0,
    "crevette": 22.0,
    "salmon": 7.0,
    "saumon": 7.0,
    "white fish": 5.0,
    "poisson blanc": 5.0,
    "cod": 6.0,
    "hareng": 4.0,
    "tuna": 5.5,
    "thon": 5.5,
    # --- LAITIERS & FROMAGES ---
    "butter": 10.0,
    "beurre": 10.0,
    "cheese": 8.0,
    "fromage": 8.0,
    "comté": 9.0,
    "parmesan": 9.0,
    "mozzarella": 6.0,
    "burrata": 6.5,
    "cream": 4.5,
    "crème": 4.5,
    "sauce fromagère": 5.5,
    # --- VÉGÉTAL & FÉCULENTS (Low Carbon) ---
    "rice": 2.0,
    "riz": 2.0,
    "pasta": 0.5,
    "pâtes": 0.5,
    "ravioles": 2.5,
    "couscous": 0.6,
    "semoule": 0.6,
    "bread": 0.6,
    "pain": 0.6,
    "tortilla": 0.8,
    "potato": 0.3,
    "pomme de terre": 0.3,
    "fries": 0.8,
    "vegetables": 0.4,
    "légumes": 0.4,
    "salad": 0.5,
    "tomato": 0.6,
    "tomate": 0.6,
    "avocado": 1.5,
    "avocat": 1.5,
    "chickpeas": 0.5,
    "pois chiches": 0.5,
    "lentils": 0.6,
    "lentilles": 0.6,
    "mushroom": 0.5,
    "champignon": 0.5,
    # --- DESSERTS ---
    "chocolate": 19.0,
    "chocolat": 19.0,
    "sugar": 0.6,
    "sucre": 0.6,
    "fruit": 0.5,
}

# ============================================================================
# NEW: ALLERGEN DATABASE
# ============================================================================

ALLERGEN_DB = {
    "gluten": [
        "wheat",
        "blé",
        "bread",
        "pain",
        "pasta",
        "pâtes",
        "bun",
        "pizza",
        "flour",
        "farine",
        "soy sauce",
        "sauce soja",
    ],
    "lactose": [
        "milk",
        "lait",
        "cheese",
        "fromage",
        "cream",
        "crème",
        "butter",
        "beurre",
        "yogurt",
        "yaourt",
        "mozzarella",
        "parmesan",
    ],
    "eggs": ["egg", "oeuf", "œuf", "mayonnaise", "mayo"],
    "fish": [
        "fish",
        "poisson",
        "salmon",
        "saumon",
        "tuna",
        "thon",
        "cod",
        "cabillaud",
        "herring",
        "hareng",
        "anchovy",
        "anchois",
    ],
    "shellfish": [
        "shrimp",
        "crevette",
        "crab",
        "crabe",
        "lobster",
        "homard",
        "mussels",
        "moules",
        "oyster",
        "huître",
        "scallops",
        "st jacques",
    ],
    "nuts": [
        "nut",
        "noix",
        "almond",
        "amande",
        "walnut",
        "pecan",
        "cashew",
        "cajou",
        "hazelnut",
        "noisette",
        "peanut",
        "cacahuète",
        "arachide",
    ],
    "soy": ["soy", "soja", "tofu", "tempeh", "edamame"],
    "sesame": ["sesame", "sésame", "tahini"],
    "celery": ["celery", "céleri"],
    "mustard": ["mustard", "moutarde"],
    "sulfites": ["wine", "vin", "dried fruit", "fruit sec"],
    "lupin": ["lupin"],
    "mollusks": ["snail", "escargot", "squid", "calamar", "octopus", "poulpe"],
}

# ============================================================================
# MODÈLES PYDANTIC - UPDATED
# ============================================================================


class EnrichedAttributes(BaseModel):
    ingredients: List[str] = Field(default_factory=list)
    ingredient_weights: Dict[str, float] = Field(default_factory=dict)
    nova_score: int = Field(ge=1, le=4, default=2)
    nutriscore: str = "C"
    sensory_keywords: List[str] = Field(default_factory=list)
    dietary_tags: List[str] = Field(default_factory=list)
    allergens: List[str] = Field(default_factory=list)  # NEW!
    primary_protein: Optional[str] = None
    carbon_estimate: float = 5.0
    estimated_cost: float = 0.0


class SubScores(BaseModel):
    s_planet: float = Field(ge=0, le=10)
    s_pleasure: float = Field(ge=0, le=10)
    s_fit: float = Field(ge=0, le=10)


class ScoredDish(BaseModel):
    id: int
    name: str
    description: str
    price: Optional[float]
    restaurant_name: str  # NEW!
    total_score: float
    sub_scores: SubScores
    rank_index: int
    comment: str
    enriched_attributes: EnrichedAttributes


class RestaurantRanking(BaseModel):  # NEW!
    restaurant_name: str
    average_score: float
    dish_count: int
    best_dish: str
    plant_based_percentage: float


class SwapSuggestion(BaseModel):
    dish_id: int
    dish_name: str
    current_ingredient: str
    suggested_ingredient: str
    estimated_savings_co2: float
    estimated_savings_cost: float
    score_improvement: float
    rationale: str


class MenuStats(BaseModel):
    average_sustainability_score: float
    average_pleasure_score: float
    average_fit_score: float
    average_total_score: float
    total_dishes: int
    plant_based_percentage: float
    high_nova_percentage: float


class MenuAnalysisResult(BaseModel):
    scored_dishes: List[ScoredDish]
    overall_menu_stats: MenuStats
    restaurant_rankings: Optional[List[RestaurantRanking]] = None  # NEW!
    swap_suggestions: Optional[List[SwapSuggestion]] = None


# ============================================================================
# LLM HELPER (MINIMAL)
# ============================================================================


def extract_with_llm(dish_name: str, description: str) -> Dict:
    """Extract ingredients with BLACKBOX AI - falls back to empty if no API key"""
    if not HAS_LLM:
        return {
            "ingredients": [],
            "weights": {},
            "nova": 2,
            "confidence": 0.0,
            "llm_used": False,
        }

    prompt = f"""Tu es un expert en analyse alimentaire. Analyse ce plat de restaurant français.

Plat: {dish_name}
Description: {description}

Retourne UNIQUEMENT un JSON valide avec:
- ingredients: liste des ingrédients principaux (en anglais, minuscules, ex: ["beef", "potato", "carrot"])
- weights: dictionnaire ingrédient:grammes (portions réalistes, ex: {{"beef": 200, "potato": 150}})
- nova: 1-4 (1=frais/non transformé, 2=ingrédients culinaires, 3=aliments transformés, 4=ultra-transformés)
- confidence: 0.0-1.0 (ta confiance dans l'analyse)

Exemple de sortie:
{{"ingredients": ["beef", "potato", "carrot"], "weights": {{"beef": 200, "potato": 150, "carrot": 80}}, "nova": 1, "confidence": 0.9}}

Retourne UNIQUEMENT le JSON, sans explication."""

    try:
        response = requests.post(
            "https://api.blackbox.ai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {BLACKBOX_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "messages": [{"role": "user", "content": prompt}],
                "model": "blackboxai/openai/gpt-4o-mini",
                "temperature": 0.2,
                "max_tokens": 500,
            },
            timeout=20,
        )

        if response.status_code == 200:
            result = response.json()
            content = (
                result.get("choices", [{}])[0].get("message", {}).get("content", "")
            )

            import re

            json_match = re.search(r"\{.*\}", content, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                if "ingredients" in data and "weights" in data and "nova" in data:
                    data["llm_used"] = True
                    return data

        return {
            "ingredients": [],
            "weights": {},
            "nova": 2,
            "confidence": 0.0,
            "llm_used": False,
        }

    except Exception as e:
        return {
            "ingredients": [],
            "weights": {},
            "nova": 2,
            "confidence": 0.0,
            "llm_used": False,
        }


# ============================================================================
# ANALYSEUR AMÉLIORÉ + LLM
# ============================================================================


class ImprovedAnalyzer:
    """Analyse enrichie adaptée aux menus Bistro, Tacos & World Food"""

    DIETARY_TAGS = {
        "vegan": ["vegan", "végétal", "100% végétal", "plant-based"],
        "vegetarian": ["vegetarian", "végétarien", "veggie"],
        "gluten-free": ["gluten-free", "sans gluten", "gf", "corn tortilla"],
        "dairy-free": ["dairy-free", "sans lactose", "sans produits laitiers"],
        "halal": ["halal", "viande certifiée", "sans porc"],
        "kosher": ["kosher", "casher"],
        "organic": ["organic", "bio", "biologique", "nature"],
        "local": [
            "local",
            "du terroir",
            "de saison",
            "aveyron",
            "normandie",
            "bretagne",
        ],
    }

    SENSORY_POSITIVE = [
        "crispy",
        "croustillant",
        "crunchy",
        "pané",
        "juicy",
        "juteux",
        "tendre",
        "tender",
        "moelleux",
        "creamy",
        "crémeux",
        "onctueux",
        "fondant",
        "melting",
        "coulant",
        "umami",
        "savory",
        "savoureux",
        "gourmand",
        "spicy",
        "épicé",
        "piquant",
        "relevé",
        "harissa",
        "rich",
        "riche",
        "beurré",
        "aromatic",
        "aromatique",
        "flavorful",
        "parfumé",
        "sweet",
        "doux",
        "sucré-salé",
        "grilled",
        "grillé",
        "roasted",
        "rôti",
        "braisé",
        "mijoté",
        "snacké",
        "caramélisé",
        "fumé",
        "smoked",
        "confit",
    ]

    ULTRA_PROCESSED_MARKERS = [
        "nugget",
        "tenders",
        "cordon bleu",
        "surimi",
        "sauce fromagère",
        "cheese sauce",
        "fromage fondu",
        "pain industriel",
        "galette de blé",
        "reconstituted",
        "reconstitué",
        "VSM",
        "instant",
        "ready-to-eat",
        "prêt à manger",
        "artificial",
        "artificiel",
        "arôme",
        "emulsifier",
        "émulsifiant",
        "stabilisant",
        "modified starch",
        "amidon modifié",
        "high fructose",
        "sirop de glucose",
        "hydrogenated",
        "hydrogéné",
        "huile de palme",
    ]

    def enrich_dish(self, dish_data: dict) -> EnrichedAttributes:
        text = f"{dish_data.get('name', '')} {dish_data.get('description', '')}".lower()

        # 1. Extraction LLM (Optionnel)
        llm_data = extract_with_llm(
            dish_data.get("name", ""), dish_data.get("description", "")
        )

        if (
            llm_data.get("confidence", 0) > 0.5
            and llm_data.get("ingredients")
            and llm_data.get("llm_used", False)
        ):
            ingredients = llm_data["ingredients"]
            weights = llm_data.get("weights", {})
            nova = llm_data.get("nova", 2)
        else:
            ingredients = self._extract_ingredients(text)
            weights = {ing: 150.0 for ing in ingredients}
            nova = self._nova_score_correct(text)

        primary = self._identify_protein(text) or (
            ingredients[0] if ingredients else None
        )
        carbon = (
            self._estimate_carbon_with_weights(weights)
            if weights
            else self._estimate_carbon(text)
        )
        cost = self._estimate_cost(weights, dish_data.get("price"))
        nutri = self._calculate_nutriscore(ingredients)
        allergens = self._detect_allergens(text, ingredients)  # NEW!

        return EnrichedAttributes(
            ingredients=ingredients,
            ingredient_weights=weights,
            nova_score=nova,
            nutriscore=nutri,
            sensory_keywords=self._extract_sensory(text),
            dietary_tags=self._extract_dietary(text),
            allergens=allergens,  # NEW!
            primary_protein=primary,
            carbon_estimate=carbon,
            estimated_cost=cost,
        )

    def _extract_ingredients(self, text: str) -> List[str]:
        found = []
        for ingredient in CARBON_DB.keys():
            if ingredient in text:
                found.append(ingredient)
        return found[:12]

    def _nova_score_correct(self, text: str) -> int:
        if any(marker in text for marker in self.ULTRA_PROCESSED_MARKERS):
            return 4
        if any(
            word in text
            for word in [
                "canned",
                "conserve",
                "smoked",
                "fumé",
                "cured",
                "saucisson",
                "jambon",
                "bacon",
            ]
        ):
            return 3
        if any(
            word in text
            for word in [
                "fresh",
                "frais",
                "raw",
                "cru",
                "organic",
                "bio",
                "homemade",
                "maison",
                "du jour",
                "minute",
            ]
        ):
            return 1
        return 2

    def _extract_sensory(self, text: str) -> List[str]:
        return [kw for kw in self.SENSORY_POSITIVE if kw in text]

    def _extract_dietary(self, text: str) -> List[str]:
        tags = []

        for tag, keywords in self.DIETARY_TAGS.items():
            if any(kw in text for kw in keywords):
                tags.append(tag)

        animal_products = [
            "beef",
            "boeuf",
            "bœuf",
            "steak",
            "bavette",
            "tartare",
            "chicken",
            "poulet",
            "volaille",
            "nuggets",
            "tenders",
            "ham",
            "pork",
            "porc",
            "bacon",
            "lardon",
            "jambon",
            "saucisse",
            "merguez",
            "duck",
            "canard",
            "magret",
            "foie gras",
            "lamb",
            "agneau",
            "kebab",
            "viande",
            "fish",
            "poisson",
            "salmon",
            "saumon",
            "tuna",
            "thon",
            "cod",
            "cabillaud",
            "shrimp",
            "crevette",
            "mussels",
            "moules",
            "scallops",
            "saint-jacques",
            "escargot",
            "snail",
            "escargots",
            "snails",
            "cheese",
            "fromage",
            "cream",
            "crème",
            "butter",
            "beurre",
            "egg",
            "oeuf",
            "œuf",
            "honey",
            "miel",
        ]

        has_animal = any(p in text for p in animal_products)

        if not has_animal and "vegan" not in tags:
            plant_proteins = [
                "tofu",
                "lentil",
                "lentilles",
                "chickpea",
                "pois chiche",
                "mushroom",
                "champignon",
                "falafel",
            ]
            if any(p in text for p in plant_proteins):
                tags.append("vegan")

        meat_fish = [
            p
            for p in animal_products
            if p
            not in [
                "cheese",
                "fromage",
                "cream",
                "crème",
                "butter",
                "beurre",
                "egg",
                "oeuf",
                "œuf",
                "honey",
                "miel",
            ]
        ]
        has_meat_fish = any(m in text for m in meat_fish)

        if not has_meat_fish and "vegetarian" not in tags and "vegan" not in tags:
            tags.append("vegetarian")

        return tags

    def _detect_allergens(self, text: str, ingredients: List[str]) -> List[str]:
        """NEW: Detect allergens in dish"""
        detected = []
        for allergen, keywords in ALLERGEN_DB.items():
            if any(kw in text for kw in keywords) or any(
                kw in ingredients for kw in keywords
            ):
                detected.append(allergen)
        return detected

    def _identify_protein(self, text: str) -> Optional[str]:
        protein_priority = [
            ("lamb", ["lamb", "agneau", "gigot", "merguez", "kebab", "viande grecque"]),
            (
                "beef",
                [
                    "beef",
                    "boeuf",
                    "bœuf",
                    "steak",
                    "entrecote",
                    "bavette",
                    "tartare",
                    "burger",
                ],
            ),
            ("duck", ["duck", "canard", "magret", "confit", "foie gras"]),
            ("snails", ["snail", "escargot", "escargots"]),  # ⚠️ ADDED!
            ("veal", ["veal", "veau", "ris de veau", "foie de veau"]),
            (
                "pork",
                [
                    "pork",
                    "porc",
                    "bacon",
                    "lardon",
                    "jambon",
                    "ribs",
                    "travers",
                    "saucisse",
                    "andouillette",
                ],
            ),
            ("chicken", ["chicken", "poulet", "volaille", "wings", "dinde"]),
            ("nuggets", ["nuggets", "tenders", "cordon bleu"]),
            ("salmon", ["salmon", "saumon", "gravlax"]),
            ("tuna", ["tuna", "thon"]),
            ("scallops", ["scallops", "saint-jacques", "st jacques"]),
            ("shrimp", ["shrimp", "crevette", "gambas"]),
            (
                "fish",
                [
                    "fish",
                    "poisson",
                    "cod",
                    "cabillaud",
                    "haddock",
                    "merlan",
                    "lieu",
                    "bar",
                    "maigre",
                    "dorade",
                ],
            ),
            ("mussels", ["mussels", "moules"]),
            ("egg", ["egg", "oeuf", "œuf", "omelette"]),
            ("cheese", ["burrata", "mozzarella", "camembert", "halloumi", "paneer"]),
            ("lentils", ["lentil", "lentilles"]),
            ("chickpeas", ["chickpea", "pois chiche", "houmous", "falafel"]),
            ("tofu", ["tofu"]),
        ]

        for protein, keywords in protein_priority:
            if any(kw in text for kw in keywords):
                return protein
        return None

    def _estimate_carbon(self, text: str) -> float:
        carbon_values = []
        for ingredient, carbon in CARBON_DB.items():
            if ingredient in text:
                carbon_values.append(carbon)
        if carbon_values:
            return max(carbon_values)
        return 5.0

    def _estimate_carbon_with_weights(self, weights: Dict[str, float]) -> float:
        total_carbon = 0.0
        total_weight = sum(weights.values())
        if total_weight == 0:
            return 5.0

        for ingredient, grams in weights.items():
            carbon_per_kg = CARBON_DB.get(ingredient, 5.0)
            total_carbon += carbon_per_kg * (grams / 1000)
        return total_carbon

    def _estimate_cost(
        self, weights: Dict[str, float], menu_price: Optional[float]
    ) -> float:
        if menu_price:
            return menu_price * 0.30

        total_cost = 0.0
        for ingredient, grams in weights.items():
            price_per_kg = PRICE_DB.get(ingredient, 10.0)
            total_cost += price_per_kg * (grams / 1000)

        return total_cost if total_cost > 0 else 4.0

    def _calculate_nutriscore(self, ingredients: List[str]) -> str:
        if not ingredients:
            return "C"
        scores = [NUTRISCORE_DB.get(ing, 3) for ing in ingredients]
        avg = sum(scores) / len(scores)
        if avg >= 4.5:
            return "A"
        elif avg >= 3.5:
            return "B"
        elif avg >= 2.5:
            return "C"
        elif avg >= 1.5:
            return "D"
        else:
            return "E"


# ============================================================================
# SCOREUR AMÉLIORÉ
# ============================================================================


class ImprovedScorer:
    """Scoreur avec formules améliorées et swaps garantis"""

    def __init__(self):
        self.analyzer = ImprovedAnalyzer()
        # UPDATED: Slightly favor planet score for sustainability nudging

        self.weights = {"fit": 0.25, "pleasure": 0.30, "planet": 0.45}

    def process_menu_for_consumer(
        self, menu: List[dict], user_profile: dict, top_n: int = 10
    ) -> dict:
        """Mode B2C - Pour consommateurs"""
        scored = []
        filtered_out_count = 0  # Track how many dishes were filtered

        for dish in menu:
            enriched = self.analyzer.enrich_dish(dish)

            s_planet = self._planet_score_v2(enriched)
            s_pleasure = self._pleasure_score_v2(enriched)
            s_fit = self._fit_consumer(enriched, user_profile)

            # Skip dishes with score 0 (incompatible)
            if s_fit == 0.0:
                filtered_out_count += 1
                continue

            total = (
                s_fit * self.weights["fit"]
                + s_pleasure * self.weights["pleasure"]
                + s_planet * self.weights["planet"]
            )

            scored.append(
                ScoredDish(
                    id=dish["id"],
                    name=dish["name"],
                    description=dish["description"],
                    price=dish.get("price"),
                    restaurant_name=dish.get("restaurant_name", "Unknown"),  # NEW!
                    total_score=round(total, 2),
                    sub_scores=SubScores(
                        s_planet=round(s_planet, 2),
                        s_pleasure=round(s_pleasure, 2),
                        s_fit=round(s_fit, 2),
                    ),
                    rank_index=0,
                    comment=self._comment_consumer(
                        enriched, s_planet, s_pleasure, s_fit
                    ),
                    enriched_attributes=enriched,
                )
            )

        scored.sort(key=lambda x: x.total_score, reverse=True)
        for idx, dish in enumerate(scored):
            dish.rank_index = idx

        # Limit to top N
        top_dishes = scored[:top_n]

        # Calculate restaurant rankings (only from compatible dishes)
        resto_rankings = self._calculate_restaurant_rankings(scored) if scored else []

        # Build stats with filter info
        stats = self._calc_stats(scored)

        result = MenuAnalysisResult(
            scored_dishes=top_dishes,
            overall_menu_stats=stats,
            restaurant_rankings=resto_rankings,
        ).model_dump()

        # Add helpful message if many dishes filtered
        if filtered_out_count > 0:
            result["filter_info"] = {
                "filtered_out_count": filtered_out_count,
                "compatible_dishes_found": len(scored),
                "message": f"🔍 {filtered_out_count} plats filtrés selon vos préférences alimentaires",
            }

        return result

    def process_menu_for_restaurant(self, menu: List[dict], top_n: int = 10) -> dict:
        """Mode B2B - Pour restaurants"""
        scored = []

        for dish in menu:
            enriched = self.analyzer.enrich_dish(dish)

            s_planet = self._planet_score_v2(enriched)
            s_pleasure = self._pleasure_score_v2(enriched)
            s_fit = self._fit_b2b(enriched)

            total = (
                s_fit * self.weights["fit"]
                + s_pleasure * self.weights["pleasure"]
                + s_planet * self.weights["planet"]
            )

            scored.append(
                ScoredDish(
                    id=dish["id"],
                    name=dish["name"],
                    description=dish["description"],
                    price=dish.get("price"),
                    restaurant_name=dish.get("restaurant_name", "Unknown"),  # NEW!
                    total_score=round(total, 2),
                    sub_scores=SubScores(
                        s_planet=round(s_planet, 2),
                        s_pleasure=round(s_pleasure, 2),
                        s_fit=round(s_fit, 2),
                    ),
                    rank_index=0,
                    comment=self._comment_b2b(enriched, s_planet),
                    enriched_attributes=enriched,
                )
            )

        scored.sort(key=lambda x: x.total_score, reverse=True)
        for idx, dish in enumerate(scored):
            dish.rank_index = idx

        top_dishes = scored[:top_n]
        swaps = self._generate_swaps_robust(scored)
        resto_rankings = self._calculate_restaurant_rankings(scored)

        return MenuAnalysisResult(
            scored_dishes=top_dishes,
            overall_menu_stats=self._calc_stats(scored),
            restaurant_rankings=resto_rankings,
            swap_suggestions=swaps,
        ).model_dump()

    def _calculate_restaurant_rankings(
        self, scored: List[ScoredDish]
    ) -> List[RestaurantRanking]:
        """NEW: Calculate per-restaurant rankings"""
        resto_data = {}

        for dish in scored:
            resto = dish.restaurant_name
            if resto not in resto_data:
                resto_data[resto] = {"dishes": [], "scores": [], "plant_based_count": 0}

            resto_data[resto]["dishes"].append(dish.name)
            resto_data[resto]["scores"].append(dish.total_score)

            if (
                "vegan" in dish.enriched_attributes.dietary_tags
                or "vegetarian" in dish.enriched_attributes.dietary_tags
            ):
                resto_data[resto]["plant_based_count"] += 1

        rankings = []
        for resto, data in resto_data.items():
            avg_score = sum(data["scores"]) / len(data["scores"])
            best_idx = data["scores"].index(max(data["scores"]))

            rankings.append(
                RestaurantRanking(
                    restaurant_name=resto,
                    average_score=round(avg_score, 2),
                    dish_count=len(data["dishes"]),
                    best_dish=data["dishes"][best_idx],
                    plant_based_percentage=round(
                        data["plant_based_count"] / len(data["dishes"]) * 100, 1
                    ),
                )
            )

        rankings.sort(key=lambda x: x.average_score, reverse=True)

        return rankings

    def _planet_score_v2(self, e: EnrichedAttributes) -> float:
        carbon = e.carbon_estimate

        # Recalibrated thresholds for typical dish portions
        if carbon < 1.0:  # Vegan/veggie dishes
            base_score = 10.0
        elif carbon < 2.5:  # Fish, chicken
            base_score = 6.5
        elif carbon < 4.0:  # Pork, dairy-heavy
            base_score = 5.0
        elif carbon < 6.0:  # Lamb, some beef
            base_score = 3.0
        elif carbon < 8.0:  # Beef dishes
            base_score = 2.0
        else:  # High-impact (>8kg)
            base_score = 1.0

            # NEW: Bonus for plant-based (justified: lower water use, biodiversity impact)
            if "vegan" in e.dietary_tags:
                base_score = min(10.0, base_score + 1.0)
            elif "vegetarian" in e.dietary_tags:
                base_score = min(10.0, base_score + 0.5)

                # 🆕 PENALTY: Reduce score if meat detected in ingredients
            meat_keywords = [
                "beef",
                "boeuf",
                "chicken",
                "poulet",
                "pork",
                "porc",
                "lamb",
                "agneau",
                "duck",
                "canard",
                "veal",
                "veau",
                "turkey",
                "dinde",
                "meat",
                "viande",
            ]

            has_meat = any(
                keyword in ing.lower()
                for ing in e.ingredients
                for keyword in meat_keywords
            )

            if has_meat:
                base_score = max(1, base_score - 1.0)  # Meat penalty

        return max(1, min(10, base_score))

    def _pleasure_score_v2(self, e: EnrichedAttributes) -> float:
        score = 6.0

        # Sensory keywords boost (unchanged)
        score += min(len(e.sensory_keywords) * 0.7, 3.0)

        # Texture bonus (unchanged)
        texture_words = ["crispy", "croustillant", "tender", "tendre", "fondant"]
        if sum(1 for kw in e.sensory_keywords if kw in texture_words) >= 2:
            score += 0.8

        # NOVA penalties (unchanged)
        if e.nova_score == 4:
            score -= 1.5
        if e.nova_score == 1:
            score += 0.5

        # NEW: Small pleasure boost for plant-based (combat "vegan = boring" bias)
        if "vegan" in e.dietary_tags:
            score += 0.5

        return max(0, min(10, score))

    def _fit_consumer(self, e: EnrichedAttributes, profile: dict) -> float:
        """Enhanced consumer fit with safety improvements + plant-based nudging"""
        score = 5.0
        restriction = profile.get("dietary_restriction", "").lower()
        goal = profile.get("goal", "").lower()
        allergens = profile.get("allergens", [])
        strict_filter = profile.get("strict_filter", True)

        # CRITICAL: Check allergens FIRST (unchanged - already safe)
        for allergen in allergens:
            if allergen in e.allergens:
                return 0.0  # Immediate disqualification

        # IMPROVED: Amplified Nutri-Score impact (plant-based foods tend to score better)
        nutri_bonus = {"A": 2.5, "B": 1.5, "C": 0, "D": -1.5, "E": -2.5}
        score += nutri_bonus.get(e.nutriscore, 0)

        # ========================================================================
        # DIETARY RESTRICTIONS (Enhanced safety + explicit protein checks)
        # ========================================================================

        if restriction == "vegan":
            if "vegan" in e.dietary_tags:
                score += 4.0
            elif "vegetarian" in e.dietary_tags:
                # Extra safety: check if truly vegan (no dairy/eggs)
                has_animal_products = any(
                    a in e.allergens for a in ["lactose", "eggs", "fish", "shellfish"]
                )
                if has_animal_products:
                    if strict_filter:
                        return 0.0  # Not actually vegan
                    else:
                        score -= 2.0
                else:
                    score += 1.0  # Potentially veganizable
            else:
                # Contains meat/fish
                if strict_filter:
                    return 0.0  # Hard filter
                else:
                    score -= 3.0

        elif restriction == "vegetarian":
            if "vegan" in e.dietary_tags or "vegetarian" in e.dietary_tags:
                score += 3.5
            # Enhanced check: explicit protein filtering
            elif e.primary_protein in [
                "beef",
                "boeuf",
                "chicken",
                "poulet",
                "pork",
                "porc",
                "lamb",
                "agneau",
                "duck",
                "canard",
                "fish",
                "poisson",
                "salmon",
                "saumon",
                "shrimp",
                "crevette",
                "tuna",
                "kebab",
                "nuggets",
                "merguez",
            ]:
                if strict_filter:
                    return 0.0  # Hard filter
                else:
                    score -= 2.5
            else:
                # Ambiguous - be cautious
                if strict_filter:
                    return 0.0  # When in doubt, filter out for safety
                else:
                    score -= 1.0

        elif restriction == "gluten-free":
            if "gluten-free" in e.dietary_tags:
                score += 3.5
            # Enhanced: check allergen detection
            elif "gluten" in e.allergens:
                if strict_filter:
                    return 0.0
                else:
                    score -= 3.0

        elif restriction == "halal":
            if "halal" in e.dietary_tags:
                score += 4.0
            # Enhanced: explicit pork ingredient check
            elif e.primary_protein in ["pork", "porc"] or any(
                ing in e.ingredients
                for ing in ["pork", "porc", "bacon", "lardon", "ham", "jambon"]
            ):
                if strict_filter:
                    return 0.0  # Hard filter
                else:
                    score -= 5.0

        # ========================================================================
        # NEW: UNIVERSAL PLANT-BASED HEALTH BONUS (for users without restrictions)
        # Science-backed: higher fiber, micronutrients, lower saturated fat
        # ========================================================================

        if not restriction:  # Only for omnivores (show them the benefits!)
            if "vegan" in e.dietary_tags:
                score += 1.5  # Health benefit bonus
            elif "vegetarian" in e.dietary_tags:
                score += 1.0

        # ========================================================================
        # HEALTH GOALS (Enhanced with plant-based preference)
        # ========================================================================

        if "weight_loss" in goal or "perte" in goal:
            # Low carbon + unprocessed foods
            if e.carbon_estimate < 5.0 and e.nova_score <= 2:
                score += 2.0
            # NEW: Extra boost for plant-based (science: lower calorie density, higher fiber)
            if "vegan" in e.dietary_tags or "vegetarian" in e.dietary_tags:
                score += 1.0

        elif "muscle" in goal or "sport" in goal or "athlete" in goal:
            # Protein-rich options (unchanged base logic)
            if e.primary_protein in [
                "chicken",
                "poulet",
                "tofu",
                "tempeh",
                "salmon",
                "saumon",
                "lentils",
                "lentilles",
            ]:
                score += 2.0
            # NEW: Bonus for plant proteins (combat "you need meat" myth)
            if e.primary_protein in [
                "tofu",
                "tempeh",
                "lentils",
                "lentilles",
                "chickpeas",
                "pois chiches",
            ]:
                score += 0.5

        return max(0, min(10, score))

    def _fit_b2b(self, e: EnrichedAttributes) -> float:
        score = 5.0  # Base score

        # Reward dietary inclusivity (max +3)
        if "vegan" in e.dietary_tags:
            score += 3.0  # Most inclusive
        elif "vegetarian" in e.dietary_tags:
            score += 2.0
        elif "pescatarian" in e.dietary_tags:
            score += 1.0

        # Reward allergen safety (max +2)
        allergen_penalty = len(e.allergens) * 0.5
        score -= allergen_penalty

        nutri_scores = [NUTRISCORE_DB.get(ing, 3) for ing in e.ingredients]
        nutriscore_avg = sum(nutri_scores) / len(nutri_scores) if nutri_scores else 3.0

        if nutriscore_avg >= 4.0:
            score += 2.0
        elif nutriscore_avg >= 3.0:
            score += 1.0

        # Penalize very high carbon (sustainability matters for B2B)
        if e.carbon_estimate > 6.0:
            score -= 1.0

        return max(0, min(10, score))

    def _comment_consumer(self, e, s_planet, s_pleasure, s_fit) -> str:
        parts = []

        if e.allergens:
            parts.append(f"⚠️ Allergènes: {', '.join(e.allergens[:3])}")

        if e.nutriscore in ["A", "B"]:
            parts.append(f"Nutri-Score {e.nutriscore}")

        if s_fit >= 7.0:
            parts.append("Parfait pour vous")
        if s_planet >= 8.0:
            parts.append("Éco-responsable")
        if s_pleasure >= 7.0:
            parts.append("Très savoureux")
        if e.dietary_tags:
            parts.append(", ".join(e.dietary_tags[:2]))

        return " • ".join(parts) if parts else "Bonne option"

    def _comment_b2b(self, e, s_planet) -> str:
        parts = []

        if s_planet >= 8.0:
            parts.append("Plat star durable")
        elif s_planet < 4.0:
            parts.append("Forte empreinte carbone")

        if len(e.dietary_tags) >= 2:
            parts.append(f"Inclusif ({len(e.dietary_tags)} régimes)")

        if e.nova_score >= 3:
            parts.append(f"NOVA {e.nova_score} - Transformé")

        return " • ".join(parts) if parts else "Plat standard"

    def _generate_swaps_robust(self, scored: List[ScoredDish]) -> List[SwapSuggestion]:
        swaps = []

        swap_rules = [
            {
                "from": ["beef", "boeuf", "bœuf", "steak"],
                "from_name": "bœuf",
                "to": "lentilles",
                "co2_saved": 23.1,
                "cost_from": 18.0,
                "cost_to": 3.0,
                "weight": 0.2,
            },
            {
                "from": ["lamb", "agneau"],
                "from_name": "agneau",
                "to": "champignons",
                "co2_saved": 37.5,
                "cost_from": 22.0,
                "cost_to": 8.0,
                "weight": 0.2,
            },
            {
                "from": ["chicken", "poulet"],
                "from_name": "poulet",
                "to": "tempeh",
                "co2_saved": 4.3,
                "cost_from": 8.0,
                "cost_to": 6.0,
                "weight": 0.2,
            },
            {
                "from": ["pork", "porc"],
                "from_name": "porc",
                "to": "tofu",
                "co2_saved": 5.6,
                "cost_from": 12.0,
                "cost_to": 5.0,
                "weight": 0.2,
            },
            {
                "from": ["shrimp", "crevette"],
                "from_name": "crevettes",
                "to": "tofu",
                "co2_saved": 24.0,
                "cost_from": 30.0,
                "cost_to": 5.0,
                "weight": 0.15,
            },
        ]

        for dish in scored:
            text = (dish.name + " " + dish.description).lower()

            for rule in swap_rules:
                if any(word in text for word in rule["from"]):
                    co2_saved = rule["co2_saved"] * rule["weight"]
                    cost_saved = (rule["cost_from"] - rule["cost_to"]) * rule["weight"]

                    swaps.append(
                        SwapSuggestion(
                            dish_id=dish.id,
                            dish_name=dish.name,
                            current_ingredient=rule["from_name"],
                            suggested_ingredient=rule["to"],
                            estimated_savings_co2=round(co2_saved, 2),
                            estimated_savings_cost=round(cost_saved, 2),
                            score_improvement=round(10.0 - dish.sub_scores.s_planet, 2),
                            rationale=f"💰 Économie: {cost_saved:.2f}€/plat • 🌍 -{co2_saved:.1f}kg CO2e",
                        )
                    )
                    break

        return swaps

    def _calc_stats(self, scored: List[ScoredDish]) -> MenuStats:
        if not scored:
            return MenuStats(
                average_sustainability_score=0,
                average_pleasure_score=0,
                average_fit_score=0,
                average_total_score=0,
                total_dishes=0,
                plant_based_percentage=0,
                high_nova_percentage=0,
            )

        n = len(scored)
        return MenuStats(
            average_sustainability_score=round(
                sum(d.sub_scores.s_planet for d in scored) / n, 2
            ),
            average_pleasure_score=round(
                sum(d.sub_scores.s_pleasure for d in scored) / n, 2
            ),
            average_fit_score=round(sum(d.sub_scores.s_fit for d in scored) / n, 2),
            average_total_score=round(sum(d.total_score for d in scored) / n, 2),
            total_dishes=n,
            plant_based_percentage=round(
                sum(
                    1
                    for d in scored
                    if "vegan" in d.enriched_attributes.dietary_tags
                    or "vegetarian" in d.enriched_attributes.dietary_tags
                )
                / n
                * 100,
                1,
            ),
            high_nova_percentage=round(
                sum(1 for d in scored if d.enriched_attributes.nova_score >= 3)
                / n
                * 100,
                1,
            ),
        )


# ============================================================================
# API PUBLIQUE - UPDATED
# ============================================================================


def score_menu_for_consumer(
    menu: List[dict], user_profile: dict, top_n: int = 10
) -> dict:
    """
    Score un menu pour un consommateur (B2C)

    Args:
        menu: Liste de dicts avec {id, name, description, price, restaurant_name}
        user_profile: Dict avec {
            dietary_restriction: str ("vegan", "vegetarian", "halal", "gluten-free", ""),
            goal: str ("weight_loss", "muscle_gain", "athlete", ""),
            allergens: list (["lactose", "gluten", "nuts", ...]),
            strict_filter: bool (True = hide incompatible dishes, False = show with low score)
        }
        top_n: Nombre de plats à retourner (défaut 10)

    Returns:
        Dict avec {
            scored_dishes: [...],
            overall_menu_stats: {...},
            restaurant_rankings: [...],
            filter_info: {  # Only if dishes were filtered
                filtered_out_count: int,
                compatible_dishes_found: int,
                message: str
            }
        }

    Example:
        >>> menu = [
        ...     {"id": 1, "name": "Burger", "description": "Beef burger", "price": 14, "restaurant_name": "Le Bistrot"},
        ...     {"id": 2, "name": "Salade", "description": "Green salad", "price": 10, "restaurant_name": "Green Kitchen"}
        ... ]
        >>> profile = {"dietary_restriction": "vegan", "allergens": ["gluten"], "strict_filter": True}
        >>> result = score_menu_for_consumer(menu, profile, top_n=5)
        >>> # Returns only vegan, gluten-free dishes
        >>> # result['filter_info']['message'] = "🔍 1 plats filtrés selon vos préférences alimentaires"
    """
    return ImprovedScorer().process_menu_for_consumer(menu, user_profile, top_n)


def score_menu_for_restaurant(menu: List[dict], top_n: int = 10) -> dict:
    """
    Score un menu pour un restaurant (B2B)

    Args:
        menu: Liste de dicts avec {id, name, description, price, restaurant_name}
        top_n: Nombre de plats à retourner (défaut 10)

    Returns:
        Dict avec scored_dishes, stats, restaurant_rankings, swap_suggestions
    """
    return ImprovedScorer().process_menu_for_restaurant(menu, top_n)
