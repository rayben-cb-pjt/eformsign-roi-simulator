# 2026-02-02 PDF A4 Snapshot Design

## Summary
Implement an A4 single-page PDF export that matches the on-screen layout 1:1 by capturing a cloned off-screen DOM snapshot and embedding it into a portrait A4 page with width-fit scaling.

## Goals
- A4 single page with preserved aspect ratio
- Match current screen layout (no PDF-only reflow)
- Avoid scroll and viewport offset issues
- Keep export reliable and deterministic

## Non-goals
- Searchable text layer
- Multi-page splitting
- Server-side rendering

## Approach
1. Clone the target root into an off-screen wrapper with fixed width/height matching the rendered element.
2. Freeze animations and transitions within the wrapper.
3. Sync form values and canvas content into the clone.
4. Wait for fonts and images to finish loading.
5. Capture via html2canvas with fixed window and scroll settings.
6. Add the image to jsPDF A4 with width-fit scaling; if too tall, scale to fit height. Top-align and center horizontally.
7. Save via File System Access API with download fallback.

## Error handling
- Fail fast if the target element is missing.
- Exit cleanly if the save dialog is canceled.
- Best-effort canvas copy; ignore draw failures.

## Testing
- Compare PDF to screen at common viewport widths (1280, 1440, 1920).
- Verify layout fidelity for different slider values and chart states.
- Confirm no top offset or unexpected whitespace is introduced.
