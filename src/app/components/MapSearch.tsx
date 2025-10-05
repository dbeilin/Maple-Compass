'use client'

import * as React from 'react'
import { Check, X } from 'lucide-react'
import Fuse from 'fuse.js'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { MapInfo, getMapIconUrl } from '../types/map'
import { useDebounce } from '../hooks/useDebounce'

interface MapSearchProps {
  maps: MapInfo[]
  value: MapInfo | null
  onSelect: (map: MapInfo | null) => void
  placeholder?: string
}

export function MapSearch({ maps, value, onSelect, placeholder = 'Type to search maps...' }: MapSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isEditing, setIsEditing] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 150)

  const fuse = React.useMemo(() => {
    return new Fuse(maps, {
      keys: [
        { name: 'name', weight: 2 },
        { name: 'streetName', weight: 1 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
      useExtendedSearch: false,
      minMatchCharLength: 2,
      findAllMatches: false,
      distance: 100,
      shouldSort: true,
    })
  }, [maps])

  const filteredMaps = React.useMemo(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      return maps.slice(0, 50)
    }

    const results = fuse.search(debouncedSearchQuery, { limit: 50 })
    return results.map((result) => result.item)
  }, [debouncedSearchQuery, fuse])

  const displayValue = React.useMemo(() => {
    if (isEditing || searchQuery) {
      return searchQuery
    }
    if (value) {
      return value.name
    }
    return ''
  }, [value, searchQuery, isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    setIsEditing(true)

    if (value) {
      onSelect(null)
    }

    if (query.trim()) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    if (value && !searchQuery) {
      setSearchQuery(value.name)
    }
    if (searchQuery.trim() || value) {
      setOpen(true)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    onSelect(null)
    setIsEditing(false)
    setOpen(false)
    inputRef.current?.focus()
  }

  const handleSelect = (map: MapInfo) => {
    onSelect(map)
    setSearchQuery('')
    setIsEditing(false)
    setOpen(false)
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!open) return

      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        const dropdown = document.getElementById('map-search-dropdown')
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpen(false)
          setIsEditing(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        className="pr-8"
      />
      {(value || searchQuery) && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {open && (
        <div
          id="map-search-dropdown"
          className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md"
        >
          <Command shouldFilter={false}>
            <CommandList>
              <CommandEmpty>No map found.</CommandEmpty>
              <CommandGroup>
                {filteredMaps.map((map) => (
                  <CommandItem
                    key={map.id}
                    value={map.id.toString()}
                    onSelect={() => handleSelect(map)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMapIconUrl(map.id)}
                      alt=""
                      className="mr-2 h-6 w-6 shrink-0 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value?.id === map.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{map.name || `Map ${map.id}`}</span>
                      {map.streetName && (
                        <span className="text-xs text-muted-foreground">{map.streetName}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  )
}
