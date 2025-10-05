'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MapSearch } from './components/MapSearch'
import { PathResults } from './components/PathResults'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapInfo, PathStep, MapGraph } from './types/map'
import { initializePathfinding } from './lib/pathfinding'
import { usePathfindingWorker } from './hooks/usePathfindingWorker'
import { Loader2, ArrowLeftRight, X } from 'lucide-react'

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [maps, setMaps] = useState<MapInfo[]>([])
  const [mapGraph, setMapGraph] = useState<MapGraph | null>(null)
  const [startMap, setStartMap] = useState<MapInfo | null>(null)
  const [endMap, setEndMap] = useState<MapInfo | null>(null)
  const [path, setPath] = useState<PathStep[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchDuration, setSearchDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  const { findPath, cancelSearch } = usePathfindingWorker()

  useEffect(() => {
    async function init() {
      try {
        const graph = await initializePathfinding()
        setMapGraph(graph)

        // Convert map graph to array of MapInfo
        const mapList: MapInfo[] = Object.values(graph || {}).map((node) => ({
          id: node.id,
          name: node.name,
          streetName: node.streetName,
        }))

        // Filter out maps without names and sort
        const namedMaps = mapList
          .filter((map) => map.name && map.name.trim() !== '')
          .sort((a, b) => a.name.localeCompare(b.name))

        setMaps(namedMaps)
        setInitialized(true)

        // Read URL parameters and set maps if present
        const startId = searchParams.get('start')
        const endId = searchParams.get('end')

        if (startId) {
          const start = namedMaps.find(m => m.id === parseInt(startId))
          if (start) setStartMap(start)
        }

        if (endId) {
          const end = namedMaps.find(m => m.id === parseInt(endId))
          if (end) setEndMap(end)
        }
      } catch (err) {
        setError('Failed to load map data')
        console.error(err)
      }
    }

    init()
  }, [searchParams])

  // Update URL with current map selections
  const updateUrl = (start: MapInfo | null, end: MapInfo | null) => {
    const params = new URLSearchParams()
    if (start) params.set('start', start.id.toString())
    if (end) params.set('end', end.id.toString())

    const newUrl = params.toString() ? `?${params.toString()}` : '/'
    router.push(newUrl, { scroll: false })
  }

  const handleStartMapChange = (map: MapInfo | null) => {
    setStartMap(map)
    updateUrl(map, endMap)
  }

  const handleEndMapChange = (map: MapInfo | null) => {
    setEndMap(map)
    updateUrl(startMap, map)
  }

  const handleFindPath = async () => {
    if (!startMap || !endMap || !mapGraph) {
      setError('Please select both start and end maps')
      return
    }

    setLoading(true)
    setError(null)
    setPath(null)
    setSearchDuration(0)

    const startTime = Date.now()

    try {
      const result = await findPath(startMap, endMap, mapGraph)
      setPath(result)
      setSearchDuration(Date.now() - startTime)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find path')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSearch = () => {
    cancelSearch()
    setLoading(false)
    setError('Search cancelled')
  }

  const handleSwapMaps = () => {
    const temp = startMap
    setStartMap(endMap)
    setEndMap(temp)
    updateUrl(endMap, temp)
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading map data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Path Finding</CardTitle>
            <CardDescription>
              Select your starting map and destination map.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row items-end gap-2">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block">Starting Map</label>
                <MapSearch
                  maps={maps}
                  value={startMap}
                  onSelect={handleStartMapChange}
                  placeholder="Select starting map..."
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handleSwapMaps}
                disabled={!startMap && !endMap}
                className="mb-0 md:mb-0 shrink-0"
                title="Swap maps"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block">Destination Map</label>
                <MapSearch
                  maps={maps}
                  value={endMap}
                  onSelect={handleEndMapChange}
                  placeholder="Select destination map..."
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Button
                  onClick={handleCancelSearch}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel Search
                </Button>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching for path... This may take a moment for distant maps.</span>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleFindPath}
                disabled={!startMap || !endMap}
                className="w-full"
                size="lg"
              >
                Find Path
              </Button>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}

            {searchDuration > 0 && path !== null && (
              <div className="text-xs text-muted-foreground text-center">
                Path found in {searchDuration}ms
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {path !== null && <PathResults path={path} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
