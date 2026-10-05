# Design Brief

## Direction

Pinned & Festive — a warm scrapbook-atelier storefront where handmade Navratri accessories hang like polaroids on a cream parchment board.

## Tone

Warm maximalist-craft: celebratory and handmade, but disciplined enough to stay a clean, readable catalog.

## Differentiation

Every product lives in a pinned polaroid frame with a handwritten script caption — the collage becomes the interface.

## Color Palette

| Token      | OKLCH         | Role                                    |
| ---------- | ------------- | --------------------------------------- |
| background | 0.962 0.018 85 | Warm cream parchment page base          |
| foreground | 0.275 0.052 42 | Cocoa-brown body text                   |
| card       | 0.988 0.010 88 | Polaroid / card surface (near-white)    |
| primary    | 0.375 0.135 22 | Deep maroon — headings, brand, footer   |
| accent     | 0.505 0.115 152 | Peacock green — secondary accent, chips |
| secondary  | 0.905 0.045 72 | Marigold orange-tint — CTAs, highlights |
| muted      | 0.935 0.024 80 | Soft beige section bands                |
| gold       | 0.795 0.135 86 | Antique gold — pearls, dividers, glow   |

## Typography

- Display: Fraunces — hero and section headings, maroon, tight tracking
- Body: General Sans — nav, product copy, prices, UI labels
- Accent: Instrument Serif Italic — handwritten-style card captions and eyebrow labels
- Scale: hero `text-5xl md:text-7xl font-bold tracking-tight`, h2 `text-3xl md:text-5xl font-bold tracking-tight`, label `text-sm font-semibold tracking-[0.2em] uppercase`, body `text-base md:text-lg`

## Elevation & Depth

Layered warm shadows: near-flat cards lift to `shadow-polaroid` on hover; header/footer use borders, not shadows, to frame the parchment.

## Structural Zones

| Zone    | Background            | Border                 | Notes                                             |
| ------- | --------------------- | ---------------------- | ------------------------------------------------- |
| Header  | `bg-card` cream       | `border-b border-border` | Sticky; maroon wordmark, search, sign-in          |
| Content | `bg-background` cream | —                      | Alternate `bg-muted/40` bands; hero uses gradient |
| Footer  | `bg-primary` maroon   | `border-t border-primary` | Gold text/links, category columns              |

## Spacing & Rhythm

Generous vertical rhythm (`py-16 md:py-24` sections), `gap-6 md:gap-8` card grids, `gap-3` micro-spacing in cards; category strips scroll horizontally on mobile.

## Component Patterns

- Buttons: pill `rounded-full`; primary maroon fill, accent orange for order CTAs, hover lifts 1px + `shadow-elevated`
- Cards: polaroid `rounded-xl` white frame, thick bottom caption, `shadow-polaroid`, 1–2° rotation, wooden push-pin dot at top center
- Badges: pill chips; green for categories, orange for "Price on request", maroon for "Sold out"

## Motion

- Entrance: `animate-fade-up` staggered 60–90ms across grid cards
- Hover: card lift + straighten rotation, `transition-smooth` 300ms
- Decorative: `animate-float-soft` on diya/motif accents, `animate-flicker` on flame glows

## Constraints

- Light mode is primary; dark mode tuned warm (not inverted) for evening browsing
- Tokens only — no raw hex/arbitrary color classes in components
- No cart/checkout or customer accounts (per scope)
- Prices always rendered in Indian Rupees (₹); "Price on request" when unset

## Signature Detail

The pinned polaroid product card with a handwritten Instrument Serif caption and a gold push-pin — the collage literally becomes the storefront grid.
