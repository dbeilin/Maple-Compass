import { useRef, useCallback, useEffect } from 'react'
import type { MapInfo, PathStep, MapGraph } from '../types/map'

interface WorkerResponse {
  type: 'success' | 'error' | 'timeout' | 'disconnected'
  path?: PathStep[]
  error?: string
}

interface UsePathfindingWorkerResult {
  findPath: (startMap: MapInfo, endMap: MapInfo, mapGraph: MapGraph) => Promise<PathStep[]>
  cancelSearch: () => void
}

export function usePathfindingWorker(): UsePathfindingWorkerResult {
  const workerRef = useRef<Worker | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../lib/pathfinding.worker.ts', import.meta.url),
      { type: 'module' }
    )

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const cancelSearch = useCallback(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
  }, [])

  const findPath = useCallback(
    (startMap: MapInfo, endMap: MapInfo, mapGraph: MapGraph): Promise<PathStep[]> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not initialized'))
          return
        }

        // Create new abort controller for this search
        abortControllerRef.current = new AbortController()
        const signal = abortControllerRef.current.signal

        // Handle abort
        const abortHandler = () => {
          workerRef.current?.terminate()
          // Reinitialize worker
          workerRef.current = new Worker(
            new URL('../lib/pathfinding.worker.ts', import.meta.url),
            { type: 'module' }
          )
          reject(new Error('Search cancelled by user'))
        }

        signal.addEventListener('abort', abortHandler)

        // Handle worker response
        const messageHandler = (event: MessageEvent<WorkerResponse>) => {
          signal.removeEventListener('abort', abortHandler)
          abortControllerRef.current = null

          const { type, path, error } = event.data

          if (type === 'success' && path) {
            resolve(path)
          } else if (type === 'timeout') {
            reject(new Error('Search timed out after 10 seconds. The maps may be very far apart or disconnected.'))
          } else if (type === 'disconnected') {
            reject(new Error('No path found. The maps appear to be in disconnected regions.'))
          } else {
            reject(new Error(error || 'Failed to find path'))
          }
        }

        workerRef.current.addEventListener('message', messageHandler, { once: true })

        // Send request to worker
        workerRef.current.postMessage({
          type: 'findPath',
          startMap,
          endMap,
          mapGraph
        })
      })
    },
    []
  )

  return { findPath, cancelSearch }
}
