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

export function mediaUrl(ref: MediaRef | undefined | null): string | null {
  if (!ref) return null;
  return supabase.storage.from(ref.bucket).getPublicUrl(ref.path).data.publicUrl;
}

/** Standalone fetcher so the boot script can warm this query before render. */
export async function fetchPageContent(): Promise<PageContent> {
    {
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
    }
}

export function usePageContent() {
  const query = useQuery({
    queryKey: PAGE_CONTENT_KEY,
    staleTime: 60_000,
    queryFn: fetchPageContent,
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

