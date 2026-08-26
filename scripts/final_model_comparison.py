"""
Final Model Comparison for Hackathon
Compares all models trained
"""

import pandas as pd
import pickle
from sklearn.metrics import r2_score, mean_absolute_error
import numpy as np

print("=" * 60)
print("🏆 FINAL MODEL COMPARISON")
print("=" * 60)

# Load the test data
df = pd.read_csv('data/processed/urban_heat_dataset_with_uhi.csv')
features = ['temperature_c', 'humidity_pct', 'wind_speed_ms', 
            'building_count', 'avg_building_height', 'road_length_km', 
            'green_area_km2', 'hour', 'day_of_week']

X = df[features]
y = df['real_heat_stress_uhi']

# Load models
models = {}
model_files = [
    ('models/ultimate_model.pkl', 'Synthetic Model'),
    ('models/realistic_model.pkl', 'Realistic Model'),
    ('models/uhi_model.pkl', 'UHI Model')
]

print("\n📊 Model Performance Comparison:")
print("-" * 50)

for filepath, name in model_files:
    try:
        with open(filepath, 'rb') as f:
            model = pickle.load(f)
        y_pred = model.predict(X)
        r2 = r2_score(y, y_pred)
        mae = mean_absolute_error(y, y_pred)
        rmse = np.sqrt(np.mean((y - y_pred) ** 2))
        
        print(f"\n{name}:")
        print(f"   R²: {r2:.4f}")
        print(f"   MAE: {mae:.2f}°C")
        print(f"   RMSE: {rmse:.2f}°C")
    except:
        print(f"\n{name}: Model file not found")

print("\n" + "=" * 60)
print("✅ Model comparison complete!")