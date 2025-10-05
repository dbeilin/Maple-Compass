import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
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
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What is Maple Compass?</h3>
                <p className="text-muted-foreground">
                  It&apos;s just a simple tool to help you find the shortest path between two maps in MapleStory.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Why</h3>
                <p className="text-muted-foreground">
                  I recently started playing again and found myself getting lost often 😅
                </p>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Want to Contribute?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Maple Compass is on GitHub. Contributions, bug reports, and feature requests
                are welcome on{' '}
                <a
                  href="https://github.com/dbeilin/maple-compass"
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

      <Footer />
    </div>
  )
}
