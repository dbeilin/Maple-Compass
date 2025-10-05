export interface MapInfo {
  id: number
  name: string
  streetName: string
}

// Connection info from the graph (minimal)
export interface GraphConnection {
  toMapId: number
  portalName: string
  x: number
  y: number
}

// Full portal info used in PathStep (for display)
export interface PortalInfo {
  portalName: string
  toName?: string
  type?: number
  toMap?: number
  x: number
  y: number
  isStarForcePortal?: boolean
  linkToMap?: string
  toMapName?: MapInfo
}

export interface MapNode {
  id: number
  name: string
  streetName: string
  connections: GraphConnection[]
}

export interface MapGraph {
  [mapId: string]: MapNode
}

export interface PathStep {
  currentMap: MapInfo
  nextMap: MapInfo
  portal: PortalInfo
  direction: 'left' | 'right' | 'up' | 'down' | ''
}

// Utility function to generate map image URL
export function getMapImageUrl(mapId: number): string {
  return `https://maplestory.io/api/GMS/83/map/${mapId}/render`
}

// Utility function to generate map icon URL
export function getMapIconUrl(mapId: number): string {
  return `https://maplestory.io/api/GMS/83/map/${mapId}/icon`
}
