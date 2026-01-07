#!/usr/bin/env python
"""Simple wrapper to run training"""
import sys
from pathlib import Path

# Add parent directory to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from model.train_model import train_model

if __name__ == "__main__":
    csv_path = project_root / "TABEL DATA LATIH HATESPEECH RISET.csv"
    if csv_path.exists():
        train_model(str(csv_path))
    else:
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)


