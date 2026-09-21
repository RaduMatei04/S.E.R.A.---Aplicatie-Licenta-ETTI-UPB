# Theme

Nu e o pagină/rută — e un provider + popover montat în navbar (dreapta, lângă [[Profile]]).

## Fișiere

- `src/features/theme/ThemeProvider.tsx` — montat în `ProtectedApp` (`ThemeProvider > AuthProvider > AppShell`)
- `src/features/theme/theme.config.ts` — config culori accent + token-uri
- `src/features/theme/useTheme.ts` — hook de consum
- `src/features/theme/components/ThemePopover.tsx` — popover "TEMA" din navbar

## Sistem de teme (`AGENTS_SERA.md` §6)

Două axe independente:
- **Culoare accent**: Brad `#139438`, Iris `#4948E8`, Trandafir `#D62957`, Lavandă `#9673E7`
- **Mod aspect**: Light/Dark, fundaluri neutre

Accentul controlează logo-ul, nav-ul activ, acțiunile primare, focus ring, accentul din grafice — centralizat într-un singur config, expus prin variabile CSS semantice (`--background`, `--accent-color`, `--ring` etc.), niciodată hex brut răspândit prin cod.

Legături: [[Overview]] · [[Harta-Rute]] · [[00-Index]]
