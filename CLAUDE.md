# Maple Compass - MapleStory Pathfinding System

## Project Overview

Maple Compass is a Next.js web application that helps MapleStory players navigate between maps by finding the shortest path through portals. The core functionality uses a **breadth-first search (BFS)** algorithm on a pre-built graph of map connections.

**What it does:** Given a starting map and destination map, it returns step-by-step navigation instructions with directions (left/right/up/down) based on portal coordinates.

## Tech Stack

- **Framework:** Next.js (latest, created with `npx create-next-app@latest`)
- **Pathfinding:** BFS algorithm in TypeScript
- **Data Source:** Royals Library API (`https://royals-library.netlify.app/api/v1/map`)
- **Data Processing:** Python scripts for fetching and building the map graph
- **Graph Storage:** Pre-built `map-graph.json` file in `public/` directory

## Data Source: Royals Library API

### API Endpoints

```bash
# Get detailed map info (includes portals, mobs, BGM, etc.)
GET https://royals-library.netlify.app/api/v1/map?id=104040000

# Get paginated list of all maps
GET https://royals-library.netlify.app/api/v1/map?page=1&location=VictoriaIsland&search=hunting
```

**Query Parameters for pagination:**
- `page` - integer (default: 1)
- `location` - Filter by area (e.g., "VictoriaIsland", "Ludibrium", "Leafre", etc.)
- `search` - Search string for map names

### Full Map Response Example

```json
{
  "id": 104040000,
  "mapCategory": "victoria",
  "streetName": "Victoria Road",
  "mapName": "Henesys Hunting Ground I",
  "myMapCateogry": "VictoriaIsland",
  "imgURL": "https://royals-library.netlify.app/images/maps/104040000.png",
  "HDImgURL": "https://maplestory.io/api/GMS/83/map/104040000/render",
  "version": 10,
  "returnMap": 100000000,
  "mobRate": "1.6",
  "bgm": "Bgm01/CavaBien",
  "portal": [
    {"pn": "sp", "pt": 0, "x": -417, "y": 65, "tm": 999999999, "tn": ""},
    {"pn": "west00", "pt": 2, "x": -322, "y": 215, "tm": 104030000, "tn": "east00"},
    {"pn": "east00", "pt": 2, "x": 1625, "y": 216, "tm": 100000000, "tn": "west00"},
    {"pn": "in00", "pt": 3, "x": 958, "y": -851, "tm": 104040001, "tn": "st00"}
  ],
  "mob": [
    {"mobId": "1210102", "name": "Orange Mushroom", "count": 5}
  ]
}
```

**Portal Fields:**
- `pn` - Portal name (e.g., "west00", "east00", "in00", "sp")
- `pt` - Portal type (0 = spawn point, 2 = map transition, 3 = door/entrance, etc.)
- `x`, `y` - Portal coordinates (used for direction calculation)
- `tm` - Target map ID (999999999 means no destination)
- `tn` - Target portal name (where you arrive in the destination map)

## Map Graph Structure

The pathfinding system relies on `public/map-graph.json`, a pre-built graph structure generated from the API data.

### Graph Format

```typescript
interface MapGraph {
  [mapId: string]: {
    id: number
    name: string           // e.g., "Henesys Hunting Ground I"
    streetName: string     // e.g., "Victoria Road"
    connections: Array<{
      toMapId: number      // Destination map ID
      portalName: string   // Portal identifier (e.g., "west00")
      x: number           // Portal X coordinate
      y: number           // Portal Y coordinate
    }>
  }
}
```

### Example Graph Entry

```json
{
  "104040000": {
    "id": 104040000,
    "name": "Henesys Hunting Ground I",
    "streetName": "Victoria Road",
    "connections": [
      {
        "toMapId": 104030000,
        "portalName": "west00",
        "x": -322,
        "y": 215
      },
      {
        "toMapId": 100000000,
        "portalName": "east00",
        "x": 1625,
        "y": 216
      },
      {
        "toMapId": 104040001,
        "portalName": "in00",
        "x": 958,
        "y": -851
      }
    ]
  }
}
```

