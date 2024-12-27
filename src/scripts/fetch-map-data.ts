import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { getAllMaps, getMapDetails } from '../lib/api'
import type { MapNode } from '../types/map'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const publicDir = resolve(__dirname, '../../public')

async function buildNavigationGraph() {
  console.log('Fetching all maps...')
  const maps = await getAllMaps()
  const graph: Record<number, MapNode> = {}
  
  console.log(`Processing ${maps.length} maps...`)
  let processed = 0

  for (const map of maps) {
    try {
      const details = await getMapDetails(map.id)
      graph[map.id] = {
        id: map.id,
        name: map.name,
        streetName: map.streetName,
        connections: details.portals
          .filter(p => p.toMapName && !['sp', 'tp'].includes(p.portalName))
          .map(p => ({
            toMapId: p.toMap,
            portalName: p.portalName,
            x: p.x,
            y: p.y
          }))
      }
      
      processed++
      if (processed % 10 === 0) {
        console.log(`Processed ${processed}/${maps.length} maps`)
      }
    } catch (error) {
      console.error(`Failed to process map ${map.id}:`, error)
    }
  }

  console.log('Writing graph to file...')
  await writeFile(resolve(publicDir, 'map-graph.json'), JSON.stringify(graph, null, 2))
  console.log('Done! Graph saved to public/map-graph.json')
}

buildNavigationGraph().catch(error => {
  console.error('Failed to generate map graph:', error)
  process.exit(1)
})

export { buildNavigationGraph }
