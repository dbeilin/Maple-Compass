# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Maple Compass is a React-based web application that helps MapleStory players find navigation paths between different maps in the game. It uses graph-based pathfinding (BFS) to compute routes through map portals and displays step-by-step navigation instructions with map previews.

**Key Technology Stack:**
- React 18 with TypeScript
- Vite for build tooling
- TanStack Query for data fetching/caching
- Tailwind CSS for styling
- MapleStory.io API (GMS version 83) for map data

## Essential Commands

### Development
```bash
npm run dev              # Start development server on http://localhost:5173
npm run build            # TypeScript compilation + production build
npm run lint             # Run ESLint
npm run preview          # Preview production build on http://localhost:3001
```

### Map Data Management
```bash
npm run generate-map-data    # Fetch all maps from API and build map-graph.json
npm run add-connection       # Add manual map connections (script in scripts/)
```

The `generate-map-data` script is critical - it fetches all map data from the MapleStory.io API and builds the navigation graph (`public/map-graph.json`) used for pathfinding. This is a long-running process that processes thousands of maps.

## Architecture

### Data Flow & Caching Strategy

1. **Map List**: Fetched once via TanStack Query with `staleTime: Infinity`, cached permanently in client
2. **Navigation Graph**: Pre-built JSON file (`public/map-graph.json`) loaded on-demand when pathfinding is first used
3. **Pathfinding**: BFS algorithm runs client-side using the cached graph

The app avoids repeated API calls by:
- Using TanStack Query's caching for the map list
- Pre-generating the entire navigation graph as a static JSON file
- Loading map images on-demand via URL functions (not fetched, just constructed)

### Core Modules

**[src/lib/pathfinding.ts](src/lib/pathfinding.ts)** - Graph-based BFS pathfinding
- Lazy-loads `map-graph.json` on first use
- `findPath()`: Returns array of PathStep objects describing the route
- `getDirection()`: Calculates directional hints (up/down/left/right) from portal coordinates

**[src/lib/api.ts](src/lib/api.ts)** - MapleStory.io API client
- Base URL: `https://maplestory.io/api/GMS/83`
- Key functions: `getAllMaps()`, `getMapDetails()`, utility functions for image URLs
- Note: Some maps may not be connected due to API limitations

**[src/types/map.ts](src/types/map.ts)** - TypeScript types
- `MapInfo`: Basic map metadata (id, name, streetName)
- `MapNode`: Graph node with connections array
- `MapGraph`: Record<mapId, MapNode> representing the entire navigation graph
- `PathStep`: Single navigation step with current/next map and portal info

**[src/App.tsx](src/App.tsx)** - Main application component
- Uses `nuqs` for URL query state management (`?from=X&to=Y`)
- Handles map selection, pathfinding, and result display
- Swap maps feature to quickly reverse source/target

**[src/components/map-search.tsx](src/components/map-search.tsx)** - Map search autocomplete
- Filters maps by name and streetName with multi-term support
- Limits results to 10 for performance
- Click-outside-to-close behavior

### Map Graph Structure

The `public/map-graph.json` file is structured as:
```json
{
  "mapId": {
    "id": number,
    "name": string,
    "streetName": string,
    "connections": [
      {
        "toMapId": number,
        "portalName": string,
        "x": number,
        "y": number
      }
    ]
  }
}
```

Portals with names 'sp' (spawn point) and 'tp' (teleport) are filtered out during graph generation as they're not navigable portals.

## Development Notes

- **URL State Management**: Map selections persist in URL query params (`?from=X&to=Y`) using `nuqs`, defaulting to -1 for empty state
- **Port Configuration**: Dev server runs on 5173, preview on 3001 (Docker also uses 3001)
- **API Constraints**: The MapleStory.io API may not have complete portal data for all maps, so pathfinding works best within the same world/region
- **Image Loading**: Map images, icons, and minimaps are loaded via constructed URLs, not fetched as data
- **TypeScript Strict Mode**: Enabled with `noUnusedLocals` and `noUnusedParameters`

## Project Context

This is a hobby/nostalgia project for MapleStory (specifically Artale server). The developer cannot promise to fix all issues but welcomes PRs. The app prioritizes simplicity and client-side performance over comprehensive coverage of all game maps.
