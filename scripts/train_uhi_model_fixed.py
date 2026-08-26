"""
Train Model with Urban Heat Island Effect - Fixed
"""

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import numpy as np

# Load new dataset
df = pd.read_csv('data/processed/urban_heat_dataset_with_uhi.csv')
print(f"✅ Loaded dataset: {len(df):,} records")

# Check what columns we have
print(f"\n📊 Available columns: {df.columns.tolist()}")

# Features (including urban features)
features = [
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

# Make sure all features exist
missing_features = [f for f in features if f not in df.columns]
if missing_features:
    print(f"⚠️  Missing features: {missing_features}")
    # Use only available features
    features = [f for f in features if f in df.columns]

X = df[features]
y = df['real_heat_stress_uhi']  # Target with UHI

print(f"\n📊 Features: {len(features)}")
print(f"   Target: real_heat_stress_uhi")

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\n📊 Data Split:")
print(f"   Training: {len(X_train):,} samples")
print(f"   Testing: {len(X_test):,} samples")

# Train model
model = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(np.mean((y_test - y_pred) ** 2))

print("\n" + "=" * 60)
print("🏆 URBAN HEAT ISLAND MODEL RESULTS")
print("=" * 60)
print(f"R² Score: {r2:.4f}")
print(f"MAE: {mae:.2f}°C")
print(f"RMSE: {rmse:.2f}°C")

# Feature importance
importance = pd.DataFrame({
    'Feature': features,
    'Importance': model.feature_importances_
}).sort_values('Importance', ascending=False)

print("\n📊 Feature Importance:")
print("=" * 40)
for i, row in importance.iterrows():
    print(f"   {row['Feature']:20s}: {row['Importance']:.2%}")
print("=" * 40)

# Show which urban features matter
urban_features = ['building_count', 'avg_building_height', 'road_length_km', 'green_area_km2']
urban_importance = importance[importance['Feature'].isin(urban_features)]['Importance'].sum()

print(f"\n🏙️ Urban Features Total Importance: {urban_importance:.2%}")

if urban_importance > 0.01:
    print("   ✅ Urban features ARE influencing the model!")
    print("   This shows the Urban Heat Island effect works!")
else:
    print("   ⚠️  Urban features have minimal impact")

# Save model
import pickle
with open('models/uhi_model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("\n💾 Model saved: models/uhi_model.pkl")