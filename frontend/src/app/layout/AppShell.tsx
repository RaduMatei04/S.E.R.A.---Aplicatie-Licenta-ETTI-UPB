import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function AppShell() {
  return (
    <div className="min-h-dvh">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-popover focus:p-3 focus:text-popover-foreground">
        Salt la con&#539;inut
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-10 outline-none sm:px-8 sm:py-14 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight sm:[&_h1]:text-3xl">
        <Outlet />
      </main>
    </div>
  )
}
