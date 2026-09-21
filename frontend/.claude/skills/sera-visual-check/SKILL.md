---
name: sera-visual-check
description: Use after implementing or modifying UI in the SERA greenhouse frontend to verify the change actually looks and behaves correctly in the browser, rather than only trusting TypeScript/lint. Triggers on requests like "verifică vizual", "arată-mi cum arată", "testează în browser", or after any sera-builder UI change before calling it done.
---

Verify a SERA frontend change in a real browser instead of only trusting the type checker.

## Steps

1. **Check whether the dev server is already running** (e.g. an existing process on the Vite port, usually `http://localhost:5173`). Per `AGENTS_SERA.md` §35, never start, stop, or restart it yourself unless the user explicitly asks — if it isn't running, ask the user to start it or for permission to run `npm run dev`.
2. Once you know the dev server URL, open the relevant route(s) for the change:
   - `/` Home, `/status` STATUS, `/grafice` GRAFICE, `/istoric` ISTORIC, `/setari` SETĂRI, profile via the profile popup (not a direct navbar link).
3. Check the specific thing that changed, plus:
   - both **Light and Dark** appearance modes;
   - at least one accent color other than the default, to catch hard-coded colors instead of theme tokens;
   - a narrow viewport (mobile width) in addition to desktop, since responsive behavior is required from the start;
   - keyboard focus visibility and any interactive control added/changed.
4. Compare what you see against the specific requirement (navbar rules, theme rules, component ownership) rather than just "does it render something."
5. Report concretely what you saw — which states/viewports/themes were checked and what, if anything, is off — instead of a bare "looks good."

Do not claim a UI task is complete without having gone through this check when a browser tool is available. If no browser tool is available in this session, say so explicitly instead of asserting the UI works.
