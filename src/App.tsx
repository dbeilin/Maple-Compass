import { useState, useEffect } from 'react'
import { useQueryState, parseAsInteger } from 'nuqs'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { MapSearch } from './components/map-search'
import { MapModal } from './components/map-modal'
import { Navbar } from './components/navbar-new'
import { Footer } from './components/footer'
import { EmptyState } from './components/empty-state'
import { LoadingSpinner } from './components/loading-spinner'
import { PathSummary } from './components/path-summary'
import { findPath } from './lib/pathfinding'
import type { MapInfo, PathStep } from './types/map'
import { getMapImageUrl, getMapIconUrl, getAllMaps } from './lib/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

function PathfinderApp() {
  const [sourceMapId, setSourceMapIdRaw] = useQueryState(
    'from',
    parseAsInteger.withDefault(-1)
  )
  
  const [targetMapId, setTargetMapIdRaw] = useQueryState(
    'to',
    parseAsInteger.withDefault(-1)
  )

  const setSourceMapId = (value: number | null) => 
    setSourceMapIdRaw(value === null ? -1 : value)
  
  const setTargetMapId = (value: number | null) => 
    setTargetMapIdRaw(value === null ? -1 : value)

  const effectiveSourceMapId = sourceMapId === -1 ? null : sourceMapId
  const effectiveTargetMapId = targetMapId === -1 ? null : targetMapId

  const [sourceMap, setSourceMap] = useState<MapInfo | null>(null)
  const [targetMap, setTargetMap] = useState<MapInfo | null>(null)

  // Fetch all maps once and cache them
  const { data: maps } = useQuery({
    queryKey: ['maps'],
    queryFn: getAllMaps,
    staleTime: Infinity // Cache the maps permanently
  })

  // Update maps when IDs change or when maps data is loaded
  useEffect(() => {
    if (maps) {
      if (effectiveSourceMapId !== null) {
        const map = maps.find((m: MapInfo) => m.id === effectiveSourceMapId)
        if (map) setSourceMap(map)
      } else {
        setSourceMap(null)
      }

      if (effectiveTargetMapId !== null) {
        const map = maps.find((m: MapInfo) => m.id === effectiveTargetMapId)
        if (map) setTargetMap(map)
      } else {
        setTargetMap(null)
      }
    }
  }, [sourceMapId, targetMapId, maps])
  const [path, setPath] = useState<PathStep[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleFindPath() {
    if (!sourceMap || !targetMap) {
      setError('Please select both source and target maps')
      return
    }

    setIsLoading(true)
    setError(null)
    setPath(null)

    try {
      const pathSteps = await findPath(sourceMap, targetMap)
      setPath(pathSteps)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find path')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSwapMaps() {
    const tempSourceId = effectiveSourceMapId
    await Promise.all([
      setSourceMapId(effectiveTargetMapId),
      setTargetMapId(tempSourceId)
    ])
    setPath(null)
    setError(null)
  }

  function handleClearPath() {
    setPath(null)
    setError(null)
  }

  function handleCopyPath() {
    if (!path) return

    const pathText = path.map((step, index) =>
      `${index + 1}. ${step.currentMap.name} → ${step.direction} → ${step.nextMap.name}`
    ).join('\n')

    navigator.clipboard.writeText(pathText).then(() => {
      // Could add a toast notification here
      console.log('Path copied to clipboard!')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Map Selection Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-start gap-4 md:gap-6">
              {/* Source Map */}
              <div className="space-y-3">
                <MapSearch
                  label="Starting Map"
                  onSelect={(map) => setSourceMapId(map.id)}
                  placeholder="Where are you now?"
                />
                {sourceMap && (
                  <div className="rounded-lg bg-gradient-to-br from-card to-card/50 p-4 shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <img
                          src={getMapIconUrl(sourceMap.id)}
                          alt=""
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{sourceMap.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{sourceMap.streetName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwapMaps}
                disabled={!sourceMap && !targetMap}
                className="inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mt-8 md:mt-6 mx-auto"
                title="Swap maps"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              {/* Target Map */}
              <div className="space-y-3">
                <MapSearch
                  label="Target Map"
                  onSelect={(map) => setTargetMapId(map.id)}
                  placeholder="Where do you want to go?"
                />
                {targetMap && (
                  <div className="rounded-lg bg-gradient-to-br from-card to-card/50 p-4 shadow-lg border-2 border-secondary/20 hover:border-secondary/40 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <img
                          src={getMapIconUrl(targetMap.id)}
                          alt=""
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground truncate">{targetMap.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{targetMap.streetName}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Find Path Button */}
            <button
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary/80 px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:shadow-xl hover:from-primary/90 hover:to-primary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={handleFindPath}
              disabled={!sourceMap || !targetMap || isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding path...
                </span>
              ) : 'Find Path'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border-2 border-destructive/30 p-4 text-sm text-destructive flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <div className="font-semibold mb-1">Path not found</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LoadingSpinner />}

          {/* Empty State */}
          {!sourceMap && !targetMap && !path && !isLoading && <EmptyState />}

          {/* Path Results */}
          {path && sourceMap && targetMap && (
            <div className="space-y-6">
              <PathSummary
                path={path}
                sourceMap={sourceMap}
                targetMap={targetMap}
                onClear={handleClearPath}
                onCopyPath={handleCopyPath}
              />

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Navigation Steps
                </h2>

                <div className="space-y-4">
                  {path.map((step, index) => (
                    <div
                      key={index}
                      className="overflow-hidden rounded-lg border-2 border-border bg-card shadow-md hover:shadow-lg transition-shadow"
                    >
                      <div className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Step Number */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md">
                            {index + 1}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <img
                                src={getMapIconUrl(step.currentMap.id)}
                                alt=""
                                className="w-8 h-8 object-contain"
                              />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground truncate">{step.currentMap.name}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                  {step.currentMap.streetName}
                                </p>
                              </div>
                            </div>

                            {/* Direction Arrow */}
                            <div className="flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20">
                              <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              <span className="font-semibold text-primary text-sm">
                                {step.direction}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <img
                                  src={getMapIconUrl(step.nextMap.id)}
                                  alt=""
                                  className="w-6 h-6 object-contain flex-shrink-0"
                                />
                                <span className="text-sm font-medium truncate">{step.nextMap.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Map Preview */}
                      <div className="relative h-56 w-full border-t-2 border-border flex items-center justify-center bg-muted/20">
                        <MapModal
                          imageUrl={getMapImageUrl(step.currentMap.id)}
                          mapName={step.currentMap.name}
                          className="max-h-56 w-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PathfinderApp />
    </QueryClientProvider>
  )
}
