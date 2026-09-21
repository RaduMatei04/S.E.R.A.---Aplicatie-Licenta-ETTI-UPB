# AGENTS.md — SERA Frontend

## 1. Project Context

SERA (Sistem Electronic de Reglare și Automatizare) is a bachelor-thesis application for monitoring and configuring a smart greenhouse.

This repository starts as a clean frontend project. The initial phase is intentionally UI-first: the ESP32 device, backend integrations, sensor communication protocols, and real telemetry may not exist yet.

The agent must therefore build the application so that:

1. the frontend structure is production-ready from the beginning;
2. pages and reusable UI are correctly organized before real data exists;
3. mock or placeholder data is never confused with real device data;
4. future ESP32/backend integration can be added without restructuring the entire frontend;
5. visual behavior remains consistent across every page.

Do not invent device behavior, backend endpoints, protocols, sensor values, or business rules that were not explicitly requested.

---

# 2. Mandatory Technology Stack

The frontend stack is fixed:

- React
- React DOM
- React Router DOM
- TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Radix UI primitives through shadcn/ui
- Lucide React icons
- TanStack Query
- TanStack Form
- Zod
- Keycloak for authentication

New source code must use TypeScript.

Do not introduce alternative UI frameworks, styling systems, form libraries, request libraries, icon libraries, authentication systems, or state-management libraries unless the user explicitly requests them.

In particular:

- do not use Axios;
- do not use Bootstrap;
- do not use Material UI;
- do not use Chakra UI;
- do not use Ant Design;
- do not use styled-components;
- do not use Emotion;
- do not replace shadcn/ui with hand-built duplicate primitives;
- do not replace Keycloak with custom authentication.

Use native `fetch` behind a dedicated API layer when HTTP communication is introduced.

---

# 3. Mandatory Frontend Root Structure

The frontend must be created and maintained under a dedicated `frontend/` directory.

Target structure:

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers/
│   │   │   ├── AppProviders.tsx
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── AuthProvider.tsx
│   │   └── layouts/
│   │       └── AppLayout.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── feedback/
│   │
│   ├── features/
│   │   ├── home/
│   │   ├── status/
│   │   ├── charts/
│   │   ├── history/
│   │   ├── settings/
│   │   ├── profile/
│   │   ├── theme/
│   │   └── auth/
│   │
│   ├── api/
│   │   ├── client.ts
│   │   ├── query-keys.ts
│   │   └── types.ts
│   │
│   ├── auth/
│   │   ├── keycloak.ts
│   │   └── types.ts
│   │
│   ├── hooks/
│   ├── lib/
│   ├── constants/
│   ├── types/
│   ├── styles/
│   │   └── globals.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── components.json
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

The exact presence of a file may evolve as the project grows, but the ownership model is mandatory.

Do not create a flat `src/` full of unrelated files.

---

# 4. Application Routes

SERA is a SPA.

The main application routes are conceptually:

```text
/             -> Home
/status       -> STATUS
/grafice      -> GRAFICE
/istoric      -> ISTORIC
/setari       -> SETĂRI
/profil       -> Date personale
```

The exact route naming should remain consistent once implemented.

There is no visible `ACASĂ` navigation button in the navbar.

The home route is accessed by clicking the SERA brand/logo in the navbar.

Do not introduce Manual Mode or Automatic Mode. These concepts are intentionally excluded from the application.

---

# 5. Navbar Requirements

The primary navigation is a top navbar.

Left side:

- leaf logo;
- `SERA` wordmark;
- clicking the brand navigates to Home.

Main navigation:

- STATUS
- GRAFICE
- ISTORIC
- SETĂRI

Right side:

- TEMA popup control;
- profile popup control.

Navigation items must be visually discreet:

- no permanent border;
- no permanent filled background;
- no heavy button appearance;
- subtle hover feedback only;
- active state may use restrained accent treatment without turning the item into a large filled button.

The TEMA and profile controls are intentionally more isolated and visually distinct than the central navigation links.

The leaf logo and `SERA` wordmark must use the currently selected accent color.

---

# 6. Theme System

The application has two independent visual concepts:

1. accent color;
2. appearance mode.

Appearance mode:

- Light
- Dark

The general background must remain neutral.

Light mode should use off-white / very light gray neutral surfaces.

