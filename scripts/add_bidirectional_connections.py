#!/usr/bin/env python3
"""
Add bidirectional connections to the map graph.

Many portals in MapleStory work both ways, but the API only stores them
in one direction. This script ensures that if map A connects to map B,
then map B also connects back to map A (unless it already does).
"""
import json
import os
from typing import Dict, Set, Tuple

def load_map_graph(path: str) -> Dict:
    """Load the map graph JSON"""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_map_graph(path: str, graph: Dict):
    """Save the map graph JSON"""
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(graph, f, indent=2, ensure_ascii=False)

def add_bidirectional_connections(graph: Dict) -> Tuple[int, int]:
    """
    Add reverse connections for all portals.
    Returns (connections_added, errors)
    """
    added = 0
    errors = 0

    # Build a set of existing connections for quick lookup
    # Format: (from_map_id, to_map_id, portal_name)
    existing_connections: Set[Tuple[int, int, str]] = set()

    for map_id_str, map_node in graph.items():
        map_id = int(map_id_str)
        for conn in map_node['connections']:
            existing_connections.add((map_id, conn['toMapId'], conn['portalName']))

    print(f"Analyzing {len(graph)} maps...")
    print(f"Found {len(existing_connections)} existing connections\n")

    # For each connection, check if reverse exists
    for map_id_str, map_node in graph.items():
        from_map_id = int(map_id_str)

        for conn in map_node['connections']:
            to_map_id = conn['toMapId']
            portal_name = conn['portalName']

            # Skip self-loops
            if from_map_id == to_map_id:
                continue

            # Check if reverse connection exists
            # We look for any connection from to_map back to from_map
            # (portal name might be different)
            reverse_exists = any(
                (to_map_id, from_map_id, pn) in existing_connections
                for pn in [portal_name, f"{portal_name}_reverse", ""]
            )

            if not reverse_exists:
                # Check if target map exists in graph
                to_map_str = str(to_map_id)
                if to_map_str not in graph:
                    errors += 1
                    continue

                # Add reverse connection
                # Try to infer a reverse portal name
                reverse_portal_name = infer_reverse_portal_name(portal_name)

                # Check if this exact reverse connection already exists
                target_connections = graph[to_map_str]['connections']
                already_has = any(
                    c['toMapId'] == from_map_id
                    for c in target_connections
                )

                if not already_has:
                    # Add the reverse connection
                    reverse_conn = {
                        'toMapId': from_map_id,
                        'portalName': reverse_portal_name,
                        'x': conn.get('x', 0),
                        'y': conn.get('y', 0)
                    }

                    graph[to_map_str]['connections'].append(reverse_conn)
                    existing_connections.add((to_map_id, from_map_id, reverse_portal_name))
                    added += 1

                    if added % 100 == 0:
                        print(f"  Added {added} connections...")

    return added, errors

def infer_reverse_portal_name(portal_name: str) -> str:
    """
    Infer the reverse portal name based on common patterns.

    Examples:
    - 'east00' -> 'west00'
    - 'top00' -> 'under00' or 'bottom00'
    - 'left00' -> 'right00'
    - 'in00' -> 'out00'
    """
    # Direction opposites
    opposites = {
        'east': 'west',
        'west': 'east',
        'top': 'under',
        'under': 'top',
        'bottom': 'top',
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left',
        'in': 'out',
        'out': 'in',
        'north': 'south',
        'south': 'north',
    }

    # Try to match pattern like 'east00'
    for direction, opposite in opposites.items():
        if portal_name.startswith(direction):
            # Replace the direction part
            return portal_name.replace(direction, opposite, 1)

    # If no pattern matched, just add '_reverse'
    return f"{portal_name}_reverse"

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    graph_path = os.path.join(script_dir, '..', 'public', 'map-graph.json')

    print("=" * 80)
    print("Add Bidirectional Connections")
    print("=" * 80)
    print()

    # Load graph
    print(f"Loading map graph from {graph_path}...")
    graph = load_map_graph(graph_path)
    print(f"Loaded {len(graph)} maps\n")

    # Add bidirectional connections
    added, errors = add_bidirectional_connections(graph)

    print()
    print("=" * 80)
    print("Results")
    print("=" * 80)
    print(f"✓ Added {added} reverse connections")
    if errors > 0:
        print(f"⚠ {errors} connections skipped (target map not in graph)")
    print()

    # Save updated graph
    print(f"Saving updated graph to {graph_path}...")
    save_map_graph(graph_path, graph)
    print("✓ Done!")
    print()
    print("You can now test pathfinding again.")
    print("Run: python scripts/debug_path.py 211000000 211040300")

if __name__ == "__main__":
    main()
