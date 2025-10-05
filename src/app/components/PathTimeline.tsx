'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useEffect } from 'react'

interface PathTimelineProps {
  steps: Array<{
    id: number
    name: string
  }>
  selectedIndex: number
  onStepClick: (index: number) => void
}

export function PathTimeline({ steps, selectedIndex, onStepClick }: PathTimelineProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  }, [WheelGesturesPlugin({ forceWheelAxis: 'y' })])

  // Auto-scroll to selected step
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(selectedIndex)
    }
  }, [emblaApi, selectedIndex])

  return (
    <div className="overflow-hidden select-none" ref={emblaRef}>
      <div className="flex gap-2">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex-[0_0_auto]"
          >
            <button
              onClick={() => onStepClick(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors whitespace-nowrap ${
                selectedIndex === index
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/30'
                  : 'border-gray-300 bg-white dark:bg-gray-800 hover:border-orange-300'
              }`}
            >
              <div className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                selectedIndex === index
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {index + 1}
              </div>
              <span className="text-sm font-medium">
                {step.name || `Map ${step.id}`}
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
