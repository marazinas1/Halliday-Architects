import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Editable page content that is not a project, a post or a team member:
 * the photographs and the short pieces of copy on Home, About and Contact.
 *
 * Both tables are tiny, so they are fetched whole and indexed client-side.
 */

export const PAGE_CONTENT_KEY = ["page-content"];

export type PageName = "home" | "about" | "services" | "contact";

export type MediaRef = { bucket: string; path: string; alt: string | null };

export type PageContent = {
  media: Record<string, MediaRef>;
  defaults: Record<string, MediaRef>;
  text: Record<string, string>;
};

const keyOf = (page: string, slot: string) => `${page}:${slot}`;

/**
 * The photographs on the public pages are chosen in the database, so a cold
 * page load cannot render an image until that round trip finishes. Keeping the
 * last payload in localStorage lets the very first frame know which
 * photographs to request — the network answer then simply confirms or corrects
 * it.
 */
const CACHE_KEY = "ha:page-content:v1";
const CACHE_TTL = 24 * 60 * 60 * 1000;

function readCache(): PageContent | undefined {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; content: PageContent };
    if (!parsed?.content || Date.now() - parsed.at > CACHE_TTL) return undefined;
    return parsed.content;
  } catch {
    return undefined;
  }
}

function writeCache(content: PageContent) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), content }));
  } catch {
    /* storage full or unavailable — the cache is an optimisation only */
  }
}

export function mediaUrl(ref: MediaRef | undefined | null): string | null {
  if (!ref) return null;
  return supabase.storage.from(ref.bucket).getPublicUrl(ref.path).data.publicUrl;
}

export function usePageContent() {
  const query = useQuery({
    queryKey: PAGE_CONTENT_KEY,
    staleTime: 60_000,
    initialData: readCache,
    initialDataUpdatedAt: 0,
    queryFn: async (): Promise<PageContent> => {
      const [media, defaults, text] = await Promise.all([
        supabase.from("page_media").select("page, slot, bucket, path, alt"),
        supabase.from("page_media_defaults").select("page, slot, bucket, path, alt"),
        supabase.from("page_text").select("page, slot, value"),
      ]);
      if (media.error) throw media.error;
      if (defaults.error) throw defaults.error;
      if (text.error) throw text.error;


      const content: PageContent = { media: {}, defaults: {}, text: {} };
      for (const row of media.data ?? []) {
        content.media[keyOf(row.page, row.slot)] = {
          bucket: row.bucket,
          path: row.path,
          alt: row.alt,
        };
      }
      for (const row of defaults.data ?? []) {
        content.defaults[keyOf(row.page, row.slot)] = {
          bucket: row.bucket,
          path: row.path,
          alt: row.alt,
        };
      }
      for (const row of text.data ?? []) {
        content.text[keyOf(row.page, row.slot)] = row.value;
      }
      return content;
    },
  });

  const content = query.data ?? { media: {}, defaults: {}, text: {} };

  return {
    isLoading: query.isLoading,
    content,
    /** Photograph for a slot, or null when the client has not chosen one. */
    image(page: PageName, slot: string): MediaRef | null {
      return content.media[keyOf(page, slot)] ?? null;
    },
    imageUrl(page: PageName, slot: string): string | null {
      return mediaUrl(content.media[keyOf(page, slot)]);
    },
    /** Developer-set default for a slot, used when nothing has been chosen. */
    defaultImage(page: PageName, slot: string): MediaRef | null {
      return content.defaults[keyOf(page, slot)] ?? null;
    },
    /** Copy for a slot, falling back to the wording written into the code. */
    copy(page: PageName, slot: string, fallback: string): string {
      const value = content.text[keyOf(page, slot)];
      return value && value.trim().length > 0 ? value.trim() : fallback;
    },
  };
}

