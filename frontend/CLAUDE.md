# SERA Frontend

Bachelor-thesis frontend for monitoring/configuring a smart greenhouse. Currently UI-first: no ESP32/backend integration exists yet — never invent device data, endpoints, or protocols.

Full architecture, ownership, and style rules live in [AGENTS_SERA.md](AGENTS_SERA.md) — read it before any non-trivial change. This file is just the quick-start.

## Stack (fixed — do not introduce alternatives)

React 19 + TypeScript + Vite + Tailwind v4 + shadcn/ui (Radix) + TanStack Query + TanStack Form + Zod + Keycloak + React Router + Lucide icons. No Axios, no Bootstrap/MUI/Chakra/Ant/styled-components/Emotion, no hand-built auth.

## Commands

```
npm run dev      # do NOT run unless the user explicitly asks — assume it's already running
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview
```

## Layout

```
src/app/          router, providers, layout
src/components/ui/   shadcn primitives only — never duplicated into features
src/components/layout/
src/features/<name>/  page + components/hooks/queries/schemas/types owned by that feature
src/auth/          Keycloak
```

## Non-negotiables (see AGENTS_SERA.md for the full list)

- No `any`; validate untrusted data with Zod at trust boundaries.
- Server state → TanStack Query; complex forms → TanStack Form + Zod; no HTTP calls inside UI components.
- Reuse shadcn primitives from `src/components/ui/`; never wrap one just to restyle it in one place.
- Hand-written files stay under ~300 lines.
- No Manual/Automatic mode concept; navbar/theme/route conventions are fixed — see AGENTS_SERA.md §4–6.
- Never start/stop/restart the dev server without being explicitly asked.

## Agents

- `sera-builder` — implements/modifies UI, enforces the stack and architecture above.
- `sera-reviewer` — read-only review of changes against these project rules (use alongside or instead of `/code-review` for this repo).
