"""
Create Urban Heat Island Features - Fixed Version
"""

import pandas as pd
import numpy as np

# Load your data
df = pd.read_csv('data/processed/urban_heat_dataset_realistic.csv')
print(f"✅ Loaded {len(df):,} records")

# Get unique locations
locations = df[['latitude', 'longitude']].drop_duplicates().copy()
print(f"📍 Found {len(locations)} unique locations")

# Define different areas of Mumbai
# Central Mumbai (hotter, denser) - like Colaba, Bandra
central = (locations['latitude'] >= 18.9) & (locations['latitude'] <= 19.1) & \
          (locations['longitude'] >= 72.8) & (locations['longitude'] <= 72.9)

# Suburban areas (medium) - like Andheri, Powai
suburban = (locations['latitude'] >= 19.1) & (locations['latitude'] <= 19.3) & \
           (locations['longitude'] >= 72.9) & (locations['longitude'] <= 73.1)

print(f"   Central Mumbai locations: {central.sum()}")
print(f"   Suburban Mumbai locations: {suburban.sum()}")

# Create new columns for urban features
locations['building_count_new'] = 100  # Default for outer areas
locations.loc[central, 'building_count_new'] = 500 + np.random.randint(0, 200, central.sum())
locations.loc[suburban, 'building_count_new'] = 300 + np.random.randint(0, 100, suburban.sum())

locations['avg_building_height_new'] = 10
locations.loc[central, 'avg_building_height_new'] = 35 + np.random.randint(0, 20, central.sum())
locations.loc[suburban, 'avg_building_height_new'] = 20 + np.random.randint(0, 15, suburban.sum())

locations['road_length_km_new'] = 50
locations.loc[central, 'road_length_km_new'] = 200 + np.random.randint(0, 100, central.sum())
locations.loc[suburban, 'road_length_km_new'] = 150 + np.random.randint(0, 50, suburban.sum())

locations['green_area_km2_new'] = 3.0
locations.loc[central, 'green_area_km2_new'] = 0.5 + np.random.random(central.sum())
locations.loc[suburban, 'green_area_km2_new'] = 1.5 + np.random.random(suburban.sum())

# Add UHI effect (urban areas are warmer)
locations['uhi_effect'] = 0.0
locations.loc[central, 'uhi_effect'] = 3.0 + np.random.random(central.sum()) * 2.0
locations.loc[suburban, 'uhi_effect'] = 1.5 + np.random.random(suburban.sum())

# Drop old urban columns if they exist (to avoid duplicates)
old_urban_cols = ['building_count', 'avg_building_height', 'road_length_km', 'green_area_km2']
for col in old_urban_cols:
    if col in df.columns:
        df = df.drop(columns=[col])

# Merge back to main dataset
df = df.merge(locations, on=['latitude', 'longitude'])

# Rename new columns to original names
df = df.rename(columns={
    'building_count_new': 'building_count',
    'avg_building_height_new': 'avg_building_height',
    'road_length_km_new': 'road_length_km',
    'green_area_km2_new': 'green_area_km2'
})

# Create new target with UHI effect
df['real_heat_stress_uhi'] = df['real_heat_stress'] + df['uhi_effect']

# Save
df.to_csv('data/processed/urban_heat_dataset_with_uhi.csv', index=False)

print("\n" + "=" * 60)
print("✅ New dataset created with UHI effect!")
print("=" * 60)
print(f"   Records: {len(df):,}")
print(f"   Building range: {df['building_count'].min():.0f} to {df['building_count'].max():.0f}")
print(f"   Building height: {df['avg_building_height'].min():.0f}m to {df['avg_building_height'].max():.0f}m")
print(f"   Road length: {df['road_length_km'].min():.0f}km to {df['road_length_km'].max():.0f}km")
print(f"   Green area: {df['green_area_km2'].min():.1f}km² to {df['green_area_km2'].max():.1f}km²")
print(f"   UHI effect: {df['uhi_effect'].min():.1f}°C to {df['uhi_effect'].max():.1f}°C")
print("=" * 60)
print("\n📁 File: data/processed/urban_heat_dataset_with_uhi.csv")