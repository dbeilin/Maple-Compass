import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { getAllMaps } from '../lib/api'
import type { MapInfo } from '../types/map'
import { cn } from '../lib/utils'

interface MapSearchProps {
  onSelect: (map: MapInfo) => void
  label: string
  placeholder?: string
  className?: string
}

export function MapSearch({
  onSelect,
  label,
  placeholder = 'Search for a map...',
  className,
}: MapSearchProps) {
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const { data: maps, isLoading, isError } = useQuery({
    queryKey: ['maps'],
    queryFn: getAllMaps,
    staleTime: Infinity, // Cache the maps list permanently
    retry: 3,
  })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredMaps = maps?.filter((map) => {
    if (!search.trim()) return false
    if (!map?.name || !map?.streetName) return false

    const searchTerms = search.toLowerCase().split(' ')
    const mapName = map.name.toLowerCase()
    const streetName = map.streetName.toLowerCase()

    return searchTerms.every(term =>
      mapName.includes(term) || streetName.includes(term)
    )
  }) || []

  // Virtual scrolling setup
  const virtualizer = useVirtualizer({
    count: filteredMaps.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 60, // Estimated height of each item (adjust based on your design)
    overscan: 5, // Render 5 extra items above/below visible area
    enabled: filteredMaps.length > 0, // Only enable when there are results
  })

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <label className="block text-sm font-medium mb-2 text-foreground">
        {label}
      </label>
      <input
        type="text"
        className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full rounded-md border bg-popover/100 text-popover-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-popover/80">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading maps...</div>
          ) : isError ? (
            <div className="p-2 text-sm text-destructive">Failed to load maps</div>
          ) : filteredMaps.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              {search.trim() ? 'No maps found' : 'Start typing to search maps'}
            </div>
          ) : (
            <>
              <div className="px-3 py-2 text-xs text-muted-foreground border-b bg-muted/30">
                {filteredMaps.length} {filteredMaps.length === 1 ? 'result' : 'results'} found
              </div>
              <div
                ref={scrollContainerRef}
                className="max-h-60 overflow-auto py-1"
              >
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const map = filteredMaps[virtualItem.index]
                  if (!map) return null

                  return (
                    <button
                      key={map.id}
                      className="absolute left-0 top-0 w-full cursor-pointer select-none px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                      style={{
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      onClick={() => {
                        onSelect(map)
                        setSearch('')
                        setIsOpen(false)
                      }}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-foreground">{map.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {map.streetName}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
