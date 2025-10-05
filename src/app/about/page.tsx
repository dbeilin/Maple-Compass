import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '../components/Navbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pathfinding
        </Link>

        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About Maple Compass</CardTitle>
              <CardDescription>
                A MapleStory navigation tool powered by graph algorithms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What is Maple Compass?</h3>
                <p className="text-muted-foreground">
                  Maple Compass helps MapleStory players find the shortest path between any two maps in the game.
                  Using a breadth-first search (BFS) algorithm, it calculates the optimal route through portals
                  and provides step-by-step navigation instructions with directional guidance.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">How It Works</h3>
                <p className="text-muted-foreground">
                  The pathfinding system uses a pre-built graph of map connections from MapleStory.
                  When you select a starting map and destination, the BFS algorithm explores all possible
                  routes to find the shortest path (by number of map transitions). Each step includes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Portal name to use</li>
                  <li>Direction to travel (left, right, up, down)</li>
                  <li>Visual map preview with zoom capability</li>
                  <li>Street/area information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data Source</h3>
                <p className="text-muted-foreground">
                  Map data is sourced from the{' '}
                  <a
                    href="https://royals-library.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Royals Library API
                  </a>
                  , which provides detailed information about MapleStory maps, portals, and connections.
                  Map images are rendered using the MapleStory.io API.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Technology Stack</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Next.js 15 with React 19</li>
                  <li>TypeScript for type safety</li>
                  <li>Tailwind CSS v4 for styling</li>
                  <li>shadcn/ui components</li>
                  <li>Fuse.js for fuzzy search</li>
                  <li>BFS pathfinding algorithm</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Smart autocomplete search with fuzzy matching</li>
                  <li>Map swap functionality</li>
                  <li>Zoomable map previews</li>
                  <li>Step-by-step navigation with visual directions</li>
                  <li>Responsive design for all devices</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Source</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Maple Compass is an open-source project. Contributions, bug reports, and feature requests
                are welcome on{' '}
                <a
                  href="https://github.com/yourusername/maple-compass"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub
                </a>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Powered by BFS pathfinding algorithm • Data from{' '}
            <a
              href="https://royals-library.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Royals Library
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
