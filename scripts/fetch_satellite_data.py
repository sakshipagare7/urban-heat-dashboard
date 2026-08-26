"""
Fetch Real Sentinel-2 and Landsat Data using Earth Engine
UPDATED: Fixed deprecation warnings and data fetching
"""

import os
import json
import pandas as pd
import numpy as np
import ee
from datetime import datetime, timedelta

# Initialize Earth Engine with your project
try:
    ee.Initialize(project='urban-heat-project-500617')
    print("✅ Earth Engine initialized")
except Exception as e:
    print(f"❌ Earth Engine error: {e}")
    exit(1)

# Mumbai bounding box
MUMBAI_BBOX = {
    'north': 19.5,
    'south': 18.5,
    'east': 73.5,
    'west': 72.5
}

def get_sentinel_ndvi():
    """Fetch Sentinel-2 NDVI for Mumbai - UPDATED"""
    print("\n🛰️ Fetching Sentinel-2 NDVI...")
    
    # Define region
    region = ee.Geometry.Rectangle([
        MUMBAI_BBOX['west'],
        MUMBAI_BBOX['south'],
        MUMBAI_BBOX['east'],
        MUMBAI_BBOX['north']
    ])
    
    # Use HARMONIZED collection (not deprecated)
    sentinel2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') \
        .filterBounds(region) \
        .filterDate('2025-01-01', '2025-12-31') \
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    
    # Get median composite
    composite = sentinel2.median().clip(region)
    
    # Calculate NDVI: (NIR - RED) / (NIR + RED)
    ndvi = composite.normalizedDifference(['B8', 'B4']).rename('NDVI')
    
    # Locations with coordinates
    locations = [
        {'name': 'bandra', 'lat': 19.06, 'lon': 72.83},
        {'name': 'colaba', 'lat': 18.91, 'lon': 72.82},
        {'name': 'bkc', 'lat': 19.05, 'lon': 72.92},
        {'name': 'lower_parel', 'lat': 18.99, 'lon': 72.82},
        {'name': 'worli', 'lat': 19.01, 'lon': 72.80},
        {'name': 'dadar', 'lat': 19.02, 'lon': 72.84},
        {'name': 'juhu', 'lat': 19.10, 'lon': 72.82},
        {'name': 'andheri', 'lat': 19.12, 'lon': 72.85},
        {'name': 'malad', 'lat': 19.18, 'lon': 72.84},
        {'name': 'borivali', 'lat': 19.23, 'lon': 72.86},
        {'name': 'kandivali', 'lat': 19.20, 'lon': 72.86},
        {'name': 'goregaon', 'lat': 19.16, 'lon': 72.85},
        {'name': 'santacruz', 'lat': 19.08, 'lon': 72.84},
        {'name': 'vile_parle', 'lat': 19.09, 'lon': 72.83},
        {'name': 'chembur', 'lat': 19.05, 'lon': 72.90},
        {'name': 'ghatkopar', 'lat': 19.08, 'lon': 72.91},
        {'name': 'thane', 'lat': 19.20, 'lon': 72.97},
        {'name': 'navi_mumbai', 'lat': 19.05, 'lon': 73.02},
        {'name': 'vashi', 'lat': 19.07, 'lon': 73.00},
        {'name': 'airoli', 'lat': 19.15, 'lon': 73.00},
        {'name': 'ghansoli', 'lat': 19.12, 'lon': 73.00},
        {'name': 'kopar_khairane', 'lat': 19.13, 'lon': 72.99},
        {'name': 'powai', 'lat': 19.12, 'lon': 72.91},
        {'name': 'mulund', 'lat': 19.17, 'lon': 72.96},
        {'name': 'dombivli', 'lat': 19.22, 'lon': 73.08},
        {'name': 'kalyan', 'lat': 19.24, 'lon': 73.13},
    ]
    
    ndvi_values = []
    
    for loc in locations:
        point = ee.Geometry.Point([loc['lon'], loc['lat']])
        try:
            # Get NDVI value at point
            value = ndvi.reduceRegion(
                reducer=ee.Reducer.first(),
                geometry=point,
                scale=10,
                maxPixels=1e9
            ).get('NDVI')
            
            # Get the value
            val = value.getInfo()
            
            if val is not None:
                ndvi_values.append({
                    'location': loc['name'],
                    'ndvi': round(float(val), 3)
                })
                print(f"   ✅ {loc['name']}: NDVI = {round(float(val), 3)}")
            else:
                print(f"   ⚠️ {loc['name']}: No NDVI data")
                ndvi_values.append({
                    'location': loc['name'],
                    'ndvi': None
                })
        except Exception as e:
            print(f"   ❌ {loc['name']}: Error - {str(e)[:50]}")
            ndvi_values.append({
                'location': loc['name'],
                'ndvi': None
            })
    
    return pd.DataFrame(ndvi_values)