### Portal Filtering Rules

When building the graph, **exclude** these portals:
- **Spawn points** (`pn` = "sp") - These are monster/player spawn locations, not navigation portals
- **No-destination portals** (`tm` = 999999999) - These don't lead anywhere
- **Town portals** (`pn` = "tp") - May be included depending on navigation needs

## Python Data Fetching Scripts

Located in `scripts/` directory:

### `fetch_royals_library_data.py`

**Purpose:** Fetch all map data from Royals Library API and build `map-graph.json`

**Process:**
1. Paginate through all maps using `GET /api/v1/map?page={n}`
2. For each map, fetch detailed portal data
3. Filter portals (exclude spawn points, invalid destinations)
4. Build graph structure with connections
5. Save to `public/map-graph.json`

**Key Logic:**
```python
# Skip spawn points
if pn == 'sp':
    continue

# Skip portals with no destination
if tm == 999999999:
    continue

connections.append({
    'toMapId': int(tm),
    'portalName': pn,
    'x': portal.get('x', 0),
    'y': portal.get('y', 0)
})
```

### `add_bidirectional_connections.py`

**Purpose:** Ensure all portal connections are bidirectional

**Why it's needed:** Some maps may have one-way portals in the API data, but most game portals should work both ways. This script ensures if Map A → Map B exists, then Map B → Map A also exists.

### `debug_path.py`

**Purpose:** Command-line tool to test pathfinding between two maps

**Usage:**
```bash
python scripts/debug_path.py <start_map_id> <end_map_id>
python scripts/debug_path.py 211000000 211040300
```

## Pathfinding Algorithm (BFS)

### Core Concept

Uses **Breadth-First Search** to find the shortest path (by number of map transitions) between two maps.

### TypeScript Implementation

```typescript
interface QueueItem {
  mapId: number          // Current map being explored
  path: PathStep[]       // Path taken to reach this map
  visited: Set<number>   // Maps already visited (prevents cycles)
}

async function findPath(
  startMap: MapInfo,
  endMap: MapInfo
): Promise<PathStep[]> {
  // Load map graph
  const mapGraph = await loadMapGraph()
  
  // Edge case: already at destination
  if (startMap.id === endMap.id) {
    return []
  }
  
  // Initialize BFS queue with starting map's connections
  const queue: QueueItem[] = []
  const startNode = mapGraph[startMap.id]
  
  for (const connection of startNode.connections) {
    queue.push({
      mapId: connection.toMapId,
      path: [{
        currentMap: startMap,
        nextMap: mapGraph[connection.toMapId],
        portal: connection,
        direction: getDirection(
          { x: 0, y: 0 },
          { x: connection.x, y: connection.y }
        )
      }],
      visited: new Set([startMap.id, connection.toMapId])
    })
  }
  
  // BFS loop
  while (queue.length > 0) {
    const { mapId, path, visited } = queue.shift()!
    
    // Found destination!
    if (mapId === endMap.id) {
      return path
    }
    
    // Explore connections from current map
    const currentNode = mapGraph[mapId]
    for (const connection of currentNode.connections) {
      // Skip already-visited maps (prevents infinite loops)
      if (visited.has(connection.toMapId)) {
        continue
      }
      
      // Add to queue with updated path
      const nextNode = mapGraph[connection.toMapId]
      queue.push({
        mapId: connection.toMapId,
        path: [
          ...path,
          {
            currentMap: currentNode,
            nextMap: nextNode,
            portal: connection,
            direction: getDirection(
              { x: 0, y: 0 },
              { x: connection.x, y: connection.y }
            )
          }
        ],
        visited: new Set([...visited, connection.toMapId])
      })
    }
  }
  
  // No path found
  throw new Error('No path found between maps')
}
```

### PathStep Interface

Each step in the path contains:

```typescript
interface PathStep {
  currentMap: {
    id: number
    name: string
    streetName: string
  }
  nextMap: {
    id: number
    name: string
    streetName: string
  }
  portal: {
    portalName: string
    toMapId: number
    x: number
    y: number
  }
  direction: 'left' | 'right' | 'up' | 'down' | ''
}
```

