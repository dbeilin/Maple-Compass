export interface PortalExtension {
  fromMapId: number
  connections: Array<{
    toMapId: number
    portalName: string
    x: number
    y: number
  }>
}

export interface PortalExtensions {
  [mapId: number]: PortalExtension
}
