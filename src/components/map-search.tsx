import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
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
  }).slice(0, 10) // Limit to 10 results for better performance

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <input
        type="text"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
      />
      {isOpen && (
        <div className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover/100 text-popover-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-popover/80">
          {isLoading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading maps...</div>
          ) : isError ? (
            <div className="p-2 text-sm text-destructive">Failed to load maps</div>
          ) : filteredMaps?.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">
              {search.trim() ? 'No maps found' : 'Start typing to search maps'}
            </div>
          ) : (
            <div className="py-1">
              {filteredMaps?.map((map) => (
                <button
                  key={map.id}
                  className="relative w-full cursor-default select-none px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => {
                    onSelect(map)
                    setSearch('')
                    setIsOpen(false)
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{map.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {map.streetName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
