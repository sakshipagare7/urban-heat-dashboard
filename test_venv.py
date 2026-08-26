import sys
import numpy as np
import pandas as pd
import matplotlib
import seaborn
import rasterio
import geopandas
import sklearn
import xgboost
import shap
import flask
import osmnx
import requests
from dotenv import load_dotenv

print("=" * 60)
print("✅ ALL PACKAGES INSTALLED SUCCESSFULLY!")
print("=" * 60)
print(f"Python version: {sys.version}")
print(f"NumPy version: {np.__version__}")
print(f"Pandas version: {pd.__version__}")
print(f"Scikit-learn version: {sklearn.__version__}")
print(f"Flask version: {flask.__version__}")
print(f"SHAP version: {shap.__version__}")
print(f"XGBoost version: {xgboost.__version__}")
print("=" * 60)
print("✅ Virtual Environment is working!")
print("✅ Ready for Phase 3: Data Collection")
print("=" * 60)