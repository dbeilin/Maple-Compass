export interface ViaMap {
  mapId: number
  name: string
  portalName: string
  x: number
  y: number
}

export interface PortalConnection {
  toMapId: number
  toName: string
  portalName: string
  x: number
  y: number
  via?: ViaMap[]
}

export interface PortalExtension {
  fromMapId: number
  name: string
  connections: PortalConnection[]
}

export interface PortalExtensionsConfig {
  [mapId: number]: PortalExtension
}
