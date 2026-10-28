import sys
import os
from pathlib import Path

# Add project root to sys.path so imports like 'backend' and 'engine' work
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Ensure VERCEL environment flag is set
os.environ["VERCEL"] = "1"

# Import FastAPI app from backend.main
from backend.main import app

# Vercel Serverless Function entrypoint
# The ASGI application 'app' is automatically detected and served by Vercel
