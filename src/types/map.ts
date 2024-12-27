export interface MapInfo {
  name: string
  streetName: string
  id: number
}

export interface Portal {
  portalName: string
  toName: string
  type: number
  toMap: number
  x: number
  y: number
  isStarForcePortal: boolean
  linkToMap: string
  toMapName: MapInfo
}

export interface MapDetails {
  backgroundMusic: string
  isReturnMap: boolean
  returnMap: number
  portals: Portal[]
  mobRate: number
  isTown: boolean
  isSwim: boolean
  mapMark: string
  miniMap: {
    centerX: number
    centerY: number
    height: number
    width: number
    magnification: number
  }
}

export interface WorldMapSpot {
  spot: {
    value: {
      x: number
      y: number
    }
  }
  type: number
  mapNumbers: number[]
}

export interface WorldMapInfo {
  parentWorld: string
  baseImage: Array<{
    image: string
    origin: {
      value: {
        x: number
        y: number
      }
    }
  }>
  maps: WorldMapSpot[]
}

export interface PathStep {
  currentMap: MapInfo
  nextMap: MapInfo
  portal: Portal
  direction: string
}

// Optimized types for graph-based pathfinding
export interface MapNode {
  id: number
  name: string
  streetName: string
  connections: Array<{
    toMapId: number
    portalName: string
    x: number
    y: number
  }>
}

export interface MapGraph {
  [mapId: number]: MapNode
}
