"""
Create the ULTIMATE Urban Heat Dataset
Combines Full Year ERA5 + OSM Features
8,425 records × 21 features
"""

import os
import pandas as pd
import geopandas as gpd
import numpy as np

def load_osm_metrics():
    """Load OSM metrics"""
    print("\n📊 Loading OSM metrics...")
    metrics = {}
    
    # Load buildings
    building_file = "data/osm/buildings.geojson"
    if os.path.exists(building_file):
        buildings = gpd.read_file(building_file)
        metrics['building_count'] = len(buildings)
        metrics['avg_building_height'] = buildings['height'].mean()
        metrics['total_building_area'] = buildings['area_m2'].sum() / 1000000
        metrics['building_density'] = len(buildings) / (1.0 * 1.0)
        print(f"   ✅ Buildings: {len(buildings)}")
    else:
        metrics['building_count'] = 0
        metrics['avg_building_height'] = 0
        metrics['total_building_area'] = 0
        metrics['building_density'] = 0
    
    # Load roads
    roads_file = "data/osm/roads.geojson"
    if os.path.exists(roads_file):
        roads = gpd.read_file(roads_file)
        metrics['road_length_km'] = roads['length_m'].sum() / 1000
        metrics['road_count'] = len(roads)
        metrics['road_density'] = metrics['road_length_km'] / (1.0 * 1.0)
        print(f"   ✅ Roads: {len(roads)}")
    else:
        metrics['road_length_km'] = 0
        metrics['road_count'] = 0
        metrics['road_density'] = 0
    
    # Load green areas
    green_file = "data/osm/green_areas.geojson"
    if os.path.exists(green_file):
        green = gpd.read_file(green_file)
        metrics['green_area_km2'] = green['area_m2'].sum() / 1000000
        metrics['green_count'] = len(green)
        metrics['green_density'] = metrics['green_area_km2'] / (1.0 * 1.0)
        print(f"   ✅ Green Areas: {len(green)}")
    else:
        metrics['green_area_km2'] = 0
        metrics['green_count'] = 0
        metrics['green_density'] = 0
    
    # Urban density index
    metrics['urban_density_index'] = (
        metrics['building_count'] / 100 + 
        metrics['road_length_km'] / 1000 + 
        metrics['green_area_km2'] / 10
    )
    
    return metrics

def calculate_heat_index(temp_c, humidity):
    """Calculate Heat Index"""
    temp_f = temp_c * 9/5 + 32
    hi = 0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (humidity * 0.094))
    hi_c = (hi - 32) * 5/9
    return np.maximum(hi_c, temp_c)

def create_ultimate_dataset():
    """Create ultimate dataset with 8,425 records"""
    print("\n" + "=" * 60)
    print("🏙️  Creating ULTIMATE Urban Heat Dataset")
    print("=" * 60)
    
    # Load full year ERA5 data
    era5_file = "data/era5/era5_mumbai_full_year.csv"
    if not os.path.exists(era5_file):
        print(f"❌ ERA5 file not found: {era5_file}")
        return None
    
    era5 = pd.read_csv(era5_file)
    print(f"✅ Loaded full year ERA5 data: {len(era5):,} records")
    
    # Load OSM metrics
    osm_metrics = load_osm_metrics()
    
    # Add OSM metrics to all rows
    for key, value in osm_metrics.items():
        era5[key] = value
    
    # Calculate derived features
    era5['heat_index'] = calculate_heat_index(
        era5['temperature_c'], 
        era5['humidity_pct']
    )
    
    # Calculate heat stress score (0-100 scale)
    era5['heat_stress_score'] = (
        (era5['temperature_c'] / 40 * 100 * 0.4) +
        ((100 - era5['humidity_pct']) / 100 * 100 * 0.3) +
        ((era5['urban_density_index'] / 100) * 100 * 0.3)
    )
    
    # Add timestamp features
    era5['timestamp'] = pd.to_datetime(era5['timestamp'])
    era5['hour'] = era5['timestamp'].dt.hour
    era5['day'] = era5['timestamp'].dt.day
    era5['month'] = era5['timestamp'].dt.month
    era5['day_of_week'] = era5['timestamp'].dt.dayofweek
    
    # Add season
    def get_season(month):
        if month in [12, 1, 2]:
            return 'Winter'
        elif month in [3, 4, 5]:
            return 'Summer'
        elif month in [6, 7, 8, 9]:
            return 'Monsoon'
        else:
            return 'Post-Monsoon'
    
    era5['season'] = era5['month'].apply(get_season)
    
    # Save ULTIMATE dataset
    output_file = "data/processed/urban_heat_dataset_ultimate.csv"
    os.makedirs("data/processed", exist_ok=True)
    era5.to_csv(output_file, index=False)
    
    print(f"\n✅ ULTIMATE dataset saved: {output_file}")
    print(f"   Shape: {era5.shape}")
    print(f"   Records: {len(era5):,}")
    print(f"   Features: {len(era5.columns)}")
    
    return era5

