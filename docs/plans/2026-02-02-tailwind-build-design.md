# 2026-02-02 Tailwind Build Pipeline Design

## Summary
Replace the Tailwind CDN script with a proper PostCSS-based Tailwind build pipeline in Vite to remove production warnings and make styling deterministic.

## Goals
- Eliminate the Tailwind CDN warning in production.
- Keep existing Tailwind classes and visual output unchanged.
- Preserve custom global styles and print styles.

## Non-goals
- Refactor UI or change design tokens beyond compatibility updates.
- Modify PDF export behavior.

## Approach
1. Add `tailwind.config.cjs` with current theme tokens (fonts, brand/accent colors, shadows).
2. Add `postcss.config.cjs` to enable Tailwind + Autoprefixer.
3. Create `index.css` with Tailwind directives and move existing global styles from `index.html`.
4. Import `index.css` from `index.tsx` so Vite bundles it.
5. Remove the Tailwind CDN `<script>` and inline config/style blocks from `index.html`.
6. Add Tailwind/PostCSS dependencies to `package.json`.

## Testing
- Run `npm install` and `npm run dev`.
- Verify no console warning about `cdn.tailwindcss.com`.
- Confirm layout parity with previous UI (hero, cards, charts, print styles).
