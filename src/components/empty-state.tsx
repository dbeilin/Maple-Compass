export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 px-4 text-center">
      <div className="mb-4 relative">
        {/* Animated compass icon */}
        <div className="w-16 h-16 relative animate-pulse">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-primary drop-shadow-lg"
            fill="currentColor"
          >
            {/* Compass circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-primary/30"
            />
            {/* Compass needle */}
            <path
              d="M 50 10 L 45 50 L 50 90 L 55 50 Z"
              className="text-primary"
            />
            {/* Cardinal points */}
            <text x="50" y="8" textAnchor="middle" className="text-xs font-bold fill-current">
              N
            </text>
          </svg>
        </div>
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-2 text-foreground">
        Welcome to Maple Compass!
      </h2>

      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Find the optimal path between any two maps in MapleStory. Select your starting location and destination to begin your journey.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
        <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
          <div className="w-10 h-10 mb-2 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xl">
            🔍
          </div>
          <h3 className="font-semibold text-sm mb-1">Search Maps</h3>
          <p className="text-xs text-muted-foreground">
            Type to search thousands of locations
          </p>
        </div>

        <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border hover:border-secondary/50 transition-colors">
          <div className="w-10 h-10 mb-2 flex items-center justify-center rounded-full bg-secondary/10 text-secondary text-xl">
            🗺️
          </div>
          <h3 className="font-semibold text-sm mb-1">Find Paths</h3>
          <p className="text-xs text-muted-foreground">
            Get step-by-step portal navigation
          </p>
        </div>

        <div className="flex flex-col items-center p-3 rounded-lg bg-card border border-border hover:border-accent/50 transition-colors">
          <div className="w-10 h-10 mb-2 flex items-center justify-center rounded-full bg-accent/10 text-accent text-xl">
            📍
          </div>
          <h3 className="font-semibold text-sm mb-1">Visual Guide</h3>
          <p className="text-xs text-muted-foreground">
            See map previews with directions
          </p>
        </div>
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        <p>
          Try starting with popular destinations like{" "}
          <span className="font-medium text-foreground">Henesys</span>,{" "}
          <span className="font-medium text-foreground">Ellinia</span>, or{" "}
          <span className="font-medium text-foreground">Kerning City</span>
        </p>
      </div>
    </div>
  )
}
