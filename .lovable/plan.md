# Developer-set default photographs

## Where the automatic photographs come from today

There is no per-slot setting anywhere. The rule lives in code (`src/hooks/useResolvedPageImages.ts`): it takes every published project that has a card photograph, in the order the Projects list shows them, and hands them out one per slot in a fixed sequence (six wall slots, then the Projects / About / Contact tiles, then the About strip and the Contact hero). That is why the tile says "From 2200 Wesley Avenue" — it is simply the next project in the list, not a choice.

So today the order of the Projects list silently decides the homepage photography, and nobody can pin a slot.

## What we build

A second, lower layer of photographs that only a developer can set:

```text
1. Chosen by owner/editor   (page_media)        -> shown
2. Developer default        (page_media_default) -> shown when 1 is empty
3. Automatic project photo  (code fallback)      -> shown when 1 and 2 are empty
```

Owners and editors keep working exactly as now. If they clear their own choice, the slot falls back to the developer default instead of to an arbitrary project photograph. If no default was ever set, behaviour is unchanged.

### Admin experience

- Every photograph panel gets a third badge state: "Chosen", "Default" and "Automatic" (today only the first two exist).
- When a default exists, the panel reads e.g. "Default set by developer — shown on the site now".
- Signed in as a developer, each panel gains a small extra control: "Set as default" / "Clear default", visible only to that role. Owners and editors never see it and cannot call it.
- The defaults can be either a project photograph or an upload, using the same picker.

### Defaults survive project deletion

Yes. Deleting a project deletes its files from the `project-images` bucket, so a default that merely pointed at a project photograph would break. To prevent that, setting a default always **copies** the file into a separate `site-images/defaults/<page>/<slot>` location owned by the defaults layer. From then on the default is independent: the project can be deleted, renamed or unpublished and the hero and every other slot keep showing the same photograph. Only a developer clearing or replacing the default removes that copy.


## Technical notes

- New table `public.page_media_defaults` mirroring `page_media` (page, slot, bucket, path, alt, unique on page+slot), with GRANTs, RLS: read for anon and authenticated, write restricted to `is_platform_owner(auth.uid())` (the `developer` role).
- `usePageContent` fetches the defaults alongside `page_media`/`page_text`; `useResolvedPageImages` inserts the default between "chosen" and "automatic" and returns `source: "default"`.
- `PageImageSlot` gains the developer-only actions and the new badge; `AdminHome`, `AdminAbout`, `AdminServices`, `AdminContact` need no logic change since they read from the shared resolver.
- Uploads for defaults go through the existing `optimizeImage` pipeline; replacing or clearing a default deletes the file it replaced when that file was an upload (not a project photograph).
