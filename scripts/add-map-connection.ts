#!/usr/bin/env tsx

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';

type Direction = 'left' | 'right' | 'up' | 'down' | '';

interface MapConnection {
  toMapId: number;
  portalName: string;
  x: number;
  y: number;
}

interface MapNode {
  id: number;
  name: string;
  streetName: string;
  connections: MapConnection[];
}

interface MapGraph {
  [key: string]: MapNode;
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

interface MapWithDirection {
  mapId: string;
  direction: Direction;
}

function getCoordinatesForDirection(direction: Direction): { x: number; y: number } {
  // These values are typical portal positions in MapleStory maps
  switch (direction) {
    case 'left':
      return { x: -800, y: 0 };
    case 'right':
      return { x: 800, y: 0 };
    case 'up':
      return { x: 0, y: -600 };
    case 'down':
      return { x: 0, y: 600 };
    default:
      return { x: 0, y: 0 };
  }
}

async function getDirection(): Promise<Direction> {
  const input = (await question('Enter direction (left/right/up/down) or press Enter for no direction: ')).toLowerCase();
  
  if (input === '') return '';
  if (['left', 'right', 'up', 'down'].includes(input)) {
    return input as Direction;
  }
  console.log('Invalid direction. Please enter left, right, up, down, or press Enter for no direction.');
  return getDirection();
}

async function main() {
  // Read the map graph
  const mapGraphPath = join(process.cwd(), 'public', 'map-graph.json');
  const mapGraph: MapGraph = JSON.parse(readFileSync(mapGraphPath, 'utf-8'));

  console.log('Welcome to the Map Connection Tool!\n');
  
  // Get source map ID
  const sourceMapId = await question('Enter the source map ID (e.g., 101000300): ');
  if (!mapGraph[sourceMapId]) {
    console.error('Source map not found!');
    process.exit(1);
  }
  console.log(`Selected: ${mapGraph[sourceMapId].name} (${mapGraph[sourceMapId].streetName})\n`);

  // Get target map ID
  const targetMapId = await question('Enter the target map ID (e.g., 200000100): ');
  if (!mapGraph[targetMapId]) {
    console.error('Target map not found!');
    process.exit(1);
  }
  console.log(`Selected: ${mapGraph[targetMapId].name} (${mapGraph[targetMapId].streetName})\n`);

  // Get intermediate maps with directions
  const intermediateMaps: MapWithDirection[] = [];
  console.log('\nEnter intermediate map IDs one by one (press Enter without input when done):');
  
  while (true) {
    const intermediateMapId = await question('\nEnter intermediate map ID (or press Enter to finish): ');
    if (!intermediateMapId) break;
    
    if (!mapGraph[intermediateMapId]) {
      console.log('Map not found, try again.');
      continue;
    }
    
    const direction = await getDirection();
    console.log(`Added: ${mapGraph[intermediateMapId].name} (${mapGraph[intermediateMapId].streetName}) - Direction: ${direction || 'none'}`);
    intermediateMaps.push({ mapId: intermediateMapId, direction });
  }

  // Get final direction to target
  console.log('\nEnter direction for the final connection:');
  const finalDirection = await getDirection();

  // Create connections
  const allMaps = [
    { mapId: sourceMapId, direction: '' }, // First map doesn't need a direction
    ...intermediateMaps,
    { mapId: targetMapId, direction: finalDirection }
  ];
  
  // Connect each map to the next one in sequence
  for (let i = 0; i < allMaps.length - 1; i++) {
    const currentMapId = allMaps[i].mapId;
    const nextMapId = allMaps[i + 1].mapId;
    const direction = allMaps[i + 1].direction;
    
    // Add connection to next map if it doesn't exist
    if (!mapGraph[currentMapId].connections.some(conn => conn.toMapId === Number(nextMapId))) {
      const { x, y } = getCoordinatesForDirection(direction);
      
      mapGraph[currentMapId].connections.push({
        toMapId: Number(nextMapId),
        portalName: "portal00", // Default portal name
        x,
        y
      });
      console.log(`Added connection: ${mapGraph[currentMapId].name} → ${mapGraph[nextMapId].name} ${direction ? `(${direction})` : ''}`);
    }
  }

  // Save the updated map graph
  writeFileSync(mapGraphPath, JSON.stringify(mapGraph, null, 2));
  console.log('\nConnections have been added successfully!');
  
  rl.close();
}

main().catch(console.error);
