# Stack de tehnologii

Stack fix — conform `CLAUDE.md`, nu se introduc alternative fără discuție explicită.

## Dependențe principale (`package.json`)

| Pachet | Versiune | Rol |
|---|---|---|
| `react` / `react-dom` | ^19.2.8 | UI |
| `react-router-dom` | ^7.18.3 | routing — vezi [[Harta-Rute]] |
| `vite` | ^8.2.2 | build/dev server |
| `typescript` | ~6.0.2 | tipare strict, fără `any` |
| `tailwindcss` + `@tailwindcss/vite` | ^4.3.3 | styling utilitar |
| `@base-ui/react` | ^1.8.0 | primitive headless (bază pentru shadcn) — vezi [[Shadcn-Primitives]] |
| `class-variance-authority` | ^0.7.1 | variante de componente shadcn |
| `@tanstack/react-query` | ^5.102.8 | server state (momentan montat, dar neconsumat încă — nu există `src/api/`) |
| `@tanstack/react-form` | ^1.33.5 | formulare complexe |
| `zod` | ^4.5.4 | validare la granițele de încredere |
| `keycloak-js` | ^26.2.4 | autentificare — vezi [[Keycloak]] |
| `lucide-react` | ^1.41.0 | iconițe |
| `@fontsource-variable/geist` | ^5.3.0 | font |
| `oxlint` (dev) | ^1.79.0 | linting |

## Interzis explicit

Axios, Bootstrap/MUI/Chakra/Ant/styled-components/Emotion, orice soluție de autentificare scrisă manual (Keycloak e singura autoritate — vezi [[Keycloak]]).

## Comenzi

```
npm run dev       # nu porni fără cerere explicită — se presupune că rulează deja
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm run preview
```

Legături: [[Straturi-Aplicatie]] · [[00-Index]]
