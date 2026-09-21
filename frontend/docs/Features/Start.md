# Start

Pagină publică de tip landing/splash — singura rută neprotejată de Keycloak (vezi [[Keycloak]]). Redirect implicit de la `/` prin [[Harta-Rute]].

## Fișiere

- `src/features/start/StartPage.tsx`
- `src/features/start/components/ParticleBackground.tsx` — efect vizual de particule
- `src/features/start/lib/initParticles.ts` — inițializare/logică particule (singurul feature cu subfolder `lib/`)

## Rol conceptual

Punct de intrare public, înainte de autentificare. Nu apare în listă ca pagină de business în `AGENTS_SERA.md` §28-29 (acelea încep de la Home) — e strict landing.

Legături: [[Overview]] · [[Harta-Rute]] · [[00-Index]]
