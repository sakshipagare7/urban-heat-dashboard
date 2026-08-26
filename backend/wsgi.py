from backend.app import (
    app,
    load_model,
    load_data,
    load_osm_data,
    load_location_model
)

print("Starting Urban Heat Dashboard backend...")

load_model()
load_data()
load_osm_data()
load_location_model()

print("Backend initialization complete.")