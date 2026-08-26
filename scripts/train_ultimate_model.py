"""
Train ULTIMATE Model on 8,425 Records
This will be your main model for the hackathon
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import pickle
import os
import warnings
warnings.filterwarnings('ignore')
import time

os.makedirs("models", exist_ok=True)

def load_ultimate_data():
    """Load the ultimate dataset"""
    filepath = "data/processed/urban_heat_dataset_ultimate.csv"
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return None
    
    df = pd.read_csv(filepath)
    print(f"✅ Loaded ultimate dataset: {len(df):,} records")
    print(f"   Features: {len(df.columns)}")
    return df

def prepare_features(df):
    """Prepare features for ML"""
    print("\n🔧 Preparing features...")
    
    # Select features
    feature_columns = [
        'temperature_c',
        'humidity_pct',
        'wind_speed_ms',
        'building_count',
        'avg_building_height',
        'road_length_km',
        'road_density',
        'green_area_km2',
        'building_density',
        'urban_density_index',
        'hour',
        'day_of_week'
    ]
    
    # Target
    target_column = 'heat_stress_score'
    
    X = df[feature_columns].copy()
    y = df[target_column].copy()
    
    X = X.fillna(X.mean())
    
    print(f"   Features: {len(feature_columns)}")
    print(f"   Target: {target_column}")
    print(f"   X shape: {X.shape}")
    print(f"   y shape: {y.shape}")
    
    return X, y, feature_columns, target_column

def train_ultimate_models(X, y, feature_names):
    """Train ultimate models"""
    print("\n" + "=" * 60)
    print("🤖 Training ULTIMATE Model (8,425 Records)")
    print("=" * 60)
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    print(f"\n📊 Data Split:")
    print(f"   Training: {len(X_train):,} samples")
    print(f"   Testing: {len(X_test):,} samples")
    
    # Scale
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print(f"\n📈 Feature Scaling: Complete")
    
    # Initialize models with optimized parameters
    models = {
        'Random Forest': RandomForestRegressor(
            n_estimators=300,
            max_depth=12,
            min_samples_split=5,
            random_state=42,
            n_jobs=-1
        ),
        'XGBoost': XGBRegressor(
            n_estimators=300,
            learning_rate=0.08,
            max_depth=8,
            random_state=42
        ),
        'Gradient Boosting': GradientBoostingRegressor(
            n_estimators=300,
            learning_rate=0.08,
            max_depth=6,
            random_state=42
        )
    }
    
    results = {}
    best_model = None
    best_r2 = -float('inf')
    
    for name, model in models.items():
        print(f"\n🎯 Training {name}...")
        start_time = time.time()
        
        # Train
        model.fit(X_train_scaled, y_train)
        train_time = time.time() - start_time
        
        # Cross-validation
        cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
        
        # Predict
        y_pred = model.predict(X_test_scaled)
        
        # Evaluate
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        results[name] = {
            'mae': mae,
            'rmse': rmse,
            'r2': r2,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'train_time': train_time,
            'model': model
        }
        
        print(f"   Train Time: {train_time:.2f}s")
        print(f"   CV R²: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        print(f"   Test R²: {r2:.4f}")
        print(f"   Test MAE: {mae:.4f}")
        
        # Track best
        if r2 > best_r2:
            best_r2 = r2
            best_model = model
            best_model_name = name
    
    # Results comparison
    print("\n" + "=" * 60)
    print("🏆 ULTIMATE MODEL RESULTS")
    print("=" * 60)
    
    comparison = pd.DataFrame({
        'Model': list(results.keys()),
        'MAE': [results[m]['mae'] for m in results],
        'RMSE': [results[m]['rmse'] for m in results],
        'R² Score': [results[m]['r2'] for m in results],
        'CV R²': [results[m]['cv_mean'] for m in results],
        'Train Time (s)': [results[m]['train_time'] for m in results]
    })
    
    print(comparison.to_string(index=False))
    
    print(f"\n🌟 Best Model: {best_model_name}")
    print(f"   R² Score: {best_r2:.4f}")
    
    # Save
    with open("models/ultimate_model.pkl", 'wb') as f:
        pickle.dump(best_model, f)
    with open("models/ultimate_scaler.pkl", 'wb') as f:
        pickle.dump(scaler, f)
    
    print(f"\n💾 Model saved: models/ultimate_model.pkl")
    
    # Feature importance
    if hasattr(best_model, 'feature_importances_'):
        importance = pd.DataFrame({
            'Feature': feature_names,
            'Importance': best_model.feature_importances_
        }).sort_values('Importance', ascending=False)
        
        print("\n📊 Feature Importance (Top 10):")
        print(importance.head(10).to_string(index=False))
        importance.to_csv("models/ultimate_feature_importance.csv", index=False)
    
    return results, best_model, scaler

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 ULTIMATE Urban Heat Stress Prediction")
    print("   8,425 Records × 24 Features")
    print("=" * 60)
    
    df = load_ultimate_data()
    if df is None:
        exit()
    
    X, y, feature_names, target = prepare_features(df)
    results, best_model, scaler = train_ultimate_models(X, y, feature_names)
    
    print("\n" + "=" * 60)
    print("✅ ULTIMATE Model Training Complete!")
    print("=" * 60)
    print(f"\n📁 Model Files:")
    print("   - models/ultimate_model.pkl")
    print("   - models/ultimate_scaler.pkl")
    print("   - models/ultimate_feature_importance.csv")
    print(f"\n📊 Dataset: 8,425 records")
    print(f"🎯 Best R² Score: {max([results[m]['r2'] for m in results]):.4f}")
    print("\n🚀 Ready for Hackathon!")