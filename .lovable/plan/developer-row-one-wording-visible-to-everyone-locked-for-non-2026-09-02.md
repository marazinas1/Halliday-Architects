# Developer row: one wording, visible to everyone, locked for non-developers

## What changes

- The developer action always reads **Change default**, whether or not a default is pinned. "Set default" disappears.
- The developer row (lock icon + "Developer" label + Change default + Clear default + the short explanation) becomes visible to owners and editors too, not only developers.
- For owners and editors the buttons are disabled: they can see the capability exists, and the lock makes it obvious this is a developer-only action. Clicking does nothing and the picker never opens.
- Developers keep full behaviour exactly as today.
- The explanation line stays as it is ("Kept if the project is deleted." / "Pin a photograph the site falls back to."), so non-developers understand what the layer does.

## Technical notes

- `src/components/admin/PageImageSlot.tsx`:
  - The `isDeveloper && (...)` wrapper around the developer row is removed; the row always renders.
  - Button label becomes the constant `Change default`.
  - `disabled` on both the trigger and Clear default becomes `busy || !isDeveloper`; the Dialog's `open` is forced closed for non-developers so the trigger cannot open the picker.
  - "Clear default" still renders only when a default is pinned, but is disabled for non-developers.
- No permission logic, RLS, or data changes: server-side write rules for `page_media_defaults` already restrict this to developers; this is a presentation change only.
