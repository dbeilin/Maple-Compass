import { useState } from 'react'
import { Button } from './ui/button'

export function Navbar() {
  const [showAbout, setShowAbout] = useState(false)

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
          <div className="flex flex-1 items-center gap-4">
            {/* Logo */}
            <a
              href="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="h-10 w-10 flex-shrink-0">
                <img
                  src="/assets/logo.png"
                  alt="Maple Compass"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-primary">Maple Compass</h1>
                <p className="text-xs text-muted-foreground">Navigate MapleStory with ease</p>
              </div>
            </a>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAbout(!showAbout)}
              className="gap-1.5"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden sm:inline">About</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
            >
              <a
                href="https://github.com/dbeilin/maple-compass"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-1.5"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="hidden sm:inline">GitHub</span>
              </a>
            </Button>
          </div>
        </div>
      </nav>

      {/* About Panel - Simple Slide-in */}
      {showAbout && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
            onClick={() => setShowAbout(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background shadow-lg animate-in slide-in-from-right duration-300">
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-lg font-semibold">About Maple Compass</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAbout(false)}
                  className="h-8 w-8"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">Getting Started</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Select your current location as the Starting Map</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Choose your destination as the Target Map</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Click "Find Path" to get the optimal route</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">Tips</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>Use the swap button to quickly reverse your route</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>Click on map images to view them in full size</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-secondary">•</span>
                        <span>Copy the path to share with friends</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3 font-semibold text-foreground">Limitations & Notes</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>Cannot find paths between different areas/worlds</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>You may encounter occasional bugs as this is a hobby project</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>The API sometimes returns incomplete data</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-accent">•</span>
                        <span>Contributions welcome via Pull Request!</span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Built for MapleStory Artale players. Data provided by{' '}
                      <a
                        href="https://maplestory.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        MapleStory.io API
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
