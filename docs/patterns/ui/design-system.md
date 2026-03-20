# Influence Map — Design System & Style Guide

This document is the single source of truth for UI patterns in the Influence Map app. **Every agent touching UI code must read this before making changes.**

## Architecture: Atomic Design

We follow atomic design principles. Components are organized by complexity:

```
app/src/components/
├── atoms/          # Smallest reusable elements (Badge, Button, Icon)
├── molecules/      # Compositions of atoms (DomainBadge, FilterToggle, EdgeCard)
├── organisms/      # Complex sections (Graph, DossierPanel, FilterBar)
├── templates/      # Page layouts (AppLayout)
└── pages/          # Route-level components (GraphPage, PersonPage, FeedPage)
```

### Rules
1. **Atoms** have no dependencies on other components
2. **Molecules** compose atoms only
3. **Organisms** may compose atoms and molecules
4. **Templates** define layout structure, composed of organisms
5. **Pages** are route endpoints that compose templates + organisms

---

## Design Tokens

All tokens are defined in `app/src/index.css` via the `@theme` directive. **Never hardcode colors, fonts, or sizes — always use tokens.**

### Colors

| Token | Value | Usage |
|---|---|---|
| `bg` | `#080c12` | Page background |
| `bg-raised` | `#0d1117` | Cards, sidebar, elevated surfaces |
| `bg-overlay` | `#141a23` | Overlays, modals |
| `surface` | `rgba(0,0,0,0.55)` | Panel backgrounds |
| `surface-hover` | `rgba(255,255,255,0.05)` | Hover state on surfaces |
| `surface-active` | `rgba(255,255,255,0.08)` | Active/selected surfaces |

### Text Colors

| Token | Value | Usage |
|---|---|---|
| `text-primary` | `#e8f4ff` | Headings, names, emphasis |
| `text-secondary` | `#c8d7e6` | Body text, descriptions |
| `text-tertiary` | `rgba(200,215,230,0.65)` | Supporting text |
| `text-muted` | `rgba(200,215,230,0.4)` | Metadata, timestamps |
| `text-faint` | `rgba(200,215,230,0.25)` | Labels, hints, disabled |

**Contrast Rule:** Never use `text-faint` for anything the user needs to read. Use `text-tertiary` as the minimum for readable text. Reserve `text-faint` for decorative labels only.

### Domain Colors

Each domain has three tokens: color, background, and border.

| Domain | Color | Class prefix |
|---|---|---|
| Context Engineering | `#00d4ff` (cyan) | `domain-ctx` |
| Evaluations | `#f5c542` (yellow) | `domain-eval` |
| Agent Orchestration | `#d966ff` (purple) | `domain-orch` |
| AI-Assisted Dev | `#4dff91` (green) | `domain-dev` |

**Usage:**
```html
<!-- Badge with domain color -->
<span class="bg-domain-ctx-bg border-domain-ctx-border text-domain-ctx">CTX</span>

<!-- Inline domain color via style prop (when dynamic) -->
<span style={{ color: DOMAINS[domainKey].color }}>...</span>
```

### Borders

| Token | Usage |
|---|---|
| `border` | Default borders (very subtle) |
| `border-subtle` | Section dividers within panels |
| `border-emphasis` | Hovered or interactive borders |
| `border-strong` | Active/selected state borders |

---

## Typography

### Fonts

| Token | Font | Usage |
|---|---|---|
| `font-sans` | Inter | Body text, descriptions, UI text |
| `font-mono` | JetBrains Mono | Labels, badges, data, graph text |

**Rule:** Use `font-sans` for anything users read. Use `font-mono` for technical labels, counters, badges, and graph annotations.

### Font Sizes

| Token | Size | Usage |
|---|---|---|
| `text-caption` | 10px | Graph labels only (SVG context) |
| `text-label` | 11px | Monospace UI labels, badges |
| `text-xs` | 12px | Smallest readable body text |
| `text-sm` | 13px | Secondary body text |
| `text-base` | 14px | Default body text |
| `text-lg` | 16px | Subheadings |
| `text-xl` | 18px | Section titles |
| `text-2xl` | 22px | Page titles |
| `text-3xl` | 28px | Hero/name display |

