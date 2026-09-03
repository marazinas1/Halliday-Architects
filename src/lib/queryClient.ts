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
  // Routes that load this data themselves (the homepage) hand it over already
  // hydrated from the server; re-requesting it here would double the traffic.
  const needs = (key: readonly unknown[]) =>
    queryClient.getQueryState(key as unknown[])?.data === undefined;

  const [{ PAGE_CONTENT_KEY, fetchPageContent }, { fetchPublicProjects }] = await Promise.all([
    import("@/hooks/usePageContent"),
    import("@/hooks/usePublicProjects"),
  ]);

  if (needs(PAGE_CONTENT_KEY)) {
    void queryClient.prefetchQuery({
      queryKey: PAGE_CONTENT_KEY,
      queryFn: fetchPageContent,
      staleTime: 60_000,
    });
  }
  if (needs(["public-projects"])) {
    void queryClient.prefetchQuery({
      queryKey: ["public-projects"],
      queryFn: fetchPublicProjects,
      staleTime: 5 * 60_000,
    });
  }
}
