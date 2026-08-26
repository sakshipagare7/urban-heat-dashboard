from app import (
    app,
    load_model,
    load_data,
    load_osm_data,
    load_location_model
)

if __name__ == '__main__':
    print("=" * 60)
    print("🚀 Starting Urban Heat Backend...")
    print("=" * 60)

    print("\n📦 Loading main ML model...")
    load_model()

    print("\n📊 Loading dataset...")
    load_data()

    print("\n🗺️ Loading OSM data...")
    load_osm_data()

    print("\n📍 Loading location model...")
    load_location_model()

    print("\n" + "=" * 60)
    print("✅ Backend initialization complete")
    print(f"📊 Records: {len(__import__('app').data) if __import__('app').data is not None else 0}")
    print(f"🧠 Main model: {'Loaded' if __import__('app').model is not None else 'NOT loaded'}")
    print(f"🧠 Location model: {'Loaded' if __import__('app').location_model is not None else 'NOT loaded'}")
    print(f"📍 Locations: {len(__import__('app').location_features) if __import__('app').location_features else 0}")
    print("=" * 60)

    app.run(debug=True, port=5000)