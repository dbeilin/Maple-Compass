import type { MapGraph, MapInfo, PathStep } from '../types/map'

let mapGraph: MapGraph | null = null

export async function initializePathfinding() {
  if (!mapGraph) {
    try {
      console.log('Loading map data...')
      const graphResponse = await fetch('/map-graph.json')

      if (!graphResponse.ok) {
        throw new Error(`Failed to load map graph data: ${graphResponse.status} ${graphResponse.statusText}`)
      }

      mapGraph = await graphResponse.json()
      const nodeCount = mapGraph ? Object.keys(mapGraph).length : 0
      console.log(`Loaded map graph with ${nodeCount} nodes`)
    } catch (error) {
      console.error('Error loading map graph:', error)
      throw error
    }
  }
  return mapGraph
}

function getDirection(fromPortal: { x: number; y: number }, toPortal: { x: number; y: number }): string {
  const dx = toPortal.x - fromPortal.x
  const dy = toPortal.y - fromPortal.y

  // If both dx and dy are 0, no direction is specified
  if (dx === 0 && dy === 0) {
    return ''
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  }
  return dy > 0 ? 'down' : 'up'
}

interface QueueItem {
  mapId: number
  path: PathStep[]
  visited: Set<number>
}

export async function findPath(
  startMap: MapInfo,
  endMap: MapInfo
): Promise<PathStep[]> {
  if (!mapGraph) {
    await initializePathfinding()
  }

  if (!mapGraph) {
    throw new Error('Map graph not initialized')
  }

  console.log(`Finding path from ${startMap.name} (${startMap.id}) to ${endMap.name} (${endMap.id})`)

  const queue: QueueItem[] = []
  const startNode = mapGraph[startMap.id]
  const endNode = mapGraph[endMap.id]
  
  if (!startNode) {
    throw new Error(`Start map ${startMap.name} (${startMap.id}) not found in graph`)
  }

  if (!endNode) {
    throw new Error(`End map ${endMap.name} (${endMap.id}) not found in graph`)
  }

  if (startMap.id === endMap.id) {
    console.log('Start and end maps are the same')
    return []
  }

  // Initialize queue with connections from start map
  for (const connection of startNode.connections) {
    const nextNode = mapGraph[connection.toMapId]
    if (!nextNode) continue

    queue.push({
      mapId: connection.toMapId,
      path: [
        {
          currentMap: startMap,
          nextMap: {
            id: nextNode.id,
            name: nextNode.name,
            streetName: nextNode.streetName
          },
          portal: {
            portalName: connection.portalName,
            toName: '', // Not needed for pathfinding
            type: 0, // Not needed for pathfinding
            toMap: connection.toMapId,
            x: connection.x,
            y: connection.y,
            isStarForcePortal: false,
            linkToMap: '',
            toMapName: {
              id: nextNode.id,
              name: nextNode.name,
              streetName: nextNode.streetName
            }
          },
          direction: getDirection(
            { x: 0, y: 0 }, // Assuming starting position
            { x: connection.x, y: connection.y }
          ),
        },
      ],
      visited: new Set([startMap.id, connection.toMapId]),
    })
  }

  // BFS through connected maps
  while (queue.length > 0) {
    const { mapId, path, visited: visitedInPath } = queue.shift()!

    // Found the target map
    if (mapId === endMap.id) {
      return path
    }

    const currentNode = mapGraph[mapId]
    if (!currentNode) continue

    // Add all valid connections to queue
    for (const connection of currentNode.connections) {
      if (visitedInPath.has(connection.toMapId)) continue

      const nextNode = mapGraph[connection.toMapId]
      if (!nextNode) continue

      const newPath = [...path]
      newPath.push({
        currentMap: {
          id: currentNode.id,
          name: currentNode.name,
          streetName: currentNode.streetName
        },
        nextMap: {
          id: nextNode.id,
          name: nextNode.name,
          streetName: nextNode.streetName
        },
        portal: {
          portalName: connection.portalName,
          toName: '',
          type: 0,
          toMap: connection.toMapId,
          x: connection.x,
          y: connection.y,
          isStarForcePortal: false,
          linkToMap: '',
          toMapName: {
            id: nextNode.id,
            name: nextNode.name,
            streetName: nextNode.streetName
          }
        },
        direction: getDirection(
          { x: 0, y: 0 },
          { x: connection.x, y: connection.y }
        ),
      })

      queue.push({
        mapId: connection.toMapId,
        path: newPath,
        visited: new Set([...visitedInPath, connection.toMapId]),
      })
    }
  }

  throw new Error('No path found between the selected maps')
}
