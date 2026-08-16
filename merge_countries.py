#!/usr/bin/env python3
"""
Merge Natural Earth 110m and 50m country datasets intelligently.
- Uses 110m as base (larger countries, simplified geometry)
- Adds 50m data for small countries not in 110m
- Deduplicates by ISO_A3 code
"""
import json
from pathlib import Path

def merge_countries():
    data_dir = Path("assets/data")
    
    # Load both datasets
    with open(data_dir / "countries110.json", encoding='utf-8') as f:
        data_110 = json.load(f)
    
    with open(data_dir / "countries50.json", encoding='utf-8') as f:
        data_50 = json.load(f)
    
    print(f"110m dataset: {len(data_110['features'])} countries")
    print(f"50m dataset: {len(data_50['features'])} countries")
    
    # Create a set of ISO_A3 codes in 110m
    iso_codes_110 = set()
    for feature in data_110['features']:
        iso = feature.get('properties', {}).get('ISO_A3')
        if iso:
            iso_codes_110.add(iso)
    
    print(f"Unique ISO_A3 codes in 110m: {len(iso_codes_110)}")
    
    # Start with 110m features
    merged_features = data_110['features'].copy()
    
    # Add 50m features that are NOT in 110m (small countries)
    added_count = 0
    for feature in data_50['features']:
        iso = feature.get('properties', {}).get('ISO_A3')
        if iso and iso not in iso_codes_110:
            merged_features.append(feature)
            added_count += 1
            print(f"  Adding from 50m: {feature.get('properties', {}).get('NAME', 'Unknown')} ({iso})")
    
    print(f"\nAdded {added_count} small countries from 50m")
    print(f"Total countries in merged file: {len(merged_features)}")
    
    # Create merged dataset
    merged_data = {
        "type": "FeatureCollection",
        "name": "ne_countries_merged_110m_50m",
        "crs": data_110.get("crs"),
        "features": merged_features
    }
    
    # Save merged dataset
    output_file = data_dir / "countries-merged.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(merged_data, f, separators=(',', ':'))
    
    file_size_mb = output_file.stat().st_size / (1024 * 1024)
    print(f"\n✓ Merged file saved to: {output_file}")
    print(f"  File size: {file_size_mb:.2f} MB")

if __name__ == "__main__":
    merge_countries()
