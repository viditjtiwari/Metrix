#!/usr/bin/env python3
"""Convenience runner for seeding development accounts."""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.scripts.seed_dev_users import seed_development_data

if __name__ == "__main__":
    seed_development_data()
