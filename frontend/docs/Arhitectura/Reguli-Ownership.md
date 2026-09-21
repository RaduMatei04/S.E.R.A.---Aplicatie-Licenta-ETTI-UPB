# Reguli de ownership și naming

Din `AGENTS_SERA.md` §8-9, §22-23.

## Unde trăiește o componentă

| Scop | Locație |
|---|---|
| Global / independent de context | `src/components/` |
| Specific unui feature | `src/features/<feature>/components/` |
| Specific unei secțiuni dintr-un feature | `src/features/<feature>/<sectiune>/components/` |
| Helper privat, folosit de un singur owner | lângă owner, nu promovat mai sus "pentru orice eventualitate" |

## Structura unui feature (`src/features/<name>/`)

Fiecare feature își are propriile: `Page.tsx`, `components/`, `hooks/`, `queries/`, `schemas/`, `types/`, `constants/` — create doar când sunt necesare (vezi [[Overview]] pentru ce e populat azi vs. rezervat).

## Convenții de naming

| Tip fișier | Convenție | Exemplu |
|---|---|---|
| Componentă | `PascalCase.tsx` | `HomePage.tsx`, `StatusPage.tsx` |
| Hook | `useSomething.ts` | `useAuth.ts`, `useTheme.ts` |
| Schema Zod | `something.schema.ts` | — |
| Tipuri | `something.types.ts` | — |
| Query/mutation | `something.queries.ts` | — |
| Funcție API | `something.api.ts` | — |
| Constante | `something.constants.ts` | — |

Identificatorii de cod rămân în engleză chiar dacă etichetele UI sunt în română. Boolean-ele se citesc natural (`isOpen`, `hasError`).

## Alte reguli non-negociabile

- Fără `any` / `as any`.
- Fișierele scrise manual rămân sub ~300 de linii.
- Import prin alias `@/`, fără lanțuri relative adânci, fără "reach-in" între feature-uri.
- Fără fișiere-coș-de-gunoi (`utils.ts`/`helpers.ts`/`common.ts`/`misc.ts` generice) — excepția e `src/lib/utils.ts`, care conține doar helper-ul `cn` de la shadcn.

Legături: [[Straturi-Aplicatie]] · [[Overview]] · [[00-Index]]
