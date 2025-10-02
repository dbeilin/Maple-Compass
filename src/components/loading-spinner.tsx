export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative w-16 h-16 mb-4">
        {/* Spinning compass */}
        <div className="absolute inset-0 animate-spin">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-primary"
            fill="currentColor"
          >
            {/* Compass circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="10 5"
              className="text-primary/40"
            />
            {/* Compass needle */}
            <path
              d="M 50 10 L 45 50 L 50 90 L 55 50 Z"
              className="text-primary drop-shadow-md"
            />
          </svg>
        </div>
      </div>

      <p className="text-sm font-medium text-foreground mb-1">
        Finding your path...
      </p>
      <p className="text-xs text-muted-foreground">
        Exploring map connections
      </p>
    </div>
  )
}
