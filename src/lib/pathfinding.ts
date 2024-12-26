import type { MapInfo, PathStep } from '../types/map'
import { getMapDetails } from './api'

interface QueueItem {
  mapId: number
  path: PathStep[]
  visited: Set<number>
}

function getDirection(fromPortal: { x: number; y: number }, toPortal: { x: number; y: number }): string {
  const dx = toPortal.x - fromPortal.x
  const dy = toPortal.y - fromPortal.y

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left'
  }
  return dy > 0 ? 'down' : 'up'
}

export async function findPath(
  startMap: MapInfo,
  endMap: MapInfo
): Promise<PathStep[]> {
  const queue: QueueItem[] = []
  
  // Get initial map details
  const startMapDetails = await getMapDetails(startMap.id)
  
  // Initialize queue with valid portals from start map
  for (const portal of startMapDetails.portals) {
    if (!portal.toMapName || portal.portalName === 'sp' || portal.portalName === 'tp') {
      continue
    }

    queue.push({
      mapId: portal.toMap,
      path: [
        {
          currentMap: startMap,
          nextMap: portal.toMapName,
          portal,
          direction: getDirection(
            { x: 0, y: 0 }, // Assuming starting position
            { x: portal.x, y: portal.y }
          ),
        },
      ],
      visited: new Set([startMap.id, portal.toMap]),
    })
  }

  // BFS through connected maps
  while (queue.length > 0) {
    const { mapId, path, visited: visitedInPath } = queue.shift()!

    // Found the target map
    if (mapId === endMap.id) {
      return path
    }

    try {
      const mapDetails = await getMapDetails(mapId)

      // Add all valid portals to queue
      for (const portal of (mapDetails.portals || [])) {
        // Skip invalid portals
        if (!portal) continue;
        
        // Skip special portals and already visited maps
        if (
          !portal.toMapName ||
          !portal.toMap ||
          portal.portalName === 'sp' ||
          portal.portalName === 'tp' ||
          visitedInPath.has(portal.toMap)
        ) {
          continue
        }

        const newPath = [...path]
        newPath.push({
          currentMap: path[path.length - 1].nextMap,
          nextMap: portal.toMapName,
          portal,
          direction: getDirection(
            { x: 0, y: 0 }, // Using center as reference
            { x: portal.x, y: portal.y }
          ),
        })

        queue.push({
          mapId: portal.toMap,
          path: newPath,
          visited: new Set([...visitedInPath, portal.toMap]),
        })
      }
    } catch (error) {
      console.error(`Failed to get details for map ${mapId}:`, error)
      continue
    }
  }

  throw new Error('No path found between the selected maps')
}
