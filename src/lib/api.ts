import axios from 'axios'
import type { MapDetails, MapInfo, WorldMapInfo } from '../types/map'

const api = axios.create({
  baseURL: 'https://maplestory.io/api/GMS/83',
})

export async function getAllMaps(): Promise<MapInfo[]> {
  const response = await api.get('/map')
  
  // Validate the response data
  if (!Array.isArray(response.data)) {
    throw new Error('Invalid API response: expected an array')
  }

  // Filter and validate each map object
  const validMaps = response.data.filter((map): map is MapInfo => {
    return (
      typeof map === 'object' &&
      map !== null &&
      typeof map.name === 'string' &&
      typeof map.streetName === 'string' &&
      typeof map.id === 'number'
    )
  })

  return validMaps
}

export async function getMapDetails(mapId: number): Promise<MapDetails> {
  const response = await api.get(`/map/${mapId}`)
  return response.data
}

export async function getMapName(mapId: number): Promise<string> {
  const response = await api.get(`/map/${mapId}/name`)
  return response.data
}

export async function getWorldMaps(): Promise<string[]> {
  const response = await api.get('/map/worldmap')
  return response.data
}

export async function getWorldMapDetails(mapId: string): Promise<WorldMapInfo> {
  const response = await api.get(`/map/worldmap/${mapId}`)
  return response.data
}

export function getMapImageUrl(mapId: number): string {
  return `${api.defaults.baseURL}/map/${mapId}/render`
}

export function getMinimapUrl(mapId: number): string {
  return `${api.defaults.baseURL}/map/${mapId}/minimap`
}

export function getMapIconUrl(mapId: number): string {
  return `${api.defaults.baseURL}/map/${mapId}/icon`
}
