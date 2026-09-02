import { QueryClient } from "@tanstack/react-query";

/**
 * One query client, created outside the React tree so the boot script can warm
 * it before the first render.
 */
export const queryClient = new QueryClient();

/**
 * Starts the two queries every public page depends on — editable page content
 * and the published project list — the moment the bundle executes, rather than
 * waiting for a lazily-loaded page chunk to mount. This is what lets the
 * browser learn the hero photograph's URL roughly a second earlier.
 */
export async function prefetchBootData() {
  const [{ PAGE_CONTENT_KEY, fetchPageContent }, { fetchPublicProjects }] = await Promise.all([
    import("@/hooks/usePageContent"),
    import("@/hooks/usePublicProjects"),
  ]);

  void queryClient.prefetchQuery({
    queryKey: PAGE_CONTENT_KEY,
    queryFn: fetchPageContent,
    staleTime: 60_000,
  });
  void queryClient.prefetchQuery({
    queryKey: ["public-projects"],
    queryFn: fetchPublicProjects,
    staleTime: 5 * 60_000,
  });
}
