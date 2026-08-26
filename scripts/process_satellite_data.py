"""
Process Satellite UHI Data for Heat Map
Reads Mumbai_UHI_With_Coords.csv and converts to heat map format
"""

import os
import pandas as pd
import json
import numpy as np

# Paths - using absolute path to be safe
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_FILE = os.path.join(BASE_DIR, 'data', 'satellite', 'mumbai_uhi_satellite.csv')
OUTPUT_FILE = os.path.join(BASE_DIR, 'data', 'processed', 'heatmap_satellite_data.json')

print("=" * 60)
print("🛰️  Processing Satellite UHI Data")
print("=" * 60)
print(f"📁 Looking for: {INPUT_FILE}")

# Check if file exists
if not os.path.exists(INPUT_FILE):
    print(f"❌ File not found: {INPUT_FILE}")
    print("   Please place the file at: data/satellite/mumbai_uhi_satellite.csv")
    exit(1)

# Load the data
df = pd.read_csv(INPUT_FILE)
print(f"✅ Loaded {len(df)} records")
print(f"📊 Columns: {df.columns.tolist()}")

# Parse the geo column to extract coordinates
# The column name is '.geo' (with a dot)
def parse_geo(geo_str):
    try:
        # Check if it's a string
        if isinstance(geo_str, str):
            geo = json.loads(geo_str)
            coordinates = geo['coordinates']
            return coordinates[0], coordinates[1]  # lon, lat
        else:
            return None, None
    except:
        return None, None

print("📍 Parsing coordinates from .geo column...")

# Use the correct column name '.geo'
geo_column = '.geo' if '.geo' in df.columns else 'geo'
print(f"   Using column: '{geo_column}'")

df['lon'], df['lat'] = zip(*df[geo_column].apply(parse_geo))

# Remove rows with invalid coordinates
df = df.dropna(subset=['lat', 'lon'])
print(f"✅ {len(df)} valid coordinates")

# Convert Daytime values to heat intensity (0-100 scale)
# Daytime column might be named 'Daytime' or 'Daytime,'
daytime_col = 'Daytime' if 'Daytime' in df.columns else 'Daytime,'
print(f"   Using column: '{daytime_col}'")

min_val = df[daytime_col].min()
max_val = df[daytime_col].max()
df['intensity'] = ((df[daytime_col] - min_val) / (max_val - min_val)) * 100

# Create heat map data
heat_points = []
for _, row in df.iterrows():
    if pd.notna(row['lat']) and pd.notna(row['lon']):
        heat_points.append({
            'lat': float(row['lat']),
            'lng': float(row['lon']),
            'intensity': float(row['intensity']),
            'satellite_value': float(row[daytime_col]),
            'label': f"UHI {float(row[daytime_col]):.2f}"
        })

print(f"✅ Created {len(heat_points)} heat points")

# Save as JSON
with open(OUTPUT_FILE, 'w') as f:
    json.dump(heat_points, f)

print(f"✅ Saved to: {OUTPUT_FILE}")

# Statistics
print("\n📊 Data Statistics:")
print(f"   Min satellite value: {min_val:.3f}")
print(f"   Max satellite value: {max_val:.3f}")
print(f"   Intensity range: 0 - 100%")
print(f"   Total points: {len(heat_points)}")

# Show sample
if len(heat_points) > 0:
    print("\n📊 Sample points:")
    for p in heat_points[:3]:
        print(f"   Lat: {p['lat']:.4f}, Lon: {p['lng']:.4f}, Intensity: {p['intensity']:.1f}%, Value: {p['satellite_value']:.3f}")

print("\n✅ Processing complete!")