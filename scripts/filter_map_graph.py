#!/usr/bin/env python3
"""
Filter out problematic map entries from map-graph.json:
- Maps with Korean characters (including HTML-encoded)
- Maps with quoted names
- Maps with empty names or street names
"""

import json
import re
from pathlib import Path

def has_korean(text: str) -> bool:
    """Check if text contains Korean characters (Hangul)."""
    # Korean Unicode ranges: Hangul Syllables, Jamo, Compatibility Jamo
    korean_pattern = re.compile(r'[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]')
    return bool(korean_pattern.search(text))

def has_html_entities(text: str) -> bool:
    """Check if text contains HTML entities like &lt; &gt; &amp;"""
    return bool(re.search(r'&[a-z]+;', text))

def should_filter_out(map_data: dict) -> bool:
    """Return True if this map should be filtered out."""
    name = map_data.get('name', '')
    street_name = map_data.get('streetName', '')

    # Filter out empty names
    if not name and not street_name:
        return True

    # Filter out maps with Korean characters
    if has_korean(name) or has_korean(street_name):
        return True

    # Filter out maps with HTML entities (often Korean maps)
    if has_html_entities(name) or has_html_entities(street_name):
        return True

    # Filter out quoted names (like "Henesys")
    if name.startswith('"') and name.endswith('"'):
        return True

    if street_name.startswith('"') and street_name.endswith('"'):
        return True

    return False

def main():
    # Paths
    project_root = Path(__file__).parent.parent
    input_file = project_root / 'public' / 'map-graph.json'
    output_file = project_root / 'public' / 'map-graph-filtered.json'
    backup_file = project_root / 'public' / 'map-graph-backup.json'

    print(f"Loading map graph from {input_file}...")

    # Load the map graph
    with open(input_file, 'r', encoding='utf-8') as f:
        map_graph = json.load(f)

    original_count = len(map_graph)
    print(f"Original map count: {original_count}")

    # Filter out problematic maps
    filtered_graph = {}
    filtered_out = []

    for map_id, map_data in map_graph.items():
        if should_filter_out(map_data):
            filtered_out.append({
                'id': map_id,
                'name': map_data.get('name', ''),
                'streetName': map_data.get('streetName', '')
            })
        else:
            filtered_graph[map_id] = map_data

    filtered_count = len(filtered_graph)
    removed_count = original_count - filtered_count

    print(f"\nFiltered map count: {filtered_count}")
    print(f"Removed {removed_count} maps")

    # Show sample of removed maps
    if filtered_out:
        print("\nSample of removed maps:")
        print("=" * 70)
        for item in filtered_out[:10]:
            print(f"  ID: {item['id']:<12} Name: {item['name']:<30} Street: {item['streetName']}")

    # Save backup of original
    print(f"\nSaving backup to {backup_file}...")
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(map_graph, f, ensure_ascii=False, indent=2)

    # Save filtered version
    print(f"Saving filtered graph to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(filtered_graph, f, ensure_ascii=False, indent=2)

    print("\n✅ Done! Review the filtered graph and replace the original if satisfied:")
    print(f"   mv {output_file} {input_file}")

if __name__ == '__main__':
    main()
