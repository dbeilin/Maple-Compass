import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MapSearch } from './components/map-search'
import { MapModal } from './components/map-modal'
import { Navbar } from './components/navbar'
import { Footer } from './components/footer'
import { findPath } from './lib/pathfinding'
import type { MapInfo, PathStep } from './types/map'
import { getMapImageUrl, getMapIconUrl } from './lib/api'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
})

function PathfinderApp() {
  const [sourceMap, setSourceMap] = useState<MapInfo | null>(null)
  const [targetMap, setTargetMap] = useState<MapInfo | null>(null)
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

  function handleSwapMaps() {
    setSourceMap(targetMap)
    setTargetMap(sourceMap)
    setPath(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col">
      <Navbar />
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-8">

          <div className="space-y-6">
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-4">
            <div className="space-y-2">
              <MapSearch
                label="Starting Map"
                onSelect={setSourceMap}
                placeholder="Where are you now?"
              />
              {sourceMap && (
                <div className="relative z-10 mt-2 rounded-lg bg-card p-3 text-sm shadow-md transition-shadow hover:shadow-lg border">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getMapIconUrl(sourceMap.id)}
                      alt=""
                      className="w-6 h-6 object-contain"
                    />
                    <div>
                      <div className="font-medium">{sourceMap.name}</div>
                      <div className="text-xs text-muted-foreground">{sourceMap.streetName}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleSwapMaps}
              disabled={!sourceMap && !targetMap}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
              title="Swap maps"
            >
              ⇄
            </button>

            <div className="space-y-2">
              <MapSearch
                label="Target Map"
                onSelect={setTargetMap}
                placeholder="Where do you want to go?"
              />
              {targetMap && (
                <div className="relative z-10 mt-2 rounded-lg bg-card p-3 text-sm shadow-md transition-shadow hover:shadow-lg border">
                  <div className="flex items-center gap-3">
                    <img 
                      src={getMapIconUrl(targetMap.id)}
                      alt=""
                      className="w-6 h-6 object-contain"
                    />
                    <div>
                      <div className="font-medium">{targetMap.name}</div>
                      <div className="text-xs text-muted-foreground">{targetMap.streetName}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            onClick={handleFindPath}
            disabled={!sourceMap || !targetMap || isLoading}
          >
            {isLoading ? 'Finding path...' : 'Find Path'}
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {path && (
          <div className="space-y-4 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">Navigation Steps</h2>
            <div className="space-y-4">
              {path.map((step, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-md border bg-card"
                >
                  <div className="space-y-2 p-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={getMapIconUrl(step.currentMap.id)}
                        alt=""
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <h3 className="font-medium">{step.currentMap.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {step.currentMap.streetName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="font-medium text-primary">
                        {step.direction}
                      </span>
                      <span className="text-sm text-muted-foreground">→</span>
                      <div className="flex items-center gap-2">
                        <img 
                          src={getMapIconUrl(step.nextMap.id)}
                          alt=""
                          className="w-6 h-6 object-contain"
                        />
                        <span className="text-sm">{step.nextMap.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-48 w-full border-t flex items-center justify-center">
                    <MapModal
                      imageUrl={getMapImageUrl(step.currentMap.id)}
                      mapName={step.currentMap.name}
                      className="max-h-48 w-full"
                    />
                  </div>
                </div>
              ))}
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
