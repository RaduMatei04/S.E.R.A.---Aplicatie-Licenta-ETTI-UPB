# Autentificare — Keycloak

Keycloak e singura autoritate pentru login/sesiune/token-uri/identitate (`AGENTS_SERA.md` §13) — fără soluții paralele de auth, fără persistență ad-hoc de token în `localStorage`.

## Fișiere (`src/auth/`)

- `keycloak.ts` — instanțiază un singur client `Keycloak` (din `keycloak-js`), configurat din `import.meta.env.VITE_KEYCLOAK_URL/REALM/CLIENT_ID`
- `AuthProvider.tsx` — inițializează adaptorul Keycloak o singură dată (promisiune la nivel de modul, ca gardă împotriva dublei inițializări sub StrictMode); apelează `keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false })`; conectează `onAuthLogout`/`onAuthRefreshError`/`onAuthRefreshSuccess`/`onTokenExpired`; randează un ecran de loading/eroare până la autentificare; expune `{ isAuthenticated, isInitialized, login, logout, token }` prin `AuthContext`
- `hooks/useAuth.ts` — definește `AuthContext` (tipat) și hook-ul `useAuth()` (aruncă eroare dacă e folosit în afara provider-ului)
- `components/` — folder rezervat, momentan gol

## Unde e montat

Doar în [[Harta-Rute|ProtectedApp]] (`ThemeProvider > AuthProvider > AppShell`) — adică `/start` ([[Start]]) rămâne public, tot restul e protejat prin blocarea randării în `AuthProvider` până la autentificare.

`login`/`logout` apelează direct `keycloak.login()`/`keycloak.logout()` cu redirect URI-uri — logout-ul deleagă complet către Keycloak, fără logică custom.

Legături: [[Straturi-Aplicatie]] · [[Harta-Rute]] · [[00-Index]]
