"""
NGROK DEPLOYMENT SCRIPT
=======================
Deploy FastAPI with ngrok tunnel for public access
"""

import subprocess
import sys
import os
import time
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


def check_dependencies():
    """Check if required packages are installed"""
    required = {
        "fastapi": "fastapi",
        "uvicorn": "uvicorn[standard]",
        "python-multipart": "python-multipart",
        "pyngrok": "pyngrok",
    }

    missing = []
    for package, install_name in required.items():
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            missing.append(install_name)

    if missing:
        print(f"📦 Installing missing packages: {', '.join(missing)}")
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing)
        print("✅ Dependencies installed\n")


def setup_ngrok():
    """Setup ngrok authentication"""
    from pyngrok import conf, ngrok

    ngrok_token = os.environ.get("NGROK_AUTHTOKEN")

    if not ngrok_token:
        print("\n⚠️  NGROK_AUTHTOKEN not found in environment")
        print("To get a token:")
        print("1. Sign up at https://dashboard.ngrok.com/signup")
        print(
            "2. Get your auth token from https://dashboard.ngrok.com/get-started/your-authtoken"
        )
        print("3. Set it: export NGROK_AUTHTOKEN='your_token_here'")
        print("\nOr run without auth (limited to 1 hour sessions)")

        use_without_auth = input("\nContinue without auth? (y/n): ").lower() == "y"
        if not use_without_auth:
            sys.exit(1)
    else:
        conf.get_default().auth_token = ngrok_token
        print("✅ Ngrok authenticated\n")


def start_server():
    """Start FastAPI server with ngrok tunnel"""
    from pyngrok import ngrok
    import uvicorn

    PORT = 8000

    print("=" * 60)
    print("🚀 STARTING PLANT-BASED MENU SCORING API")
    print("=" * 60)

    # Start ngrok tunnel
    print(f"\n🌐 Opening ngrok tunnel on port {PORT}...")
    try:
        public_url = ngrok.connect(PORT, bind_tls=True)
        print(f"✅ Public URL: {public_url}")
        print(f"📖 API Docs: {public_url}/docs")
        print(f"🔍 Health Check: {public_url}/")

        # Test local server startup
        print(f"\n💻 Local URL: http://localhost:{PORT}")
        print(f"📖 Local Docs: http://localhost:{PORT}/docs")

    except Exception as e:
        print(f"❌ Ngrok tunnel failed: {e}")
        print("Continuing with local server only...")
        public_url = None

    print("\n" + "=" * 60)
    print("🎯 AVAILABLE ENDPOINTS:")
    print("=" * 60)
    print("POST /api/extract-menu       - Extract menu from image")
    print("POST /api/score-menu          - Score existing menu data")
    print("POST /api/full-pipeline       - Complete OCR + Scoring")
    print("=" * 60)

    print("\n💡 FRONTEND USAGE:")
    print("=" * 60)
    if public_url:
        print(f"const API_URL = '{public_url}';")
    else:
        print(f"const API_URL = 'http://localhost:{PORT}';")
    print("""
// Example: Upload menu image + get scores
const formData = new FormData();
formData.append('file', imageFile);
formData.append('restaurant_name', 'My Restaurant');
formData.append('dietary_restriction', 'vegetarian');
formData.append('allergens', 'gluten,nuts');

const response = await fetch(`${API_URL}/api/full-pipeline`, {
    method: 'POST',
    body: formData
});

const data = await response.json();
console.log(data.scoring.scored_dishes); // Ranked dishes
""")
    print("=" * 60)

    print("\n⏳ Starting server... (Press Ctrl+C to stop)\n")

    # Start FastAPI server
    try:
        uvicorn.run("api:app", host="0.0.0.0", port=PORT, reload=False)
    except KeyboardInterrupt:
        print("\n\n🛑 Shutting down server...")
        if public_url:
            ngrok.disconnect(public_url)
        print("✅ Server stopped")


def main():
    """Main deployment function"""
    print("\n🌱 PLANT-BASED MENU API DEPLOYMENT\n")

    # Check API keys
    required_keys = ["MISTRAL_API_KEY", "ANTHROPIC_API_KEY"]
    missing_keys = [k for k in required_keys if not os.environ.get(k)]

    if missing_keys:
        print(f"❌ Missing environment variables: {', '.join(missing_keys)}")
        print("\nMake sure your .env file contains:")
        print("MISTRAL_API_KEY=your_key_here")
        print("ANTHROPIC_API_KEY=your_key_here")
        print("NGROK_AUTHTOKEN=your_token_here (optional)")
        sys.exit(1)

    # Check dependencies
    check_dependencies()

    # Setup ngrok
    setup_ngrok()

    # Start server
    start_server()


if __name__ == "__main__":
    main()
