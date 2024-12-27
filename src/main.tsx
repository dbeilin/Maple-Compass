import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import { initializePathfinding } from './lib/pathfinding'

// Initialize pathfinding system
initializePathfinding().catch(error => {
  console.error('Failed to initialize pathfinding system:', error)
  // Show error in UI
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red;">
        Failed to load map data. Please try refreshing the page.
        ${error instanceof Error ? `<br>Error: ${error.message}` : ''}
      </div>
    `
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <App />
      <SpeedInsights />
      <Analytics />
    </>
  </React.StrictMode>,
)
