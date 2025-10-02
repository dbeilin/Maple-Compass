import requests
import json
import time
from typing import Dict, List, Any

BASE_URL = "https://royals-library.netlify.app/api/v1"

def fetch_all_maps() -> List[Dict[str, Any]]:
    """Fetch all maps from the Royals Library API with pagination"""
    all_maps = []
    page = 1
    
    while True:
        print(f"Fetching page {page}...")
        try:
            response = requests.get(f"{BASE_URL}/map", params={"page": page}, timeout=10)
            
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                break
                
            response_data = response.json()

            # The API returns {'data': [...]} structure
            data = response_data.get('data', [])

            # Check if there are maps in the response
            if not data or len(data) == 0:
                break

            all_maps.extend(data)
            print(f"  Retrieved {len(data)} maps (total: {len(all_maps)})")
            
            # If we got fewer results than a typical page size, we're probably done
            if len(data) < 50:
                break
                
            page += 1
            time.sleep(0.3)  # Be nice to the API
            
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break
    
    return all_maps


def build_map_graph(maps_with_details: List[Dict[str, Any]]) -> Dict[int, Dict[str, Any]]:
    """Build a graph structure from map data"""
    graph = {}

    for map_data in maps_with_details:
        if not map_data:
            continue

        map_id_str = map_data.get('id')
        if not map_id_str:
            continue

        try:
            map_id = int(map_id_str)
        except (ValueError, TypeError):
            print(f"Warning: Invalid map ID '{map_id_str}', skipping")
            continue
        
        # Filter portals - exclude 'sp' (spawn points) and 'tp' (town portals without destinations)
        portals = map_data.get('portal', [])
        connections = []
        
        for portal in portals:
            pn = portal.get('pn', '')
            tm = portal.get('tm', 999999999)

            # Skip spawn points
            if pn == 'sp':
                continue

            # Skip portals that don't go anywhere (tm = 999999999 means no destination)
            if tm == 999999999:
                continue

            try:
                to_map_id = int(tm) if isinstance(tm, str) else tm
            except (ValueError, TypeError):
                continue

            connections.append({
                'toMapId': to_map_id,
                'portalName': pn,
                'x': portal.get('x', 0),
                'y': portal.get('y', 0)
            })
        
        graph[map_id] = {
            'id': map_id,
            'name': map_data.get('mapName', 'Unknown'),
            'streetName': map_data.get('streetName', 'Unknown'),
            'connections': connections
        }
    
    return graph

def fetch_map_details(map_id: int) -> Dict[str, Any]:
    """Get detailed info for a specific map including portals"""
    try:
        response = requests.get(f"{BASE_URL}/map", params={"id": map_id}, timeout=10)
        if response.status_code == 200:
            return response.json()
    except Exception as e:
        print(f"Error fetching details for map {map_id}: {e}")
    return None

def main():
    print("=== Royals Library Map Data Fetcher ===\n")

    # Step 1: Fetch all maps list (basic info only)
    print("Step 1: Fetching all maps list...")
    all_maps = fetch_all_maps()
    print(f"\nTotal maps retrieved: {len(all_maps)}\n")

    if not all_maps:
        print("Error: No maps fetched. Exiting.")
        return

    # Step 2: Fetch detailed info for each map (to get portals)
    print("Step 2: Fetching detailed info for each map...")
    print("This will take a while...\n")

    detailed_maps = []
    total = len(all_maps)

    for i, map_basic in enumerate(all_maps, 1):
        map_id_str = map_basic.get('id')
        if not map_id_str:
            continue

        try:
            map_id = int(map_id_str)
        except (ValueError, TypeError):
            continue

        if i % 50 == 0 or i == 1:
            print(f"Progress: {i}/{total} maps ({i*100//total}%)")

        details = fetch_map_details(map_id)
        if details:
            detailed_maps.append(details)

        # Be nice to the API
        time.sleep(0.3)

    print(f"\nFetched details for {len(detailed_maps)} maps")

    # Step 3: Build the graph
    print("\nStep 3: Building map graph...")
    graph = build_map_graph(detailed_maps)
    print(f"Built graph with {len(graph)} nodes")

    # Calculate statistics
    total_connections = sum(len(node['connections']) for node in graph.values())
    nodes_with_connections = sum(1 for node in graph.values() if node['connections'])

    print(f"\n=== Graph Statistics ===")
    print(f"Total maps: {len(graph)}")
    print(f"Maps with connections: {nodes_with_connections}")
    print(f"Total connections: {total_connections}")
    print(f"Average connections per map: {total_connections/len(graph):.2f}")

    # Step 3: Save the graph to the public directory
    import os
    output_path = os.path.join(os.path.dirname(__file__), "..", "public", "map-graph.json")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Successfully saved map graph to {output_path}")

    print("\n=== Done! ===")
    print("The map-graph.json file has been updated in your project.")

if __name__ == "__main__":
    main()