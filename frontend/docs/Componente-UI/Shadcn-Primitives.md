# Primitive shadcn/Radix

Locuiesc exclusiv în `src/components/ui/` — regulă strictă din `CLAUDE.md`/`AGENTS_SERA.md` §7: **nu se copiază** o primitivă într-un feature și **nu se învelesc** (`SeraButton`, `CustomCard`) doar pentru a restiliza local.

## Primitive existente azi

- `badge.tsx`
- `button.tsx`
- `card.tsx`
- `dropdown-menu.tsx`
- `input.tsx`
- `label.tsx`
- `popover.tsx` — folosit de [[Theme]] (`ThemePopover`) și [[Profile]] (`ProfileMenu`)
- `separator.tsx`
- `tabs.tsx`

## Reguli conexe

- Iconițe exclusiv din `lucide-react`, dimensionare consistentă.
- Styling: doar Tailwind + utilitarul `cn` din `src/lib/utils.ts`; token-uri semantice (`--background`, `--accent-color` etc. din [[Theme]]) în locul culorilor hex brute.
- Estetică "clean administrative-dashboard" — se evită glassmorphism, umbre grele, gradient-uri.
- Accesibilitate: focus vizibil, controale icon-only etichetate, fără div-uri clickable, primitive Radix pentru popover/dialog.

Legături: [[Reguli-Ownership]] · [[00-Index]]
