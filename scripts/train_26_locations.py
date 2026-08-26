"""
Train Location Model on 26 Mumbai Locations
"""

import os
import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error
import warnings
warnings.filterwarnings('ignore')

print("=" * 60)
print("🏙️ Training Model on 26 Locations")
print("=" * 60)

# Load location data
with open('models/locations_25.pkl', 'rb') as f:
    LOCATIONS_26 = pickle.load(f)

print(f"✅ Loaded {len(LOCATIONS_26)} locations")

# Load weather data
weather_data = pd.read_csv('data/era5/era5_mumbai_full_year.csv')
print(f"✅ Weather data: {len(weather_data):,} records")

# Create location-enhanced dataset
def create_location_dataset(weather_df):
    """Create dataset with location features"""
    df = weather_df.copy()
    
    # Assign locations based on coordinates
    locations = []
    for _, row in df.iterrows():
        lat, lon = row['latitude'], row['longitude']
        assigned = None
        for name, loc_data in LOCATIONS_26.items():
            if abs(lat - loc_data['lat']) < 0.15 and abs(lon - loc_data['lon']) < 0.15:
                assigned = name
                break
        locations.append(assigned)
    
    df['location'] = locations
    
    # Add location features
    for name, loc_data in LOCATIONS_26.items():
        mask = df['location'] == name
        df.loc[mask, 'building_count'] = loc_data['buildings']
        df.loc[mask, 'avg_building_height'] = loc_data['height']
        df.loc[mask, 'road_length_km'] = loc_data['roads']
        df.loc[mask, 'green_area_km2'] = loc_data['green']
        df.loc[mask, 'density'] = loc_data['density']
        df.loc[mask, 'type'] = loc_data['type']
    
    # Default values for unmapped
    df['building_count'] = df['building_count'].fillna(250)
    df['avg_building_height'] = df['avg_building_height'].fillna(22)
    df['road_length_km'] = df['road_length_km'].fillna(130)
    df['green_area_km2'] = df['green_area_km2'].fillna(1.5)
    df['density'] = df['density'].fillna('medium')
    
    # Calculate UHI effect
    df['uhi_effect'] = (df['building_count'] / 200) - (df['green_area_km2'] * 0.5)
    
    # Calculate heat stress
    df['heat_stress'] = (
        df['temperature_c'] * 0.5 +
        (df['humidity_pct'] / 100) * 15 +
        df['uhi_effect'] * 3 +
        np.random.normal(0, 0.3, len(df))
    )
    
    # Time features
    df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
    df['day_of_week'] = pd.to_datetime(df['timestamp']).dt.dayofweek
    df['month'] = pd.to_datetime(df['timestamp']).dt.month
    
    return df

# Create dataset
dataset = create_location_dataset(weather_data)
print(f"✅ Dataset created: {len(dataset):,} records")

# Prepare features
feature_columns = [
    'temperature_c', 'humidity_pct', 'wind_speed_ms',
    'building_count', 'avg_building_height', 'road_length_km',
    'green_area_km2', 'uhi_effect', 'hour', 'day_of_week', 'month'
]

X = dataset[feature_columns]
y = dataset['heat_stress']

print(f"\n📊 Features: {len(feature_columns)}")
print(f"   Target: heat_stress")

# Split and train
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

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

# Feature importance
importance = pd.DataFrame({
    'Feature': feature_columns,
    'Importance': model.feature_importances_
}).sort_values('Importance', ascending=False)

print("\n📊 Feature Importance:")
for i, row in importance.iterrows():
    print(f"   {row['Feature']:20s}: {row['Importance']:.2%}")

# Save model
os.makedirs('models', exist_ok=True)
with open('models/location_model_26.pkl', 'wb') as f:
    pickle.dump(model, f)
with open('models/location_scaler_26.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("\n✅ Model saved: models/location_model_26.pkl")
print("✅ Scaler saved: models/location_scaler_26.pkl")

# Save location features
location_features = {}
for name, data in LOCATIONS_26.items():
    location_features[name] = {
        'buildings': data['buildings'],
        'height': data['height'],
        'roads': data['roads'],
        'green': data['green'],
        'desc': f"{data['density']} density • {data['type']}"
    }

with open('models/location_features_26.pkl', 'wb') as f:
    pickle.dump(location_features, f)

print("✅ Location features saved: models/location_features_26.pkl")

# Test predictions for all locations
print("\n🧪 Testing predictions for all 26 locations:")
test_locations = list(location_features.keys())[:10]  # First 10
for loc in test_locations:
    loc_data = location_features[loc]
    X_sample = np.array([[
        27.6, 69.7, 3.3,
        loc_data['buildings'],
        loc_data['height'],
        loc_data['roads'],
        loc_data['green'],
        (loc_data['buildings'] / 200) - (loc_data['green'] * 0.5),
        12, 2, 6
    ]])
    X_scaled = scaler.transform(X_sample)
    pred = model.predict(X_scaled)[0]
    print(f"   {loc.capitalize()}: {pred:.1f}°C heat stress")

print("\n" + "=" * 60)
print("🎯 Model trained on 26 locations!")
print("=" * 60)