## Direction Calculation

Directions are inferred from portal coordinates to help players navigate:

```typescript
function getDirection(
  fromPortal: { x: number; y: number },
  toPortal: { x: number; y: number }
): string {
  const dx = toPortal.x - fromPortal.x
  const dy = toPortal.y - fromPortal.y

  // No movement
  if (dx === 0 && dy === 0) {
    return ''
  }

  // Prioritize horizontal movement
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  }
  
  // Vertical movement
  return dy > 0 ? 'down' : 'up'
}
```

**Logic:**
- Compare absolute differences in X and Y coordinates
- If horizontal change is greater → `left` or `right`
- If vertical change is greater → `up` or `down`
- Horizontal movement takes priority when equal

**MapleStory Coordinate System:**
- Positive X = right
- Negative X = left
- Positive Y = down (inverted from typical math coordinates)
- Negative Y = up

## Special Cases & Edge Cases

### Self-Referencing Connections

Some maps have portals that connect to themselves (same `id` and `toMapId`):

```json
{
  "100000203": {
    "id": 100000203,
    "name": "Henesys Game Park",
    "connections": [
      {"toMapId": 100000203, "portalName": "up01", "x": 17, "y": 274},
      {"toMapId": 100000203, "portalName": "up02", "x": 9, "y": 63}
    ]
  }
}
```

**What they represent:**
- Ladders/ropes between floors within the same map
- Teleport pads to different areas of the same map
- Vertical navigation within a single map

**Pathfinding handling:**
- These are **NOT filtered out** - they may be necessary for navigation
- BFS visits tracking prevents infinite loops
- Players may need to climb ladders to reach other portals

### Disconnected Map Regions

Not all maps are connected:
- Different continents (Victoria Island vs Ludibrium)
- Some areas require ship travel or special access
- Tutorial/instance maps may be isolated

**Handling:** If no path exists, the algorithm returns an error after exhausting all possibilities.

### Empty Paths

If `startMap.id === endMap.id`, return an empty array `[]` - the player is already at their destination.

## Performance Characteristics

- **Graph Loading:** One-time fetch of `map-graph.json` (~5000+ maps)
- **BFS Complexity:** O(V + E) where V = maps, E = portal connections
- **Memory:** Visited set per path prevents exponential growth
- **Typical Performance:** Sub-second for most paths
- **Worst Case:** Searching across disconnected regions explores entire graph

## File Structure

```
maple-compass/
├── public/
│   └── map-graph.json          # Pre-built navigation graph
├── scripts/
│   ├── fetch_royals_library_data.py    # Fetch and build graph
│   ├── add_bidirectional_connections.py # Ensure two-way portals
│   └── debug_path.py                    # CLI pathfinding tester
├── src/
│   ├── lib/
│   │   └── pathfinding.ts      # BFS implementation
│   └── app/
│       └── ...                 # Next.js app structure
└── CLAUDE.md                   # This file
```

## Development Workflow

### Building the Map Graph

```bash
# Fetch all map data and build graph
python scripts/fetch_royals_library_data.py

# Ensure bidirectional connections
python scripts/add_bidirectional_connections.py

# Output: public/map-graph.json
```

## Key Implementation Notes

1. **Portal Coordinates:** These are in-game pixel positions, not geographic coordinates
2. **Map IDs:** Official MapleStory map IDs (not sequential)
3. **Street Names:** Can be empty or in various languages
4. **Graph Must Be Pre-built:** Pathfinding assumes `map-graph.json` exists
5. **No Dynamic API Calls:** All pathfinding is done on static graph data for performance

---

## Quick Reference

**Main Concepts:**
- Pre-built graph from Royals Library API
- BFS for shortest path (by hop count)
- Direction inferred from portal coordinates
- Python scripts for data fetching
- TypeScript/Next.js for web app

**Critical Files:**
- `public/map-graph.json` - Navigation graph
- `scripts/fetch_royals_library_data.py` - Data fetcher
- `src/lib/pathfinding.ts` - BFS algorithm