Dark mode should use dark gray neutral surfaces.

Selecting an accent must not recolor the entire application background.

Approved accent colors:

```text
Brad       #139438
Iris       #4948E8
Trandafir  #D62957
Lavandă    #9673E7
```

Accent colors may drive:

- SERA logo and wordmark;
- active navigation state;
- primary actions;
- selected controls;
- badges where appropriate;
- icon emphasis;
- focus rings;
- chart emphasis where appropriate.

Use semantic CSS variables / design tokens instead of scattering raw color values throughout TSX.

Prefer a token model such as:

```text
--background
--foreground
--card
--card-foreground
--muted
--muted-foreground
--border
--accent-color
--accent-foreground
--ring
```

Raw accent hex values must be centralized in one theme configuration, not duplicated across components.

Theme persistence may use browser storage when implemented.

---

# 7. shadcn/ui and Radix Rules

Reusable UI primitives must come from shadcn/ui and its Radix-based primitives whenever an appropriate component exists.

Examples include:

- Button
- Card
- Badge
- Input
- Textarea
- Label
- Select
- Switch
- Tabs
- Popover
- DropdownMenu
- Dialog
- Tooltip
- Separator
- Skeleton
- Table
- Alert

shadcn/ui components belong under:

```text
src/components/ui/
```

Do not copy the same shadcn primitive into feature folders.

Do not create a custom `SeraButton`, `CustomCard`, `NiceBadge`, etc. merely to restyle a primitive in one location.

Prefer variants, composition, class utilities, and semantic wrappers only when they represent a real application concept.

Feature-specific compositions belong inside the feature that owns them.

Example:

```text
src/components/ui/card.tsx                 -> generic Card primitive
src/features/status/components/PumpCard.tsx -> SERA-specific status composition
```

---

# 8. Component Ownership

Before creating any component, determine its narrowest correct scope.

## 8.1 Global primitive / context-agnostic

Use:

```text
src/components/
```

Only when the component can be reused without knowing SERA business context.

## 8.2 Feature-specific

Use:

```text
src/features/<feature>/components/
```

when the component understands feature-specific concepts.

## 8.3 Section-specific

If a feature grows into multiple complex sections:

```text
src/features/<feature>/<section>/components/
```

## 8.4 Private implementation

If a helper component exists only to support one owner, keep it close to that owner.

Do not promote code globally "just in case" it may someday be reused.

---

# 9. Feature Structure

Each feature should own its page, feature components, hooks, schemas, queries, and feature types where applicable.

Recommended pattern:

```text
src/features/settings/
├── SettingsPage.tsx
├── components/
│   ├── GreenhouseInfoSection.tsx
│   ├── SensorIntervalSection.tsx
│   ├── ThresholdsSection.tsx
│   ├── SystemConfigurationSection.tsx
│   └── Esp32ConnectionSection.tsx
├── hooks/
├── queries/
├── schemas/
│   └── settings.schema.ts
├── types/
│   └── settings.types.ts
└── constants/
```

A page component should primarily orchestrate sections.

Avoid pages containing hundreds of lines of inline markup, API logic, validation logic, transformations, and state management all at once.

---

# 10. TypeScript — Strict Rules

All source files must be `.ts` or `.tsx` unless a tool requires otherwise.

`any` is prohibited in normal application code.

If external untrusted data is unknown, use `unknown`, validate/narrow it, then convert it into a trusted domain type.

Prefer:

- discriminated unions;
- literal unions;
- readonly data when mutation is unnecessary;
- explicit boundary types;
- typed generics;
- exhaustive checks where meaningful;
- `satisfies` for configuration objects when useful;
- type narrowing instead of assertions.

Avoid:

- `as any`;
- repeated `as SomeType` assertions used to bypass typing;
- non-null assertions (`!`) without a proven invariant;
- giant global interfaces;
- duplicated domain models;
- `Record<string, any>`;
- untyped API responses.

Let TypeScript infer obvious local values.

Do not annotate trivial expressions solely to make code look "more typed".

Types should describe meaningful domain boundaries, not add noise.

Prefer `type` by default for unions, utility compositions, and aliases. Use `interface` when declaration extension or object-contract semantics are genuinely useful. Stay consistent within a feature.

---

# 11. Runtime Validation with Zod

