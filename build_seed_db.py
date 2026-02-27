# -*- coding: utf-8 -*-
"""
Build a pre-populated seed database for Vercel deployment.
Run locally: python build_seed_db.py
Output: data/itnord-seed.db (commit this file)
On Vercel cold start, app.py copies this to /tmp when DB is empty.
"""
import os
import sys
from pathlib import Path

# Ensure we write to data/ (not /tmp)
os.environ.pop('VERCEL', None)

# Set seed path before importing app
SEED_PATH = Path(__file__).parent / 'data' / 'itnord-seed.db'
SEED_PATH.parent.mkdir(parents=True, exist_ok=True)

# Temporarily override DB_PATH so init_db uses our seed path
import app as app_module
original_db_path = app_module.DB_PATH
app_module.DB_PATH = SEED_PATH

try:
    app_module.init_db()
    # Remove WAL files if created
    for p in SEED_PATH.parent.glob('itnord-seed.db*'):
        if p != SEED_PATH:
            try:
                p.unlink()
            except Exception:
                pass
    print(f'Created {SEED_PATH}')
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
finally:
    app_module.DB_PATH = original_db_path
