import { AppShell } from '@/app/layout/AppShell'
import { AuthProvider } from '@/auth/AuthProvider'
import { ThemeProvider } from '@/features/theme/ThemeProvider'

export function ProtectedApp() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
