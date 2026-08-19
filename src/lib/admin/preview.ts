/**
 * Unsaved-content preview.
 *
 * The admin forms serialise their current state into localStorage and open the
 * matching public page in a new tab under /admin/preview/*. Nothing is written
 * to the database. localStorage (not sessionStorage) is used because
 * window.open with "noopener" does not clone sessionStorage into the new tab.
 */
export type PreviewKind = "project" | "blog" | "team";

const storageKey = (kind: PreviewKind) => `admin-preview-${kind}`;

export function openPreview(kind: PreviewKind, payload: unknown) {
  localStorage.setItem(storageKey(kind), JSON.stringify(payload));
  window.open(`/admin/preview/${kind}`, "_blank", "noopener");
}

export function readPreview<T>(kind: PreviewKind): T | null {
  try {
    const raw = localStorage.getItem(storageKey(kind));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const previewPath = (kind: PreviewKind) => `/admin/preview/${kind}`;
