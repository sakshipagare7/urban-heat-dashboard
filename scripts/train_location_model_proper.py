"""
Proper Location Model Training Script
Uses existing dataset - NO external data needed
"""

import os
import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🏙️ Training PROPER Location Model")
print("=" * 60)

# Load your dataset
df = pd.read_csv('data/processed/urban_heat_dataset_with_uhi.csv')
print(f"✅ Loaded {len(df):,} records")

# Define all 26 locations with their characteristics
LOCATIONS_26 = {
    'bandra': {'buildings': 320, 'height': 28, 'roads': 150, 'green': 1.2, 'desc': 'High-density residential/commercial'},
    'colaba': {'buildings': 280, 'height': 25, 'roads': 130, 'green': 0.8, 'desc': 'Dense commercial area'},
    'bkc': {'buildings': 350, 'height': 32, 'roads': 160, 'green': 0.5, 'desc': 'Business district'},
    'lower_parel': {'buildings': 300, 'height': 30, 'roads': 145, 'green': 0.6, 'desc': 'Commercial hub'},
    'worli': {'buildings': 260, 'height': 26, 'roads': 135, 'green': 1.0, 'desc': 'Coastal residential'},
    'dadar': {'buildings': 290, 'height': 24, 'roads': 145, 'green': 0.9, 'desc': 'Dense residential'},
    'juhu': {'buildings': 240, 'height': 22, 'roads': 125, 'green': 1.5, 'desc': 'Coastal residential'},
    'andheri': {'buildings': 250, 'height': 22, 'roads': 140, 'green': 1.5, 'desc': 'Mixed residential/commercial'},
    'malad': {'buildings': 220, 'height': 20, 'roads': 130, 'green': 1.8, 'desc': 'Residential suburb'},
    'borivali': {'buildings': 200, 'height': 18, 'roads': 125, 'green': 2.0, 'desc': 'Residential with green spaces'},
    'kandivali': {'buildings': 210, 'height': 19, 'roads': 128, 'green': 1.9, 'desc': 'Residential suburb'},
    'goregaon': {'buildings': 225, 'height': 20, 'roads': 132, 'green': 1.7, 'desc': 'Mixed residential'},
    'santacruz': {'buildings': 235, 'height': 21, 'roads': 135, 'green': 1.6, 'desc': 'Mixed residential'},
    'vile_parle': {'buildings': 230, 'height': 21, 'roads': 133, 'green': 1.6, 'desc': 'Mixed residential'},
    'chembur': {'buildings': 220, 'height': 20, 'roads': 130, 'green': 1.8, 'desc': 'Residential'},
    'ghatkopar': {'buildings': 215, 'height': 19, 'roads': 128, 'green': 1.9, 'desc': 'Residential'},
    'thane': {'buildings': 230, 'height': 20, 'roads': 135, 'green': 2.0, 'desc': 'Residential/commercial'},
    'navi_mumbai': {'buildings': 240, 'height': 21, 'roads': 140, 'green': 2.2, 'desc': 'Planned city'},
    'vashi': {'buildings': 235, 'height': 20, 'roads': 138, 'green': 2.0, 'desc': 'Commercial/residential'},
    'airoli': {'buildings': 200, 'height': 18, 'roads': 125, 'green': 2.1, 'desc': 'Residential'},
    'ghansoli': {'buildings': 195, 'height': 17, 'roads': 122, 'green': 2.2, 'desc': 'Residential'},
    'kopar_khairane': {'buildings': 190, 'height': 17, 'roads': 120, 'green': 2.3, 'desc': 'Residential'},
    'powai': {'buildings': 200, 'height': 20, 'roads': 120, 'green': 2.5, 'desc': 'Residential with green spaces'},
    'mulund': {'buildings': 180, 'height': 16, 'roads': 115, 'green': 2.8, 'desc': 'Suburban residential'},
    'dombivli': {'buildings': 160, 'height': 15, 'roads': 110, 'green': 3.0, 'desc': 'Suburban'},
    'kalyan': {'buildings': 150, 'height': 14, 'roads': 105, 'green': 3.2, 'desc': 'Suburban'},
}

# 1. SAVE LOCATION FEATURES (for backend)
location_features = {}
for name, data in LOCATIONS_26.items():
    location_features[name] = {
        'buildings': data['buildings'],
        'height': data['height'],
        'roads': data['roads'],
        'green': data['green'],
        'desc': data['desc']
    }

with open('models/improved_location_features.pkl', 'wb') as f:
    pickle.dump(location_features, f)
print(f"✅ Saved {len(location_features)} location features")

# 2. TRAIN THE MODEL using the dataset's urban features
print("\n📊 Training model...")

# Features from your dataset
feature_columns = [
    'temperature_c',
    'humidity_pct', 
    'wind_speed_ms',
    'building_count',
    'avg_building_height',
    'road_length_km',
    'green_area_km2',
    'hour',
    'day_of_week'
]

X = df[feature_columns]
y = df['real_heat_stress_uhi']

print(f"   Features: {len(feature_columns)}")
print(f"   Training samples: {len(X):,}")

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train Random Forest
model = RandomForestRegressor(
    n_estimators=300,
    max_depth=15,
    min_samples_split=5,
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

print(f"\n📊 Model Performance:")
print(f"   R² Score: {r2:.4f}")
print(f"   MAE: {mae:.2f}°C")
print(f"   RMSE: {rmse:.2f}°C")

# Save model and scaler
with open('models/improved_location_model.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('models/improved_location_scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("✅ Model saved: models/improved_location_model.pkl")
print("✅ Scaler saved: models/improved_location_scaler.pkl")

# 3. ALSO CREATE THE 26-LOCATION MODEL FILES (for compatibility)
print("\n📊 Creating 26-location model files...")

# Save a simplified version for the 26-location endpoint
with open('models/location_features_26.pkl', 'wb') as f:
    pickle.dump(location_features, f)

# Copy the same model for 26-location (or train a separate one)
with open('models/location_model_26.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('models/location_scaler_26.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("✅ Location features saved: models/location_features_26.pkl")
print("✅ Location model saved: models/location_model_26.pkl")
print("✅ Location scaler saved: models/location_scaler_26.pkl")

print("\n" + "=" * 60)
print("✅ ALL LOCATION MODELS READY!")
print("=" * 60)
print("\n📁 Model Files Created:")
print("   - models/improved_location_model.pkl")
print("   - models/improved_location_scaler.pkl")
print("   - models/improved_location_features.pkl")
print("   - models/location_model_26.pkl")
print("   - models/location_scaler_26.pkl")
print("   - models/location_features_26.pkl")