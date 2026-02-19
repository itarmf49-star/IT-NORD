# -*- coding: utf-8 -*-
"""
Vercel entrypoint: expose WSGI app for Flask.
Vercel looks for "app" (WSGI) or "handler" (BaseHTTPRequestHandler).
"""
import sys
from pathlib import Path

parent = str(Path(__file__).parent.parent)
if parent not in sys.path:
    sys.path.insert(0, parent)

# Import Flask app first so "app" is always defined
from app import app, init_db

# Initialize database (DB_PATH uses /tmp on Vercel)
try:
    init_db()
except Exception as e:
    import sys
    print(f"Init DB: {e}", file=sys.stderr, flush=True)

# Vercel Python runtime looks for "app" (WSGI) in this file
__all__ = ['app']
