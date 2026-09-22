# Design System: Bivio ERP Minimalist & Uncluttered (Épuré)

## 1. Visual Theme & Atmosphere
A ultra-minimalist, spacious, gallery-airy SaaS interface for Bivio ERP. The atmosphere is calm, clinical, and sophisticated — prioritizing vast negative space, thin subtle dividers (`1px border-white/10`), and strict visual hierarchy. Interfaces avoid visual overload by limiting active elements to 3-4 primary focal points per view.

## 2. Color Palette & Roles
- **Obsidian Canvas Base** (`#07070A`) — Deep dark canvas with max breathing room
- **Pure Surface Card** (`#0F172A`) — Clean elevated containers with minimal border opacity (`rgba(255,255,255,0.06)`)
- **Charcoal Text Primary** (`#FAFAFA`) — High contrast headlines & key FCFA metrics
- **Muted Slate Subtext** (`#888888`) — Quiet metadata & secondary labels
- **Electric Indigo Accent** (`#6366F1`) — Single primary CTA button & active status ring
- **Emerald Accent** (`#10B981`) — Subtle status dot for validated OHADA transactions
- **Banned:** Oversaturated gradients, outer neon glows, background patterns, decorative cards-inside-cards.

## 3. Typography Rules
- **Display & Headlines:** `Plus Jakarta Sans` or `Satoshi` — Track-tight (-0.03em), crisp, weight-driven hierarchy.
- **Body & Subtext:** `Plus Jakarta Sans` — 16px base, relaxed 1.6 line-height, strictly capped at 60 characters per line.
- **Financial Metrics:** `JetBrains Mono` — Clean monospaced FCFA currency alignment with generous spacing.
- **Banned:** Generic system fonts, serif fonts, emojis.

## 4. Component Stylings
- **Buttons:** Flat, tactile, matte dark surfaces with crisp subtle border (`1px solid rgba(255,255,255,0.12)`). Max 1 primary CTA per screen.
- **Cards:** Used sparingly only when required for functional containment (`1.5rem` / `24px` radius). High-density grids are replaced with clean `border-t` horizontal divider lines and whitespace.
- **Inputs:** Minimalist dark line inputs with subtle focus ring. No heavy background fills.
- **Metrics:** Giant, clean numeric typography paired with small quiet labels above.

## 5. Layout Principles (Minimalist & Uncluttered)
- **Vast Whitespace:** Section gaps `clamp(3rem, 6vw, 6rem)`. Generous internal padding.
- **Asymmetric Focus:** Maximum 3 KPI cards per row. Large clear primary chart space with zero clutter.
- **No Overloaded Grids:** Banned 4-column crammed card layouts. Replaced with spacious 2-column or split-screen views.

## 6. Anti-Patterns (Explicit Bans)
- No overcrowded dashboards with 10+ competing boxes.
- No redundant decorative badges, flags, or icons.
- No colorful outer glow shadows.
- No pure black (`#000000`).
- No filler copy or bouncing animation elements.