def create_dataset_summary(df):
    """Create comprehensive summary"""
    print("\n" + "=" * 60)
    print("📊 ULTIMATE DATASET SUMMARY")
    print("=" * 60)
    
    print(f"\n📁 Dataset Overview:")
    print(f"   Total Records: {len(df):,}")
    print(f"   Total Features: {len(df.columns)}")
    print(f"   Date Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    
    print(f"\n📍 Geographic Coverage:")
    print(f"   Latitude: {df['latitude'].min():.2f}° to {df['latitude'].max():.2f}°")
    print(f"   Longitude: {df['longitude'].min():.2f}° to {df['longitude'].max():.2f}°")
    
    print(f"\n🌡️  Temperature Stats:")
    print(f"   Min: {df['temperature_c'].min():.1f}°C")
    print(f"   Max: {df['temperature_c'].max():.1f}°C")
    print(f"   Mean: {df['temperature_c'].mean():.1f}°C")
    print(f"   Std: {df['temperature_c'].std():.1f}°C")
    
    print(f"\n💧 Humidity Stats:")
    print(f"   Min: {df['humidity_pct'].min():.1f}%")
    print(f"   Max: {df['humidity_pct'].max():.1f}%")
    print(f"   Mean: {df['humidity_pct'].mean():.1f}%")
    
    print(f"\n🏙️  Urban Features:")
    print(f"   Buildings: {df['building_count'].iloc[0]:.0f}")
    print(f"   Avg Height: {df['avg_building_height'].iloc[0]:.1f}m")
    print(f"   Road Length: {df['road_length_km'].iloc[0]:.2f} km")
    print(f"   Green Area: {df['green_area_km2'].iloc[0]:.2f} km²")
    
    print(f"\n🔥 Heat Stress Score (Target):")
    print(f"   Min: {df['heat_stress_score'].min():.1f}")
    print(f"   Max: {df['heat_stress_score'].max():.1f}")
    print(f"   Mean: {df['heat_stress_score'].mean():.1f}")
    print(f"   Std: {df['heat_stress_score'].std():.1f}")
    
    print(f"\n📅 Season Distribution:")
    print(df['season'].value_counts().to_string())
    
    print("=" * 60)

if __name__ == "__main__":
    print("=" * 60)
    print("🏙️  ULTIMATE Urban Heat Feature Engineering")
    print("=" * 60)
    
    # Create ultimate dataset
    dataset = create_ultimate_dataset()
    
    if dataset is not None:
        # Create summary
        create_dataset_summary(dataset)
        
        print("\n📊 Sample Data:")
        print(dataset[['timestamp', 'latitude', 'longitude', 'temperature_c', 
                      'humidity_pct', 'season', 'heat_stress_score']].head(10))
        
        print("\n" + "=" * 60)
        print("✅ ULTIMATE dataset ready for machine learning!")
        print("=" * 60)
        print("\n📁 File: data/processed/urban_heat_dataset_ultimate.csv")
        print(f"📊 Records: {len(dataset):,}")
        print(f"📈 Features: {len(dataset.columns)}")
        print("\n🚀 Now train the ultimate model!")