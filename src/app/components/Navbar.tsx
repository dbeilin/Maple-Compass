import Link from 'next/link'
import Image from 'next/image'
import { Github } from 'lucide-react'

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo and Tagline */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="Maple Compass Logo"
              width={48}
              height={48}
              className="shrink-0"
            />
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                Maple Compass
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Navigate MapleStory with ease
              </p>
            </div>
          </Link>

          {/* Right Side - Navigation Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="https://github.com/dbeilin/maple-compass"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">GitHub</span>
            </Link>

            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