TypeScript does not validate runtime data.

Use Zod at trust boundaries, especially for:

- form input;
- API responses when validation is warranted;
- URL/query parameters;
- persisted settings loaded from browser storage;
- environment-derived values when appropriate;
- configuration objects entering the application from an external source.

Do not duplicate the same rule in TypeScript, form handlers, and UI checks.

Prefer one schema as the source of truth where practical.

Example direction:

```ts
const greenhouseSettingsSchema = z.object({
  name: z.string().trim().min(1),
  sensorReadIntervalSeconds: z.number().int().positive(),
});

type GreenhouseSettings = z.infer<typeof greenhouseSettingsSchema>;
```

Do not over-validate purely internal values already guaranteed by the type system.

---

# 12. Forms

Complex application forms should use:

```text
TanStack Form + Zod
```

Do not implement large forms as collections of independent `useState` calls.

Keep:

- schema;
- field definitions;
- form lifecycle;
- submit behavior;
- server mutation

clearly separated.

Simple UI state such as popup visibility, tabs, temporary toggles, or local disclosure state may use React state.

Do not use a form library for state that is not actually form state.

---

# 13. Authentication

Authentication is handled by Keycloak.

Keycloak is the authentication authority.

TanStack Query is not an authentication mechanism.

Responsibilities must remain separate:

```text
Keycloak
  -> login / logout / session / tokens / identity

API client
  -> attaches valid access token to protected HTTP requests

TanStack Query
  -> manages server state, caching, request lifecycle, retries, invalidation

UI
  -> renders authenticated application state
```

Keycloak initialization must be isolated from presentation components.

Do not call Keycloak initialization directly from random pages.

Do not manually persist access tokens in arbitrary localStorage keys unless the chosen Keycloak integration explicitly requires it and the user approves it.

Do not build a parallel custom login/session system beside Keycloak.

Logout from the profile popup must delegate to the Keycloak logout flow when authentication is connected.

During the current frontend-only phase, authentication integration may be scaffolded without inventing fake production credentials.

---

# 14. TanStack Query

All remote/server state must use TanStack Query when the backend exists.

Use it for:

- queries;
- mutations;
- loading/error state;
- caching;
- refetching;
- invalidation;
- synchronization;
- stale-data strategy.

Do not manage server data using manual combinations of `useEffect` + `useState`.

Do not put HTTP requests directly inside page components.

Preferred flow:

```text
API function
    ↓
query / mutation hook
    ↓
feature component
    ↓
presentation
```

Query keys must be centralized or constructed consistently.

Example concept:

```ts
export const queryKeys = {
  greenhouse: {
    root: ["greenhouse"] as const,
    status: () => [...queryKeys.greenhouse.root, "status"] as const,
  },
};
```

Do not use unstable object literals as query keys when a stable key factory is appropriate.

Do not use TanStack Query for purely local presentation state.

---

# 15. API Layer

When backend communication is introduced, keep transport concerns outside the UI.

Use a small typed API layer based on native `fetch`.

Conceptual flow:

```text
src/api/client.ts
        ↓
feature API function
        ↓
TanStack Query hook
        ↓
feature/page
```

The API client should eventually handle cross-cutting transport concerns such as:

- base URL;
- authorization header;
- JSON serialization/deserialization;
- normalized HTTP errors;
- request cancellation through `AbortSignal` where useful.

Do not build one massive `api.ts` file containing every endpoint in the application.

Feature-specific endpoints belong close to the feature.

Do not invent endpoints before the backend contract exists.

---

# 16. React Rules

Use functional components only.

Components must be focused and declarative.

Prefer composition over configuration-heavy mega-components.

Avoid unnecessary `useEffect`.

Never use `useEffect` to calculate values that can be derived during render.

Avoid synchronized duplicate state.

Bad:

```text
state A
 -> effect
 -> state B that can be derived from A
```

Prefer computing B from A.

Use memoization only when there is an actual correctness/stability need or a measurable performance reason.

Do not sprinkle `useMemo` and `useCallback` everywhere by default.

Keep event handlers close to their responsibility and name them by intent.

Prefer:

```text
handleThemeChange
handleLogout
handleSettingsSubmit
```

Avoid:

```text
handleClick
handleData
processStuff
```

when more specific names are available.

---

# 17. Hooks

