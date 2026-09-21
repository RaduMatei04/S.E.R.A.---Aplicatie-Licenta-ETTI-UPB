import { Link, NavLink } from 'react-router-dom'
import { ProfileMenu } from '@/features/profile/components/ProfileMenu'
import { ThemePopover } from '@/features/theme/components/ThemePopover'
import { accents } from '@/features/theme/theme.config'
import { useTheme } from '@/features/theme/useTheme'
import { cn } from '@/lib/utils'

const navigation = [
  { to: '/status', label: 'STATUS' },
  { to: '/grafice', label: 'GRAFICE' },
  { to: '/istoric', label: 'ISTORIC' },
  { to: '/setari', label: 'SET\u0102RI' },
]

export function Navbar() {
  const { accent } = useTheme()

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-8 lg:flex-nowrap lg:py-4">
        <Link to="/acasa" aria-label="SERA" className="flex shrink-0 items-center gap-2 rounded-sm text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden">
            <img src={accents[accent].logo} alt="" width={32} height={40} className="h-10 w-8 object-contain" />
          </span>
          <span className="text-2xl font-semibold tracking-[0.12em]">SERA</span>
        </Link>
        <nav aria-label="Navigare principal&#259;" className="order-last flex w-full items-center justify-between gap-2 lg:order-none lg:ml-8 lg:w-auto lg:justify-start lg:gap-8">
          {navigation.map(({ to, label }) => (
           <NavLink
  key={to}
  to={to}
  className={({ isActive }) =>
    cn(
      "flex min-h-11 items-center rounded-lg px-4 text-sm font-medium tracking-wide transition-colors",
      isActive
        ? "bg-brand text-white hover:bg-brand/90 hover:text-white"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    )
  }
>
  {label}
</NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <ThemePopover />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}
