import { useState } from 'react'

export function Navbar() {
  const [showFaq, setShowFaq] = useState(false)

  function handleToggle() {
    setShowFaq(!showFaq)
  }

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10">
                <img 
                  src="/assets/logo.png" 
                  alt="MapleStory Pathfinder Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-primary">
                  Maple Compass
                </h1>
                <p className="text-sm text-muted-foreground">
                  Navigate MapleStory with ease
                </p>
              </div>
            </div>
            
            <button
              onClick={handleToggle}
              className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
            >
              <span>About</span>
              <span className="transition-transform duration-200" style={{ transform: showFaq ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                {showFaq ? '▼' : '▶'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* About Panel */}
      <div 
        className={`fixed top-0 right-0 w-[32rem] h-screen bg-background/95 backdrop-blur shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          showFaq ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">About</h3>
            <button
              onClick={handleToggle}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Getting Started</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Select your current location as the Source Map</li>
                <li>• Choose your destination as the Target Map</li>
                <li>• Click "Find Path" to get the optimal route</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Tips</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Use the swap button to reverse your route</li>
                <li>• Click on map images to view them in full size</li>
                <li>• Each step shows the direction to reach the next map</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Limitations & Notes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Cannot find paths between different areas/worlds</li>
                <li>• You may encounter occasional bugs as this is a hobby project 😅</li>
                <li>• Contributions and improvements are welcome via PR</li>
                <li>• The API sometimes returns bad/wrong data, so sorry for any "path not found" issues. The tool is only as smart as the data it gets 😅</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
