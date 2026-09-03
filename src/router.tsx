import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "./routeTree.gen";
import { queryClient as browserQueryClient } from "./lib/queryClient";

export const getRouter = () => {
  // On the client, reuse the singleton so the boot-time prefetch in
  // src/lib/queryClient.ts warms the same cache the app reads from.
  // On the server, a fresh client per request avoids cross-request leakage.
  const queryClient = typeof window === "undefined" ? new QueryClient() : browserQueryClient;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  // Serialises anything a loader put in the query cache on the server into the
  // HTML, and hydrates it into the browser cache — so a route loader's data is
  // in the first painted frame instead of being refetched after hydration.
  setupRouterSsrQueryIntegration({ router, queryClient });

  return router;
};
