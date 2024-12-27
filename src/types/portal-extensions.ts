export interface PortalExtension {
  fromMapId: number
  name: string
  connections: Array<{
    toMapId: number
    toName: string
    portalName: string
    x: number
    y: number
  }>
}

export interface PortalExtensions {
  [mapId: number]: PortalExtension
}
