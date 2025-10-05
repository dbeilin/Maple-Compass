import Link from 'next/link'
import { Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright/Info */}
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Maple Compass
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <Link
              href="https://github.com/dbeilin/maple-compass"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Link>

            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>

            <Link
              href="https://royals.ms/forum/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              MapleRoyals Forums
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