Custom hooks must encapsulate meaningful reusable behavior.

Good examples:

```text
useTheme
useAuth
useGreenhouseStatusQuery
useSensorHistoryQuery
useUpdateSettingsMutation
```

Avoid vague names:

```text
useData
useCommon
useHelpers
useStuff
```

Do not create a hook merely to move three trivial lines out of a component.

Feature-specific hooks belong inside their feature.

Application-wide hooks belong in `src/hooks/` only when genuinely shared.

---

# 18. State Ownership

Use the smallest appropriate state scope.

Preferred ownership order:

1. derived render state;
2. local component state;
3. feature context/provider only when multiple descendants genuinely share it;
4. TanStack Query for server state.

Do not introduce a global state library unless explicitly requested.

Theme state and authentication state may use dedicated providers because they are application-wide concerns.

Do not put server state into React Context when TanStack Query is the correct owner.

---

# 19. Clean Code — Mandatory

All code must follow advanced clean-code principles.

Core rules:

- one responsibility per function/component/module;
- clear ownership;
- intention-revealing names;
- small focused functions;
- early returns over deep nesting;
- minimal side effects;
- no hidden mutation;
- no duplicated business logic;
- no magic strings/numbers;
- no dead code;
- no unused exports;
- no speculative abstractions;
- no giant utility dumping grounds;
- no comments that merely translate the code into English;
- comments explain non-obvious reasons, constraints, or tradeoffs.

A reader should understand a component from its structure and names without reverse-engineering implementation details.

---

# 20. DRY Without Over-Abstraction

DRY is mandatory for duplicated responsibility, not merely duplicated syntax.

Before creating new code, check for an existing:

- component;
- primitive;
- hook;
- schema;
- type;
- query;
- mutation;
- constant;
- helper;
- formatter.

If two locations implement the same business rule, extract it.

If two fragments merely look similar but represent different responsibilities, duplication may be clearer than a forced generic abstraction.

Never solve DRY by creating files such as:

```text
utils.ts
helpers.ts
common.ts
misc.ts
```

that become unrelated dumping grounds.

Prefer narrow files named after their actual responsibility.

---

# 21. File Size and Module Size

Application source files should stay under 300 lines.

If a `.ts` or `.tsx` file approaches 300 lines, reassess responsibilities before adding more code.

Split by meaningful responsibility, not arbitrary line count.

Exceptions may exist for generated shadcn/ui code or machine-generated files, but hand-written SERA application code should respect this limit.

A 250-line component with one coherent responsibility can be better than five meaningless 50-line wrappers, but large page components are generally a design smell.

---

# 22. Naming Conventions

Use clear English code identifiers even though visible UI labels may be Romanian.

Examples:

```text
HomePage
StatusPage
ChartsPage
HistoryPage
SettingsPage
ProfilePage
ThemePopover
ProfileMenu
GreenhouseInfoSection
Esp32ConnectionStatus
```

React components:

```text
PascalCase.tsx
```

Hooks:

```text
useSomething.ts
```

Schemas:

```text
something.schema.ts
```

Types:

```text
something.types.ts
```

Queries:

```text
something.queries.ts
```

API modules:

```text
something.api.ts
```

Constants:

```text
something.constants.ts
```

Booleans must read naturally:

```text
isOpen
isConnected
isLoading
hasError
canEdit
shouldRefetch
```

Avoid meaningless names such as:

```text
data
info
thing
stuff
temp
obj
arr
helper
common
```

when a domain-specific name is available.

---

# 23. Imports and Module Boundaries

Keep imports intentional and easy to scan.

Prefer path aliases such as `@/` if configured by the project.

Avoid deeply nested relative paths such as:

```text
../../../../components/ui/button
```

Do not create circular dependencies.

Features must not reach into another feature's private internal folders.

If functionality is truly shared between features, move the shared abstraction to an appropriate shared layer.

Do not use barrel files (`index.ts`) everywhere by default. Use them only where they improve a stable public module boundary without hiding dependencies or creating cycles.

---

# 24. Styling Rules

Use Tailwind CSS for application styling.

Do not mix arbitrary inline style objects with Tailwind unless a dynamic value genuinely cannot be represented cleanly through the established theme/token system.

Use the project's class-merging utility from shadcn conventions (for example `cn`) for conditional class composition.

