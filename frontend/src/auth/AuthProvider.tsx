import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext } from '@/auth/hooks/useAuth'
import { keycloak } from '@/auth/keycloak'
import { Button } from '@/components/ui/button'

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; token: string }
  | { status: 'error'; message: string }

// The adapter cannot be initialized twice, including after StrictMode replay.
let initialization: Promise<boolean> | undefined

function login() {
  return keycloak.login({ redirectUri: window.location.href })
}

function logout() {
  return keycloak.logout({ redirectUri: window.location.origin })
}

// The adapter's expiry timer retains this callback across provider remounts.
function refreshToken() {
  // Keycloak captures this function in its timer; do nothing on public routes.
  if (keycloak.onTokenExpired !== refreshToken) return
  void keycloak.updateToken(-1).catch(() => keycloak.onAuthRefreshError?.())
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let active = true

    function handleSessionLoss() {
      // Prevent clearToken's fire-and-forget login; recovery uses a full reload.
      keycloak.loginRequired = false
      if (active) {
        setState({ status: 'error', message: 'Sesiunea a expirat. Reincarcati pentru autentificare.' })
      }
    }

    function handleRefreshFailure() {
      handleSessionLoss()
      keycloak.clearToken()
    }

    function handleRefreshSuccess() {
      const token = keycloak.token
      if (active && keycloak.authenticated && token) {
        setState((previous) => previous.status === 'authenticated'
          ? { status: 'authenticated', token }
          : previous)
      }
    }

    keycloak.onAuthLogout = handleSessionLoss
    keycloak.onAuthRefreshError = handleRefreshFailure
    keycloak.onAuthRefreshSuccess = handleRefreshSuccess
    keycloak.onTokenExpired = refreshToken

    initialization ??= Promise.resolve().then(() => {
      if (!import.meta.env.VITE_KEYCLOAK_URL?.trim()
        || !import.meta.env.VITE_KEYCLOAK_REALM?.trim()
        || !import.meta.env.VITE_KEYCLOAK_CLIENT_ID?.trim()) {
        throw new Error('Missing public Keycloak configuration')
      }
      return keycloak.init({
        onLoad: 'login-required',
        pkceMethod: 'S256',
        // Session validation belongs to the mounted protected region, not an iframe.
        checkLoginIframe: false,
      })
    })

    void initialization.then(async () => {
      if (!active) return
      // Reconcile expiry/session changes that happened while unmounted.
      if (keycloak.authenticated) {
        try {
          await keycloak.updateToken(-1)
        } catch {
          keycloak.loginRequired = false
          keycloak.clearToken()
        }
      }
      if (!active) return
      if (!keycloak.authenticated || !keycloak.token) {
        await login()
        return
      }
      setState({ status: 'authenticated', token: keycloak.token })
    }).catch(() => {
      if (active) {
        setState({
          status: 'error',
          message: 'Autentificarea nu a reusit. Verificati conexiunea si configuratia Keycloak, apoi reincarcati.',
        })
      }
    })

    return () => {
      active = false
      keycloak.loginRequired = false
      delete keycloak.onAuthLogout
      delete keycloak.onAuthRefreshError
      delete keycloak.onAuthRefreshSuccess
      delete keycloak.onTokenExpired
    }
  }, [])

  if (state.status !== 'authenticated') {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md space-y-4 text-center">
          {state.status === 'error' ? (
            <>
              <p role="alert">{state.message}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Reincarca</Button>
            </>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">Se verifica autentificarea...</p>
          )}
        </div>
      </main>
    )
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated: true,
      isInitialized: true,
      login,
      logout,
      token: state.token,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
