#!/usr/bin/env python3
"""
Debug script to trace BFS pathfinding between two maps
"""
import json
import sys
from collections import deque
from typing import Dict, List, Set, Optional

def load_map_graph(path: str = "../public/map-graph.json") -> Dict:
    """Load the map graph JSON"""
    import os
    script_dir = os.path.dirname(os.path.abspath(__file__))
    full_path = os.path.join(script_dir, path)

    with open(full_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def bfs_debug(graph: Dict, start_id: int, end_id: int, max_depth: int = 50) -> Optional[List[int]]:
    """
    BFS pathfinding with detailed debugging output
    Returns the path as a list of map IDs
    """
    print(f"\n{'='*80}")
    print(f"BFS PATHFINDING DEBUG")
    print(f"{'='*80}")
    print(f"Start: {start_id} - {graph.get(str(start_id), {}).get('name', 'UNKNOWN')}")
    print(f"End:   {end_id} - {graph.get(str(end_id), {}).get('name', 'UNKNOWN')}")
    print(f"{'='*80}\n")

    start_key = str(start_id)
    end_key = str(end_id)

    # Check if maps exist
    if start_key not in graph:
        print(f"❌ ERROR: Start map {start_id} not found in graph!")
        return None

    if end_key not in graph:
        print(f"❌ ERROR: End map {end_id} not found in graph!")
        return None

    # Initialize BFS
    queue = deque()
    visited = set([start_id])

    # Start with connections from the start map
    start_node = graph[start_key]
    print(f"Starting from: {start_node['name']} ({start_id})")
    print(f"  Has {len(start_node['connections'])} connections:")
    for conn in start_node['connections']:
        to_id = conn['toMapId']
        to_key = str(to_id)
        to_name = graph.get(to_key, {}).get('name', 'UNKNOWN')
        print(f"    -> {conn['portalName']}: {to_name} ({to_id})")

        queue.append({
            'map_id': to_id,
            'path': [start_id, to_id],
            'depth': 1
        })
        visited.add(to_id)

    print(f"\nInitial queue size: {len(queue)}\n")

    # BFS loop
    iterations = 0
    max_iterations = 100000

    while queue and iterations < max_iterations:
        iterations += 1
        current = queue.popleft()
        current_id = current['map_id']
        current_path = current['path']
        depth = current['depth']

        if depth > max_depth:
            continue

        # Found the target!
        if current_id == end_id:
            print(f"✅ PATH FOUND in {iterations} iterations!")
            print(f"   Depth: {depth} maps")
            print(f"   Visited: {len(visited)} unique maps")
            print(f"\nPath:")
            for i, map_id in enumerate(current_path):
                map_key = str(map_id)
                map_name = graph.get(map_key, {}).get('name', 'UNKNOWN')
                arrow = " -> " if i < len(current_path) - 1 else ""
                print(f"   {i+1}. {map_name} ({map_id}){arrow}")
            return current_path

        # Explore connections
        current_key = str(current_id)
        if current_key not in graph:
            continue

        current_node = graph[current_key]

        # Debug output every 1000 iterations
        if iterations % 1000 == 0:
            print(f"[Iteration {iterations}] Exploring: {current_node['name']} (depth={depth}, visited={len(visited)})")

        for conn in current_node['connections']:
            to_id = conn['toMapId']

            if to_id in visited:
                continue

            visited.add(to_id)
            queue.append({
                'map_id': to_id,
                'path': current_path + [to_id],
                'depth': depth + 1
            })

    # No path found
    print(f"\n❌ NO PATH FOUND")
    print(f"   Iterations: {iterations}")
    print(f"   Visited maps: {len(visited)}")
    print(f"   Queue exhausted: {len(queue) == 0}")

    # Check if target was reachable
    if end_id not in visited:
        print(f"\n🔍 Target map was NEVER reached during BFS")
        print(f"   This suggests the target is in a disconnected component")

        # Find what maps ARE connected to the target
        print(f"\n   Maps that connect TO the target:")
        target_node = graph[end_key]
        for conn in target_node['connections']:
            to_key = str(conn['toMapId'])
            to_name = graph.get(to_key, {}).get('name', 'UNKNOWN')
            in_visited = "✓ reachable" if conn['toMapId'] in visited else "✗ not reachable"
            print(f"     {conn['portalName']}: {to_name} ({conn['toMapId']}) - {in_visited}")

        # Find what maps connect to the target (reverse lookup)
        print(f"\n   Maps that have portals leading TO {end_id}:")
        found_any = False
        for map_key, map_node in graph.items():
            for conn in map_node['connections']:
                if conn['toMapId'] == end_id:
                    found_any = True
                    map_id = int(map_key)
                    in_visited = "✓ reachable" if map_id in visited else "✗ not reachable"
                    print(f"     {map_node['name']} ({map_key}) via {conn['portalName']} - {in_visited}")

        if not found_any:
            print(f"     (none found - this is the problem!)")

    return None

def main():
    if len(sys.argv) != 3:
        print("Usage: python debug_path.py <start_map_id> <end_map_id>")
        print("Example: python debug_path.py 211000000 211040300")
        sys.exit(1)

    try:
        start_id = int(sys.argv[1])
        end_id = int(sys.argv[2])
    except ValueError:
        print("Error: Map IDs must be integers")
        sys.exit(1)

    print("Loading map graph...")
    graph = load_map_graph()
    print(f"Loaded {len(graph)} maps\n")

    path = bfs_debug(graph, start_id, end_id)

    if path:
        print(f"\n{'='*80}")
        print("SUCCESS")
        print(f"{'='*80}")
    else:
        print(f"\n{'='*80}")
        print("FAILED - See diagnostics above")
        print(f"{'='*80}")

if __name__ == "__main__":
    main()
