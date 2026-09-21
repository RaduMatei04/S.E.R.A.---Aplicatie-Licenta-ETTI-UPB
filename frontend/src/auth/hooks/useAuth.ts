import { createContext, useContext } from 'react'

type AuthContextValue = {
  isAuthenticated: boolean
  isInitialized: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  token: string | undefined
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('useAuth must be used within AuthProvider')
  return auth
}
