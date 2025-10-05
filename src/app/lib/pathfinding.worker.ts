import type { MapGraph, MapInfo, PathStep, GraphConnection } from '../types/map'

interface WorkerRequest {
  type: 'findPath'
  startMap: MapInfo
  endMap: MapInfo
  mapGraph: MapGraph
}

interface WorkerResponse {
  type: 'success' | 'error' | 'timeout' | 'disconnected'
  path?: PathStep[]
  error?: string
}

// Constants for performance tuning
const MAX_SEARCH_TIME_MS = 10000 // 10 seconds max
const MAX_QUEUE_SIZE = 5000 // Assume disconnected if queue grows this large

function getDirection(fromPortal: { x: number; y: number }, toPortal: { x: number; y: number }): 'left' | 'right' | 'up' | 'down' | '' {
  const dx = toPortal.x - fromPortal.x
  const dy = toPortal.y - fromPortal.y

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
  parentIndex: number | null // Index in the parents array for path reconstruction
}

interface ParentNode {
  mapId: number
  parentIndex: number | null
  connection: GraphConnection | null
}

function findPathOptimized(
  startMap: MapInfo,
  endMap: MapInfo,
  mapGraph: MapGraph
): PathStep[] {
  const startTime = Date.now()

  const startNode = mapGraph[startMap.id]
  const endNode = mapGraph[endMap.id]

  if (!startNode) {
    throw new Error(`Start map ${startMap.name} (${startMap.id}) not found in graph`)
  }

  if (!endNode) {
    throw new Error(`End map ${endMap.name} (${endMap.id}) not found in graph`)
  }

  if (startMap.id === endMap.id) {
    return []
  }

  // Use a single global visited set instead of copying per queue item
  const visited = new Set<number>([startMap.id])

  // Parent tracking for path reconstruction
  const parents: ParentNode[] = []

  // Queue now only stores map ID and parent index
  const queue: QueueItem[] = []

  // Initialize queue with connections from start map
  for (const connection of startNode.connections) {
    if (visited.has(connection.toMapId)) continue

    visited.add(connection.toMapId)
    const parentIndex = parents.length
    parents.push({
      mapId: startMap.id,
      parentIndex: null,
      connection: connection
    })

    queue.push({
      mapId: connection.toMapId,
      parentIndex: parentIndex
    })
  }

  // BFS with timeout and early termination
  while (queue.length > 0) {
    // Timeout check
    if (Date.now() - startTime > MAX_SEARCH_TIME_MS) {
      throw new Error('Search timeout: Path search exceeded 10 seconds')
    }

    // Early termination - if queue is too large, maps are likely disconnected
    if (queue.length > MAX_QUEUE_SIZE) {
      throw new Error('Maps appear to be disconnected (explored over 5000 nodes)')
    }

    const { mapId, parentIndex } = queue.shift()!

    // Found the target!
    if (mapId === endMap.id) {
      // Reconstruct path from parent chain
      const path: PathStep[] = []
      let currentParentIndex: number | null = parentIndex

      while (currentParentIndex !== null) {
        const parent = parents[currentParentIndex]
        const connection = parent.connection!
        const currentMapNode = mapGraph[parent.mapId]
        const nextMapNode = mapGraph[connection.toMapId]

        path.unshift({
          currentMap: {
            id: currentMapNode.id,
            name: currentMapNode.name,
            streetName: currentMapNode.streetName
          },
          nextMap: {
            id: nextMapNode.id,
            name: nextMapNode.name,
            streetName: nextMapNode.streetName
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
              id: nextMapNode.id,
              name: nextMapNode.name,
              streetName: nextMapNode.streetName
            }
          },
          direction: getDirection(
            { x: 0, y: 0 },
            { x: connection.x, y: connection.y }
          )
        })

        currentParentIndex = parent.parentIndex
      }

      return path
    }

    // Explore connections
    const currentNode = mapGraph[mapId]
    if (!currentNode) continue

    for (const connection of currentNode.connections) {
      if (visited.has(connection.toMapId)) continue

      visited.add(connection.toMapId)
      const newParentIndex = parents.length
      parents.push({
        mapId: mapId,
        parentIndex: parentIndex,
        connection: connection
      })

      queue.push({
        mapId: connection.toMapId,
        parentIndex: newParentIndex
      })
    }
  }

  throw new Error('No path found between the selected maps')
}

// Worker message handler
self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { type, startMap, endMap, mapGraph } = event.data

  if (type === 'findPath') {
    try {
      const path = findPathOptimized(startMap, endMap, mapGraph)
      const response: WorkerResponse = {
        type: 'success',
        path
      }
      self.postMessage(response)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // Determine error type
      let responseType: WorkerResponse['type'] = 'error'
      if (errorMessage.includes('timeout')) {
        responseType = 'timeout'
      } else if (errorMessage.includes('disconnected')) {
        responseType = 'disconnected'
      }

      const response: WorkerResponse = {
        type: responseType,
        error: errorMessage
      }
      self.postMessage(response)
    }
  }
})

// Export empty object for TypeScript
export {}
