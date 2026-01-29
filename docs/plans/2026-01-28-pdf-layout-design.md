# PDF Report Layout Design (2026-01-28)

## Context
The current PDF export clones parts of the live UI and forces a single-column layout. This is brittle and produces inconsistent output (long single-page PDFs, layout drift when UI changes).

## Goals
- Provide a stable, dedicated PDF layout that does not depend on the live page structure.
- Keep the report content aligned with the on-screen results.
- Ensure predictable A4 rendering and avoid animation artifacts in the PDF capture.

## Non-Goals
- Rebuild charts or tables with a different rendering library.
- Change calculation logic or add new data.

## Proposed Approach
Create a dedicated `PdfReport` component that renders the report content for export only. Render it off-screen (not `display: none`) so it can be measured and captured. Disable animation/motion in PDF mode for consistent capture.

### Component Layout
- Hero metric (full width)
- KPI grid (4 cards)
- Charts + ESG in 2-column layout
- Detailed table (full width)
- Footer disclaimer

### Rendering Strategy
- Render `PdfReport` with a fixed width of 794px (A4 at 96 DPI).
- Use existing components (`KPICard`, `ChartsSection`, `ESGGrid`, `DetailTable`) with a new `isPdf`/`animate` prop to disable motion and random animation.
- Keep the on-screen layout unchanged.

### Export Flow
- Replace DOM cloning logic with a direct `exportToPdf('pdf-report-root')` call.
- Use multi-page export (A4 split) instead of a single long page.

### Error Handling
- If the PDF root element cannot be found, abort and surface a user-facing error (existing toast/alert path).

## Testing Plan
- Verify PDF export completes and downloads.
- Confirm charts render in the PDF output.
- Confirm Korean text renders correctly.
- Confirm layout is 2-column and fits into multiple A4 pages.
- Compare values with on-screen results after parameter changes.
