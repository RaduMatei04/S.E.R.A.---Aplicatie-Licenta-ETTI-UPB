# Overview — Features

Index-ul folderelor din `src/features/`. Niciun feature nu are încă `hooks/`, `queries/`, `schemas/`, `types/` sau `constants/` — normal, pentru că nu există strat de date/backend (nu există `src/api/`, nicio utilizare de `useQuery`/`useMutation` în cod, deși `QueryClientProvider` e deja montat global).

| Feature | Fișiere existente | Ruta | Notă |
|---|---|---|---|
| [[Start]] | `StartPage.tsx`, `components/ParticleBackground.tsx`, `lib/initParticles.ts` | `/start` (public) | singurul feature cu subfolder `lib/`; nemenționat explicit ca pagină în `AGENTS_SERA.md` |
| [[Home]] | `HomePage.tsx` | `/acasa` | |
| [[Status]] | `StatusPage.tsx` | `/status` | |
| [[Charts]] | `ChartsPage.tsx` | `/grafice` | |
| [[History]] | `HistoryPage.tsx` | `/istoric` | |
| [[Settings]] | `SettingsPage.tsx` | `/setari` | |
| [[Profile]] | `ProfilePage.tsx`, `components/ProfileMenu.tsx` | `/profil` | accesibil doar din popup, nu din navbar |
| [[Theme]] | `ThemeProvider.tsx`, `theme.config.ts`, `useTheme.ts`, `components/ThemePopover.tsx` | — (nu e pagină, e provider + popover în navbar) | |

## Foldere globale rezervate, momentan goale

- `src/components/layout/` — reținut pentru layout global partajat între feature-uri, neutilizat încă
- `src/constants/`, `src/hooks/`, `src/types/` — reținute pentru cod cu adevărat cross-feature
- `src/auth/components/` — reținut, gol

Legături: [[Harta-Rute]] · [[Reguli-Ownership]] · [[00-Index]]