def get_landsat_lst():
    """Fetch Landsat LST for Mumbai - CORRECTED"""
    print("\n🛰️ Fetching Landsat LST...")
    
    region = ee.Geometry.Rectangle([
        MUMBAI_BBOX['west'],
        MUMBAI_BBOX['south'],
        MUMBAI_BBOX['east'],
        MUMBAI_BBOX['north']
    ])
    
    # Use Landsat 8 Collection 2 Level 2
    landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
        .filterBounds(region) \
        .filterDate('2025-01-01', '2025-12-31') \
        .filter(ee.Filter.lt('CLOUD_COVER', 30))
    
    # Get median composite
    composite = landsat.median().clip(region)
    
    # CORRECTED: LST from ST_B10 band
    # ST_B10 values are in Kelvin * 10
    # Convert to Kelvin: ST_B10 / 10
    # Convert to Celsius: (ST_B10 / 10) - 273.15
    lst = composite.select('ST_B10').divide(10).subtract(273.15).rename('LST')
    
    locations = [
        {'name': 'bandra', 'lat': 19.06, 'lon': 72.83},
        {'name': 'colaba', 'lat': 18.91, 'lon': 72.82},
        {'name': 'bkc', 'lat': 19.05, 'lon': 72.92},
        {'name': 'lower_parel', 'lat': 18.99, 'lon': 72.82},
        {'name': 'worli', 'lat': 19.01, 'lon': 72.80},
        {'name': 'dadar', 'lat': 19.02, 'lon': 72.84},
        {'name': 'juhu', 'lat': 19.10, 'lon': 72.82},
        {'name': 'andheri', 'lat': 19.12, 'lon': 72.85},
        {'name': 'malad', 'lat': 19.18, 'lon': 72.84},
        {'name': 'borivali', 'lat': 19.23, 'lon': 72.86},
        {'name': 'kandivali', 'lat': 19.20, 'lon': 72.86},
        {'name': 'goregaon', 'lat': 19.16, 'lon': 72.85},
        {'name': 'santacruz', 'lat': 19.08, 'lon': 72.84},
        {'name': 'vile_parle', 'lat': 19.09, 'lon': 72.83},
        {'name': 'chembur', 'lat': 19.05, 'lon': 72.90},
        {'name': 'ghatkopar', 'lat': 19.08, 'lon': 72.91},
        {'name': 'thane', 'lat': 19.20, 'lon': 72.97},
        {'name': 'navi_mumbai', 'lat': 19.05, 'lon': 73.02},
        {'name': 'vashi', 'lat': 19.07, 'lon': 73.00},
        {'name': 'airoli', 'lat': 19.15, 'lon': 73.00},
        {'name': 'ghansoli', 'lat': 19.12, 'lon': 73.00},
        {'name': 'kopar_khairane', 'lat': 19.13, 'lon': 72.99},
        {'name': 'powai', 'lat': 19.12, 'lon': 72.91},
        {'name': 'mulund', 'lat': 19.17, 'lon': 72.96},
        {'name': 'dombivli', 'lat': 19.22, 'lon': 73.08},
        {'name': 'kalyan', 'lat': 19.24, 'lon': 73.13},
    ]
    
    lst_values = []
    
    for loc in locations:
        point = ee.Geometry.Point([loc['lon'], loc['lat']])
        try:
            value = lst.reduceRegion(
                reducer=ee.Reducer.first(),
                geometry=point,
                scale=30,
                maxPixels=1e9
            ).get('LST')
            
            val = value.getInfo()
            
            if val is not None:
                lst_celsius = round(float(val), 1)
                lst_values.append({
                    'location': loc['name'],
                    'lst': lst_celsius
                })
                print(f"   ✅ {loc['name']}: LST = {lst_celsius}°C")
            else:
                print(f"   ⚠️ {loc['name']}: No LST data")
                lst_values.append({
                    'location': loc['name'],
                    'lst': None
                })
        except Exception as e:
            print(f"   ❌ {loc['name']}: Error - {str(e)[:50]}")
            lst_values.append({
                'location': loc['name'],
                'lst': None
            })
    
    return pd.DataFrame(lst_values)
def merge_satellite_data():
    """Merge NDVI and LST data"""
    print("\n📊 Merging satellite data...")
    
    ndvi_df = get_sentinel_ndvi()
    lst_df = get_landsat_lst()
    
    # Merge on location
    merged = ndvi_df.merge(lst_df, on='location', how='outer')
    
    # Convert NDVI to proper range (some may be outside -1 to 1)
    merged['ndvi'] = merged['ndvi'].clip(-1, 1)
    
    # Save to CSV
    os.makedirs('data/satellite', exist_ok=True)
    merged.to_csv('data/satellite/satellite_data_real.csv', index=False)
    
    print(f"\n✅ Saved satellite data to: data/satellite/satellite_data_real.csv")
    print("\n📊 Sample:")
    print(merged.head(10))
    
    # Count successful retrievals
    ndvi_count = merged['ndvi'].notna().sum()
    lst_count = merged['lst'].notna().sum()
    print(f"\n📊 Summary:")
    print(f"   NDVI data: {ndvi_count}/{len(merged)} locations")
    print(f"   LST data: {lst_count}/{len(merged)} locations")
    print(f"\n📊 NDVI Range: {merged['ndvi'].min():.3f} to {merged['ndvi'].max():.3f}")
    print(f"📊 LST Range: {merged['lst'].min():.1f}°C to {merged['lst'].max():.1f}°C")
    
    return merged