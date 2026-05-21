# Expense Dashboard Design System

## Direction
A personal expense tracker that reads from Notion and categorizes with AI. The user checks it briefly — they want clarity and trust. It should feel like looking at a premium bank statement or a well-organized ledger, not a generic SaaS dashboard.

## Domain
Bank statement, ledger, receipt, transaction slip, carbon copy, accounting book, vault interior, cash register tape, pencil marks.

## Color World
- **Vault interior** — near-black with warm undertone (#0a0a0c)
- **Carbon paper** — deep blue-grey for surfaces (#141418)
- **Receipt thermal paper** — warm highlight for elevated surfaces (#1c1c22)
- **Pencil marks** — muted warm grey for metadata (#52525b)
- **Red stamp** — muted rose for negative numbers / destructive (#c45a5a)
- **Green tally** — muted sage for positive status (#5a9e7a)
- **Bank ink** — warm off-white for primary text (#f0ede8)

## Depth Strategy
**Borders-only.** No shadows. No glows. No gradients. Surfaces distinguished by subtle tint shifts + whisper-thin borders. This feels most like paper/ledger — clean, technical, precise.

## Typography
- **Sans**: Geist — clean, precise, modern. Used for all UI text.
- **Mono**: Geist Mono — for data, numbers, timestamps. Signals "this is data."
- Headlines: weight 600, tracking tight (-0.02em), leading tight (1.1)
- Body: weight 400, comfortable reading
- Labels: weight 500, smaller sizes, uppercase with wide tracking
- Data: mono, tabular-nums for alignment

## Spacing
Base unit: 4px. All spacing is a multiple of 4.
- Micro: 4px, 8px
- Component: 12px, 16px, 20px, 24px
- Section: 32px, 40px, 48px
- Major: 64px, 80px

## Border Radius
- Small (inputs, buttons): 8px
- Medium (cards, panels): 12px
- Large (modals, containers): 16px
- Full (pills, badges): 9999px

## Signature
**Ledger lines** — transactions separated by hairline dotted rules like an old accounting ledger. The transaction list feels like an unrolling receipt. The top metric "Total spend" gets a subtle "running total" treatment.

## Token Architecture

### Surfaces
- `--surface-0`: #0a0a0c (base canvas)
- `--surface-100`: #141418 (cards, panels)
- `--surface-200`: #1c1c22 (elevated: dropdowns, inputs, hover)
- `--surface-300`: #25252d (active, selected)

### Text (4-level hierarchy)
- `--text-primary`: #f0ede8 (headlines, primary data)
- `--text-secondary`: #a1a1aa (body, descriptions)
- `--text-tertiary`: #71717a (labels, metadata)
- `--text-muted`: #52525b (timestamps, placeholders, disabled)

### Border Progression
- `--border-dim`: rgba(255,255,255,0.04) (ghost — barely visible)
- `--border-subtle`: rgba(255,255,255,0.07) (standard separation)
- `--border-medium`: rgba(255,255,255,0.11) (emphasis, hover)
- `--border-strong`: rgba(255,255,255,0.18) (focus, active)

### Brand
- `--accent`: #5a9e7a (muted sage — one accent only)
- `--accent-dim`: rgba(90,158,122,0.12)
- `--accent-dimmer`: rgba(90,158,122,0.06)

### Semantic
- `--destructive`: #c45a5a (muted rose)
- `--warning`: #c9a96e (muted gold)
- `--success`: #5a9e7a (same as accent)

### Controls
- `--control-bg`: #141418 (same as surface-100)
- `--control-border`: rgba(255,255,255,0.09)
- `--control-focus`: rgba(90,158,122,0.4)

## Animation
Fast, functional, deceleration easing. No spring/bounce.
- Micro (hover, focus): 150ms, ease-out
- Medium (transitions): 200ms, cubic-bezier(0.16, 1, 0.3, 1)
- Large (page sections): 250ms

## Elevation Rules
- Cards/panels: surface-100 + border-subtle
- Inputs: surface-100 + control-border
- Hover: surface-200
- Active/selected: surface-300
- All elevated surfaces: slightly lighter than their parent
