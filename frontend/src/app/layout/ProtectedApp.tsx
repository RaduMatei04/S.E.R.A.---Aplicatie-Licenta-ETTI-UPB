import { AppShell } from '@/app/layout/AppShell'
import { AuthProvider } from '@/auth/AuthProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'
import { useSeraSocket } from '@/hooks/useSeraSocket'

/**
 * Conexiunea live se deschide o singură dată, aici, pentru toată zona autentificată:
 * dacă ar fi pornită din fiecare pagină, navigarea ar închide și redeschide socketul.
 */
function LiveTelemetry() {
  useSeraSocket()
  return <AppShell />
}

export function ProtectedApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LiveTelemetry />
      </AuthProvider>
    </ThemeProvider>
  )
}