**Minimum readable size:** `text-xs` (12px) for body text. Never go smaller except in SVG graph context or monospace labels.

---

## Spacing

Use Tailwind's default spacing scale:
- `p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, `p-5` = 20px, `p-6` = 24px, `p-8` = 32px

### Conventions
- **Card padding:** `p-3` (12px) for compact, `p-4` (16px) for standard
- **Section gaps:** `gap-2` (8px) between items, `gap-4` (16px) between sections
- **Page padding:** `px-4 py-8 md:px-8` for content pages

---

## Component Patterns

### Buttons

```tsx
// Primary action
<button className="px-3 py-1.5 bg-accent/15 border border-accent/30 text-accent text-sm font-mono
  rounded-md hover:bg-accent/25 transition-all duration-[var(--transition-base)] cursor-pointer">
  ACTION
</button>

// Ghost/filter button (active)
<button className="px-2.5 py-1.5 bg-surface-active border border-border-strong
  text-text-secondary text-label font-mono tracking-wider rounded-sm cursor-pointer">
  ACTIVE FILTER
</button>

// Ghost/filter button (inactive)
<button className="px-2.5 py-1.5 bg-surface-hover/30 border border-border
  text-text-faint text-label font-mono tracking-wider rounded-sm cursor-pointer">
  INACTIVE FILTER
</button>
```

### Cards

```tsx
<div className="p-3 rounded-md border border-border hover:border-border-emphasis
  bg-bg-raised/50 hover:bg-bg-raised transition-all duration-[var(--transition-base)]">
  ...
</div>
```

### Section Headers (monospace labels)

```tsx
<div className="text-label font-mono text-text-faint tracking-[0.12em] mb-2 uppercase">
  SECTION TITLE
</div>
```

### Domain Badges

```tsx
<span
  className="text-label font-mono px-2 py-0.5 tracking-wider rounded-sm border"
  style={{
    background: `${DOMAINS[domain].color}18`,
    borderColor: `${DOMAINS[domain].color}70`,
    color: DOMAINS[domain].color,
  }}
>
  {DOMAINS[domain].short}
</span>
```

---

## Responsive Design

### Breakpoints
- **Mobile:** `< 768px` (detected via `useIsMobile()` hook)
- **Desktop:** `>= 768px`

### Layout
- **Desktop:** Sidebar nav (56px) + content area
- **Mobile:** Full-width content + bottom tab bar (56px)

### Conventions
- Use `md:` prefix for desktop overrides: `text-sm md:text-lg`
- Mobile-first: write mobile styles as defaults, override with `md:`
- The `useIsMobile()` hook is for JavaScript logic (not styling — prefer Tailwind responsive classes)

---

## Common Pitfalls

### 1. Dark-on-dark contrast
**Wrong:** Using `text-text-faint` for body text (nearly invisible)
**Right:** Use `text-text-tertiary` minimum for anything users need to read

### 2. Font size too small
**Wrong:** `text-[8px]` or `text-[9px]` for labels
**Right:** `text-label` (11px) for monospace labels, `text-xs` (12px) for body text

### 3. Inline styles instead of tokens
**Wrong:** `style={{ color: '#080c12' }}`
**Right:** `className="text-bg"` or use token reference

### 4. Hardcoded domain colors
**Wrong:** `style={{ color: '#00d4ff' }}`
**Right:** Use `DOMAINS[key].color` from `lib/constants.ts` — this keeps domain colors centralized

### 5. Missing transitions
**Wrong:** Abrupt hover/active state changes
**Right:** Always include `transition-all duration-[var(--transition-base)]` on interactive elements

---

## File Reference

| File | Purpose |
|---|---|
| `app/src/index.css` | Design tokens (@theme), base styles |
| `app/src/lib/constants.ts` | DOMAINS config, getDomColor, LAYER_LABEL_COLORS |
| `app/src/lib/types.ts` | Person, Edge, DomainKey, GraphData types |
| `app/src/hooks/useIsMobile.ts` | Responsive breakpoint hook |
| `app/src/components/templates/AppLayout.tsx` | Root layout with sidebar/tabs |
