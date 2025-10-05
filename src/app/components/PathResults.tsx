'use client'

import { PathStep, getMapImageUrl, getMapIconUrl } from '../types/map'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useCallback, useEffect, useState } from 'react'
import { PathTimeline } from './PathTimeline'

interface PathResultsProps {
  path: PathStep[]
}

const DirectionIcon = ({ direction }: { direction: string }) => {
  const iconClass = 'h-5 w-5 text-blue-600'

  switch (direction) {
    case 'right':
      return <ArrowRight className={iconClass} />
    case 'left':
      return <ArrowLeft className={iconClass} />
    case 'up':
      return <ArrowUp className={iconClass} />
    case 'down':
      return <ArrowDown className={iconClass} />
    default:
      return null
  }
}

export function PathResults({ path }: PathResultsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start', skipSnaps: true }, [WheelGesturesPlugin({ forceWheelAxis: 'y' })])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Update selected index when carousel scrolls
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Keyboard navigation
  useEffect(() => {
    if (!emblaApi) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        emblaApi.scrollPrev()
      } else if (e.key === 'ArrowRight') {
        emblaApi.scrollNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [emblaApi])

  // Navigate to specific step
  const handleStepClick = useCallback((index: number) => {
    if (!emblaApi) return
    emblaApi.scrollTo(index)
  }, [emblaApi])

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  if (path.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            You are already at your destination!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-2xl font-semibold">Path Found - {path.length} steps</h2>

      {/* Timeline */}
      <PathTimeline
        steps={path.map(step => ({
          id: step.nextMap.id,
          name: step.nextMap.name
        }))}
        selectedIndex={selectedIndex}
        onStepClick={handleStepClick}
      />

      {/* Carousel */}
      <div className="relative">
        <div className="overflow-hidden select-none" ref={emblaRef}>
          <div className="flex">
            {path.map((step, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 px-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Step header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 font-semibold">
                            {index + 1}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Step {index + 1} of {path.length}
                          </span>
                        </div>
                      </div>

                      {/* Map transition info */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getMapIconUrl(step.currentMap.id)}
                          alt=""
                          className="h-5 w-5 shrink-0 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span className="font-medium">
                          {step.currentMap.name || `Map ${step.currentMap.id}`}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getMapIconUrl(step.nextMap.id)}
                          alt=""
                          className="h-5 w-5 shrink-0 object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span className="font-medium">
                          {step.nextMap.name || `Map ${step.nextMap.id}`}
                        </span>
                        {step.currentMap.streetName && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs rounded-full">
                            {step.currentMap.streetName}
                          </span>
                        )}
                      </div>

                      {/* Direction */}
                      {step.direction && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DirectionIcon direction={step.direction} />
                          <span className="capitalize">{step.direction}</span>
                        </div>
                      )}

                      {/* Map Image with Zoom - Variable height */}
                      <div className="min-h-[300px] max-h-[600px] bg-muted/20 rounded border flex items-center justify-center overflow-hidden">
                        <Zoom>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={getMapImageUrl(step.currentMap.id)}
                            alt={step.currentMap.name || `Map ${step.currentMap.id}`}
                            className="max-h-[600px] max-w-full w-auto h-auto object-contain"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </Zoom>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        {selectedIndex > 0 && (
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-orange-500 shadow-lg flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors z-10"
            aria-label="Previous step"
          >
            <ChevronLeft className="h-6 w-6 text-orange-600" />
          </button>
        )}
        {selectedIndex < path.length - 1 && (
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-orange-500 shadow-lg flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors z-10"
            aria-label="Next step"
          >
            <ChevronRight className="h-6 w-6 text-orange-600" />
          </button>
        )}
      </div>

      {/* Final destination */}
      <Card className="bg-orange-50/30 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 font-semibold">
              ✓
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMapIconUrl(path[path.length - 1].nextMap.id)}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
                <span className="font-medium text-foreground">
                  Arrived at: {path[path.length - 1].nextMap.name || `Map ${path[path.length - 1].nextMap.id}`}
                </span>
                {path[path.length - 1].nextMap.streetName && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs rounded-full">
                    {path[path.length - 1].nextMap.streetName}
                  </span>
                )}
              </div>

              {/* Arrival Map Image with Zoom */}
              <div className="mt-3 min-h-[300px] max-h-[600px] bg-muted/20 rounded border flex items-center justify-center overflow-hidden">
                <Zoom>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getMapImageUrl(path[path.length - 1].nextMap.id)}
                    alt={path[path.length - 1].nextMap.name || `Map ${path[path.length - 1].nextMap.id}`}
                    className="max-h-[600px] max-w-full w-auto h-auto object-contain"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </Zoom>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