Prefer semantic theme classes and CSS variables over raw hard-coded colors.

Do not repeat large class strings across the application when they represent the same reusable component responsibility.

Do not create giant CSS files containing feature-specific styles that belong next to a component abstraction.

Responsive behavior must be considered from the beginning.

---

# 25. Visual Consistency

All pages must feel like one application.

Reuse the same:

- card primitives;
- radius scale;
- border behavior;
- spacing rhythm;
- typography hierarchy;
- form controls;
- buttons;
- badges;
- empty states;
- loading states;
- popup behavior;
- theme tokens.

Do not redesign the visual language separately for each route.

SERA should use a clean administrative-dashboard aesthetic with neutral surfaces and restrained accent usage.

Avoid excessive gradients, glow effects, heavy shadows, glassmorphism, animated decoration, and visual clutter unless explicitly requested.

---

# 26. Lucide Icons

Use Lucide React for icons.

Do not mix multiple icon libraries.

Icons should support meaning, not decorate every text label unnecessarily.

Use consistent icon sizing inside equivalent controls.

If a shadcn/ui composition already expects a Lucide icon pattern, follow that pattern.

---

# 27. Accessibility

Radix/shadcn accessibility behavior must not be removed.

Requirements:

- interactive elements must be keyboard accessible;
- icon-only controls require an accessible label;
- forms require associated labels;
- focus states must remain visible;
- popovers/dropdowns/dialogs must use the intended Radix primitives;
- do not implement clickable `<div>` elements when a semantic button/link is appropriate;
- color alone must not be the only carrier of critical state information.

Do not sacrifice accessibility for visual styling.

---

# 28. Current UI-Only Development Phase

Until real backend/device integration is explicitly introduced:

- build routing;
- build layouts;
- build reusable UI primitives;
- build theme behavior;
- build profile/theme popups;
- build empty or structural page layouts;
- use placeholders only when explicitly useful for layout validation.

Do not pretend placeholder values are real ESP32 readings.

Do not create fake networking layers solely to simulate architecture.

Do not invent MQTT/WebSocket/REST communication choices before they are decided.

Structure the code so real data can later replace placeholders through queries without rewriting presentation components.

---

# 29. Page Responsibilities

## Home

Future responsibility: current data for both plants, such as temperature, humidity, light, soil values, and other approved sensor readings.

For now, preserve a layout capable of representing both plants without inventing live data.

## STATUS

Future responsibility: actuator/device status such as pumps and fans.

Do not add Manual/Automatic mode controls.

## GRAFICE

Future responsibility: historical parameter evolution for both plants.

Chart implementation and chart library should not be invented until requested if not already established by the project.

## ISTORIC

Future responsibility: event log / system history.

## SETĂRI

Future responsibility includes:

- greenhouse name;
- short description;
- sensor read interval;
- thresholds;
- system configuration;
- additional information;
- ESP32 connection status.

## Profile

Accessible from the profile popup, not from the central navbar navigation.

Contains personal-user-related UI when implemented.

---

# 30. Error Handling

Errors must be intentional and typed where practical.

Never silently swallow errors.

Avoid:

```ts
try {
  // ...
} catch {
  // nothing
}
```

Normalize transport errors at the API boundary when backend communication exists.

Display user-facing errors at the appropriate feature/UI boundary.

Do not expose raw technical stack traces to users.

Keep enough diagnostic context for development.

---

# 31. Loading, Empty, and Error States

Every future server-driven feature must deliberately account for:

- loading;
- success;
- empty;
- error;
- stale/refetching where relevant.

Use shared shadcn-based feedback patterns where the same presentation responsibility repeats.

Do not scatter custom spinners and inconsistent empty states across pages.

---

# 32. Performance

Optimize architecture first, micro-performance second.

Do not prematurely memoize everything.

Avoid unnecessary rerenders caused by poorly scoped global state.

Lazy-load route-level code only when it provides meaningful benefit and does not complicate the initial implementation unnecessarily.

Use stable query keys and TanStack Query caching rather than duplicate fetches.

Avoid storing large derived data structures in state when they can be computed from source data.

---

# 33. Security Boundaries

Never hard-code:

- passwords;
- client secrets;
- private tokens;
- production credentials.

