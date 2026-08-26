"""
Download Full Year of ERA5 Data for Mumbai
12 months × 4 time steps = 1,440 time steps
5×5 grid = 25 locations
Total: 36,000+ records
"""

import os
import cdsapi
import numpy as np
import xarray as xr
import pandas as pd
from datetime import datetime, timedelta

DATA_DIR = "data/era5/"
os.makedirs(DATA_DIR, exist_ok=True)

# Mumbai coordinates
CITY = {
    'name': 'Mumbai',
    'lat_min': 18.5,
    'lat_max': 19.5,
    'lon_min': 72.5,
    'lon_max': 73.5
}

def download_full_year():
    """Download full year of ERA5 data"""
    print("\n🌍 Downloading Full Year ERA5 Data for Mumbai...")
    print("   (This will take 15-30 minutes)")
    
    try:
        # Initialize client
        c = cdsapi.Client()
        print("✅ CDS API client initialized")
        
        # Request full year (January - December 2026)
        request = {
            'product_type': 'reanalysis',
            'variable': [
                '2m_temperature',
                '2m_dewpoint_temperature',
                '10m_u_component_of_wind',
                '10m_v_component_of_wind'
            ],
            'year': ['2026'],
            'month': ['01', '02', '03', '04', '05', '06', 
                     '07', '08', '09', '10', '11', '12'],
            'day': [f"{i:02d}" for i in range(1, 32)],
            'time': ['00:00', '06:00', '12:00', '18:00'],
            'area': [
                CITY['lat_max'],
                CITY['lon_min'],
                CITY['lat_min'],
                CITY['lon_max']
            ],
            'format': 'netcdf'
        }
        
        output_file = f"{DATA_DIR}era5_mumbai_full_year.nc"
        
        print(f"\n⏳ Downloading full year data...")
        print(f"   12 months × 31 days × 4 time steps = 1,488 time steps")
        print(f"   Output size: ~500MB")
        
        c.retrieve('reanalysis-era5-single-levels', request, output_file)
        print(f"✅ Download complete: {output_file}")
        return output_file
        
    except Exception as e:
        print(f"❌ Error downloading: {e}")
        return None

def process_full_year(file_path):
    """Process full year dataset"""
    print("\n📊 Processing full year ERA5 data...")
    
    try:
        ds = xr.open_dataset(file_path)
        
        # Handle time dimension
        if 'time' in ds.coords:
            times = ds.time.values
        elif 'valid_time' in ds.coords:
            times = ds.valid_time.values
        else:
            print("❌ No time dimension found!")
            return None
        
        lats = ds.latitude.values
        lons = ds.longitude.values
        
        print(f"   Time steps: {len(times)}")
        print(f"   Latitudes: {len(lats)}")
        print(f"   Longitudes: {len(lons)}")
        print(f"   Total potential records: {len(times) * len(lats) * len(lons):,}")
        
        # Extract variables
        temp_k = ds['t2m'].values - 273.15
        dewpoint_k = ds['d2m'].values - 273.15
        u_wind = ds['u10'].values
        v_wind = ds['v10'].values
        
        # Calculate wind speed
        wind_speed = np.sqrt(u_wind**2 + v_wind**2)
        
        # Calculate humidity
        humidity = 100 * (np.exp(17.625 * dewpoint_k / (243.04 + dewpoint_k)) / 
                         np.exp(17.625 * temp_k / (243.04 + temp_k)))
        
        # Create DataFrame (sample to keep size manageable)
        print("\n📊 Creating DataFrame...")
        data = []
        
        # Use every 2nd time step to keep file size reasonable
        for t in range(0, len(times), 2):
            for lat_idx in range(len(lats)):
                for lon_idx in range(len(lons)):
                    data.append({
                        'timestamp': str(times[t]),
                        'latitude': float(lats[lat_idx]),
                        'longitude': float(lons[lon_idx]),
                        'temperature_c': float(temp_k[t, lat_idx, lon_idx]),
                        'humidity_pct': float(humidity[t, lat_idx, lon_idx]),
                        'wind_speed_ms': float(wind_speed[t, lat_idx, lon_idx])
                    })
        
        df = pd.DataFrame(data)
        
        # Save CSV
        csv_file = DATA_DIR + "era5_mumbai_full_year.csv"
        df.to_csv(csv_file, index=False)
        print(f"✅ Processed data saved: {csv_file}")
        print(f"   Shape: {df.shape}")
        print(f"   Records: {len(df):,}")
        
        return df
        
    except Exception as e:
        print(f"❌ Processing error: {e}")
        return None

if __name__ == "__main__":
    print("=" * 60)
    print("🌤️  Download Full Year ERA5 Data")
    print("=" * 60)
    
    file_path = download_full_year()
    if file_path:
        df = process_full_year(file_path)
        if df is not None:
            print(f"\n✅ Dataset expanded!")
            print(f"   New size: {len(df):,} records")