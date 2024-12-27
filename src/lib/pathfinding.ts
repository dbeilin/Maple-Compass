import type { MapGraph, MapInfo, PathStep } from '../types/map'
import type { PortalExtensionsConfig, PortalConnection } from '../types/portal-extensions'

let mapGraph: MapGraph | null = null
let portalExtensions: PortalExtensionsConfig | null = null

function mergePortalExtensions(graph: MapGraph, config: PortalExtensionsConfig): MapGraph {
  const mergedGraph = { ...graph }
  
  Object.entries(config).forEach(([mapId, extension]) => {
    const numericMapId = parseInt(mapId)
    if (!mergedGraph[numericMapId]) {
      mergedGraph[numericMapId] = {
        id: numericMapId,
        name: extension.name,
        streetName: '',
        connections: []
      }
    }

    extension.connections.forEach((conn: PortalConnection) => {
      // Add intermediate maps if they exist
      if (conn.via) {
        let previousMapId = numericMapId
        
        // Create nodes and connections for each intermediate map
        conn.via.forEach((viaMap: { mapId: number; name: string; portalName: string; x: number; y: number }) => {
          if (!mergedGraph[viaMap.mapId]) {
            mergedGraph[viaMap.mapId] = {
              id: viaMap.mapId,
              name: viaMap.name,
              streetName: '',
              connections: []
            }
          }

          // Connect previous map to this intermediate
          if (!mergedGraph[previousMapId].connections.some(c => c.toMapId === viaMap.mapId)) {
            mergedGraph[previousMapId].connections.push({
              toMapId: viaMap.mapId,
              portalName: viaMap.portalName,
              x: viaMap.x,
              y: viaMap.y
            })
          }

          // If bidirectional, add reverse connection
          if (conn.bidirectional && !mergedGraph[viaMap.mapId].connections.some(c => c.toMapId === previousMapId)) {
            mergedGraph[viaMap.mapId].connections.push({
              toMapId: previousMapId,
              portalName: viaMap.portalName,
              x: viaMap.x,
              y: viaMap.y
            })
          }

          previousMapId = viaMap.mapId
        })

        // Connect last intermediate to destination
        if (!mergedGraph[previousMapId].connections.some(c => c.toMapId === conn.toMapId)) {
          mergedGraph[previousMapId].connections.push({
            toMapId: conn.toMapId,
            portalName: conn.portalName,
            x: conn.x,
            y: conn.y
          })
        }

        // If bidirectional, add reverse connection from destination to last intermediate
        if (conn.bidirectional) {
          if (!mergedGraph[conn.toMapId]) {
            mergedGraph[conn.toMapId] = {
              id: conn.toMapId,
              name: conn.toName,
              streetName: '',
              connections: []
            }
          }

          if (!mergedGraph[conn.toMapId].connections.some(c => c.toMapId === previousMapId)) {
            mergedGraph[conn.toMapId].connections.push({
              toMapId: previousMapId,
              portalName: conn.portalName,
              x: conn.x,
              y: conn.y
            })
          }
        }
      } else {
        // Direct connection without intermediates
        if (!mergedGraph[numericMapId].connections.some(c => c.toMapId === conn.toMapId)) {
          mergedGraph[numericMapId].connections.push({
            toMapId: conn.toMapId,
            portalName: conn.portalName,
            x: conn.x,
            y: conn.y
          })
        }

        // Add reverse connection if bidirectional
        if (conn.bidirectional) {
          if (!mergedGraph[conn.toMapId]) {
            mergedGraph[conn.toMapId] = {
              id: conn.toMapId,
              name: conn.toName,
              streetName: '',
              connections: []
            }
          }

          if (!mergedGraph[conn.toMapId].connections.some(c => c.toMapId === numericMapId)) {
            mergedGraph[conn.toMapId].connections.push({
              toMapId: numericMapId,
              portalName: conn.portalName,
              x: conn.x,
              y: conn.y
            })
          }
        }
      }
    })
  })
  
  return mergedGraph
}

export async function initializePathfinding() {
  if (!mapGraph) {
    try {
      console.log('Loading map data...')
      const [graphResponse, extensionsResponse] = await Promise.all([
        fetch('/map-graph.json'),
        fetch('/portal-extensions.json')
      ])

      if (!graphResponse.ok) {
        throw new Error(`Failed to load map graph data: ${graphResponse.status} ${graphResponse.statusText}`)
      }

      if (!extensionsResponse.ok) {
        throw new Error(`Failed to load portal extensions: ${extensionsResponse.status} ${extensionsResponse.statusText}`)
      }

      const baseGraph = await graphResponse.json()
      const config = await extensionsResponse.json() as PortalExtensionsConfig
      portalExtensions = config
      
      // Merge the extensions with the base graph
      mapGraph = mergePortalExtensions(baseGraph, config)
      
      const nodeCount = mapGraph ? Object.keys(mapGraph).length : 0
      const extensionCount = portalExtensions ? Object.keys(portalExtensions).length : 0
      console.log(`Loaded map graph with ${nodeCount} nodes and ${extensionCount} extensions`)
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
