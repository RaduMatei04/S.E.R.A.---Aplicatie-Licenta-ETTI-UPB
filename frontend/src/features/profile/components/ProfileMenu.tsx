import { LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ProfileMenu() {
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState<string | null>(null)

  async function handleLogout() {
    setIsLoggingOut(true)
    setLogoutError(null)
    try {
      await logout()
    } catch {
      setLogoutError('Delogarea nu a reusit. Incercati din nou.')
      setIsLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="h-10 px-3 text-xs tracking-wide" />}>
        PROFIL
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-44">
        <DropdownMenuItem render={<Link to="/profil" />} className="min-h-10">
          Date personale
          <UserRound aria-hidden="true" className="ml-auto" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={isLoggingOut} closeOnClick={false} onClick={handleLogout} className="min-h-10">
          {isLoggingOut ? 'Se delogheaza...' : 'Delogare'}
          <LogOut aria-hidden="true" className="ml-auto" />
        </DropdownMenuItem>
        {logoutError && <p role="alert" className="px-2 py-1 text-xs text-destructive">{logoutError}</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
