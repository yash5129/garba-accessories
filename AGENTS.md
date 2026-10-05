# Project Guidance

## User Preferences

- Festive Navratri/Garba theme matching the uploaded collages: warm cream, maroon, orange, green, gold
- Prices are entered by the owner per individual item, never hardcoded
- Each uploaded collage must be cropped into separate product images
- Prices displayed in Indian Rupees (₹)

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Generated Candid bindings type Nat fields (priceInPaise, sortOrder) as bigint; normalize every numeric field to number at the API adapter boundary, not just the obvious one, or runtime arithmetic and Array.sort throw 'Cannot convert a BigInt value to a number'.
- Under Enhanced Migration, seed starter data from the init-once migration chain entry so a fresh deploy has a populated catalog without requiring admin sign-in; keep the admin seed method idempotent as a manual fallback.
- Motoko has no triple-quoted string literals; build multi-line text with # concatenation and \n escapes.
- OQL .toEntity auto-derivation cannot derive _toRow for variant, optional, or type-alias fields; use .toEntityManual + .payload with top-level <Type>Value imports.
- Tailwind v3 only emits color utilities for colors registered in theme.extend.colors; raw CSS variables alone do not make text-<color> valid.
