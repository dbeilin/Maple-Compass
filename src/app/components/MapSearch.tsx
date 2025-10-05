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

interface MapSearchProps {
  maps: MapInfo[]
  value: MapInfo | null
  onSelect: (map: MapInfo | null) => void
  placeholder?: string
}

export function MapSearch({ maps, value, onSelect, placeholder = 'Type to search maps...' }: MapSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Initialize Fuse.js for fuzzy search
  const fuse = React.useMemo(() => {
    return new Fuse(maps, {
      keys: [
        { name: 'name', weight: 2 }, // Prioritize map name
        { name: 'streetName', weight: 1 },
      ],
      threshold: 0.3, // Balance between strict and fuzzy
      ignoreLocation: true,
      useExtendedSearch: false,
    })
  }, [maps])

  // Filter maps using Fuse.js
  const filteredMaps = React.useMemo(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      return maps.slice(0, 50) // Show first 50 maps when no search
    }

    const results = fuse.search(searchQuery)
    return results.slice(0, 50).map((result) => result.item) // Limit to top 50 results
  }, [searchQuery, fuse, maps])

  // Display value in input
  const displayValue = React.useMemo(() => {
    if (searchQuery) {
      return searchQuery
    }
    if (value) {
      return `${value.name}${value.streetName ? ` (${value.streetName})` : ''}`
    }
    return ''
  }, [value, searchQuery])

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    // Only open dropdown if there's text
    if (query.trim()) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    // Only open dropdown on focus if there's text
    if (searchQuery.trim()) {
      setOpen(true)
    }
  }

  // Handle clear
  const handleClear = () => {
    setSearchQuery('')
    onSelect(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  // Handle map selection
  const handleSelect = (map: MapInfo) => {
    onSelect(map)
    setSearchQuery('')
    setOpen(false)
  }

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        const dropdown = document.getElementById('map-search-dropdown')
        if (dropdown && !dropdown.contains(event.target as Node)) {
          setOpen(false)
        }
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

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