Frontend environment variables are not secret merely because they are stored in `.env` files and exposed by Vite.

Do not place a Keycloak confidential-client secret in browser code.

Treat data from the network and browser storage as untrusted at runtime where appropriate.

Do not bypass Keycloak authorization decisions in presentation code.

---

# 34. Dependency Rules

Before adding a dependency, check whether the problem is already solved by:

- React;
- browser APIs;
- TypeScript;
- Tailwind;
- shadcn/ui / Radix;
- Lucide;
- TanStack Query;
- TanStack Form;
- Zod;
- Keycloak;
- an existing internal utility.

Do not add dependencies for trivial convenience.

If a new dependency is genuinely needed, it must have a clear responsibility and must not overlap heavily with the fixed stack.

---

# 35. Development Server

Assume the development server is already running unless the user explicitly says otherwise.

Do not start, stop, kill, or restart it without explicit permission.

Do not run:

```text
npm run dev
npm start
yarn dev
pnpm dev
vite
```

unless explicitly instructed.

Do not start a second dev server.

---

# 36. Working With Existing Code

Before modifying code:

1. inspect the relevant directory;
2. inspect the route/feature being modified;
3. inspect reusable shadcn/ui components;
4. inspect existing feature components;
5. inspect hooks;
6. inspect schemas/types;
7. inspect query/API patterns;
8. inspect theme conventions.

Before creating a new component, hook, schema, type, query, mutation, helper, or constant, search for an existing equivalent.

Preserve working behavior outside the requested scope.

Do not perform unrelated rewrites.

Because SERA starts as a clean project, maintain the target architecture from day one instead of creating temporary poor structure that will supposedly be cleaned up later.

---

# 37. Agent Implementation Workflow

For each task, the agent should follow this sequence:

```text
1. Understand the user request
2. Inspect relevant existing files
3. Identify ownership and reuse opportunities
4. Plan the smallest coherent change
5. Implement with existing primitives and patterns
6. Verify TypeScript
7. Run lint/tests/build checks when appropriate and available
8. Inspect for duplication, dead code, naming, ownership, and file size
9. Confirm no unrelated behavior was changed
```

Do not start coding by immediately creating new files before inspecting what already exists.

---

# 38. Validation Before Completion

Before considering a task complete, verify all relevant items:

1. TypeScript compiles.
2. No `any` was introduced without explicit justification.
3. No unused imports, variables, exports, or dead code remain.
4. No duplicate component/query/schema/helper was created unnecessarily.
5. Files are in the correct ownership directory.
6. Hand-written source files remain under 300 lines.
7. shadcn/ui primitives are reused rather than reimplemented.
8. Tailwind/theme tokens are used consistently.
9. No raw hard-coded accent colors were scattered into components.
10. Server state uses TanStack Query when applicable.
11. HTTP code is not embedded inside UI components.
12. Forms use TanStack Form + Zod when applicable.
13. Authentication remains a Keycloak responsibility.
14. No Axios usage was introduced.
15. No Manual/Automatic mode concept was introduced.
16. Navbar behavior follows the SERA requirements.
17. Light/Dark mode remains separate from accent selection.
18. Accessibility behavior has not been broken.
19. Existing functionality still works.
20. The development server was not started/stopped/restarted unless explicitly requested.

---

# 39. Definition of Done

A change is complete only when:

- the requested functionality is implemented;
- the implementation matches SERA's approved UI/architecture;
- code is readable and strongly typed;
- component ownership is correct;
- reusable primitives are reused;
- DRY is respected without premature abstraction;
- no unnecessary dependency is introduced;
- no hidden technical debt was added as a shortcut;
- validation checks relevant to the task pass;
- unrelated application behavior remains unchanged.

---

# 40. Final Architectural Principle

SERA must be built as a maintainable application, not as a collection of pages that merely look correct.

Every implementation decision should preserve this separation:

```text
Design system / UI primitives
          ↓
Application layout
          ↓
Feature composition
          ↓
Feature hooks / schemas / queries
          ↓
API and authentication boundaries
          ↓
Backend / ESP32 integration when introduced
```

Keep presentation, domain logic, server state, validation, authentication, and transport concerns separate.

Prefer clear explicit code over clever code.

Prefer meaningful composition over giant components.

Prefer stable architecture from the beginning over future refactoring promises.
