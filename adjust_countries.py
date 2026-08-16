#!/usr/bin/env python3
"""
Adjust country coordinates in the merged countries GeoJSON file.
Use the COUNTRY_ADJUSTMENTS dict below to specify which countries to adjust and by how much.

Coordinate conversion:
  - 1° ≈ 111 km
  - 0.009° ≈ 1 km
"""
import json
from pathlib import Path

# ============================================================================
# CONFIGURATION: Add/modify country adjustments here
# ============================================================================
# Format: "Country Name": {"north_km": value, "east_km": value}
#   - north_km: positive = move north, negative = move south
#   - east_km: positive = move east, negative = move west
COUNTRY_ADJUSTMENTS = {
    "Vatican": {
        "north_km": 0,
        "east_km": -1,
    },
    # Add more countries as needed:
    # "San Marino": {
    #     "north_km": 0.5,
    #     "east_km": 0,
    # },
}
# ============================================================================

def km_to_degrees(km: float) -> float:
    """Convert kilometers to decimal degrees (approximate)."""
    return km / 111.0

def adjust_countries():
    data_file = Path("assets/data/countries-merged.json")
    
    # Load the data
    with open(data_file, encoding='utf-8') as f:
        data = json.load(f)
    
    # Track adjustments made
    adjusted_count = 0
    
    for feature in data['features']:
        country_name = feature.get('properties', {}).get('NAME')
        
        # Check if this country needs adjustment
        if country_name not in COUNTRY_ADJUSTMENTS:
            continue
        
        adjustment = COUNTRY_ADJUSTMENTS[country_name]
        
        # Convert km to degrees
        lat_offset = km_to_degrees(adjustment.get('north_km', 0))
        lon_offset = km_to_degrees(adjustment.get('east_km', 0))
        
        # Only proceed if there's actually an adjustment
        if lat_offset == 0 and lon_offset == 0:
            continue
        
        print(f"\n📍 Adjusting {country_name}:")
        print(f"   North: {adjustment.get('north_km', 0):+.1f} km ({lat_offset:+.6f}°)")
        print(f"   East:  {adjustment.get('east_km', 0):+.1f} km ({lon_offset:+.6f}°)")
        
        # Apply adjustment based on geometry type
        if feature.get('geometry', {}).get('type') == 'Polygon':
            coords = feature['geometry']['coordinates']
            for ring in coords:
                for point in ring:
                    point[0] += lon_offset  # longitude (x)
                    point[1] += lat_offset  # latitude (y)
            
            print(f"   ✓ Adjusted Polygon ({len(coords)} ring(s))")
        
        elif feature.get('geometry', {}).get('type') == 'MultiPolygon':
            coords = feature['geometry']['coordinates']
            for polygon in coords:
                for ring in polygon:
                    for point in ring:
                        point[0] += lon_offset  # longitude (x)
                        point[1] += lat_offset  # latitude (y)
            
            print(f"   ✓ Adjusted MultiPolygon ({len(coords)} polygon(s))")
        
        adjusted_count += 1
    
    # Save the modified data
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, separators=(',', ':'))
    
    print(f"\n{'='*60}")
    print(f"✓ Adjusted {adjusted_count} countries")
    print(f"✓ Saved to {data_file}")
    print(f"{'='*60}")

if __name__ == "__main__":
    adjust_countries()
