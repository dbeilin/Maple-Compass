import type { PathStep, MapInfo } from '../types/map'

interface PathSummaryProps {
  path: PathStep[]
  sourceMap: MapInfo
  targetMap: MapInfo
  onClear: () => void
  onCopyPath: () => void
}

export function PathSummary({ path, sourceMap, targetMap, onClear, onCopyPath }: PathSummaryProps) {
  const totalSteps = path.length

  return (
    <div className="rounded-lg border bg-gradient-to-br from-card to-card/50 p-6 shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-1">Path Found!</h2>
          <p className="text-sm text-muted-foreground">
            From <span className="font-medium text-foreground">{sourceMap.name}</span> to{" "}
            <span className="font-medium text-foreground">{targetMap.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCopyPath}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
            title="Copy path as text"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            title="Clear path"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">
          {totalSteps}
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total Steps</p>
          <p className="text-base font-semibold text-foreground">
            {totalSteps} {totalSteps === 1 ? 'map' : 'maps'} to traverse
          </p>
        </div>
      </div>
    </div>
  )
}
