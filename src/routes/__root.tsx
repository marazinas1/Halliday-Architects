import { Suspense, useEffect, type ReactNode } from "react";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ScrollToTop from "@/components/ScrollToTop";
import NotFound from "@/pages/NotFound";
import { useFaviconFromSettings } from "@/hooks/useSiteSettings";
import { usePageTracking } from "@/hooks/usePageTracking";
import { prefetchBootData } from "@/lib/queryClient";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

// ported from main.tsx — fire the content queries as soon as the app is
// interactive. This must NOT run before hydration: warming the cache mid-race
// made the client's first render differ from the server's HTML, which React
// reports as a hydration mismatch. RootComponent kicks it off in an effect.

const STRUCTURED_DATA = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ArchitecturalService",
  name: "Halliday Architects",
  telephone: "+1-609-957-6789",
  faxNumber: "+1-609-337-1758",
  email: "chris@hallidayarchitects.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "728 West Avenue, Suite A",
    addressLocality: "Ocean City",
    addressRegion: "NJ",
    postalCode: "08226",
    addressCountry: "US",
  },
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "Halliday Architects | Architecture Practice in Ocean City, NJ" },
      {
        name: "description",
        content:
          "Halliday Architects is an architecture practice in Ocean City, New Jersey, working on residential architecture along the Jersey shore.",
      },
      { name: "author", content: "Halliday Architects" },
      // TEMPORARY: preview domain (ha.stagehomy.com) must not be indexed.
      // Remove this meta tag at go-live on hallidayarchitects.com and switch
      // public/robots.txt to Allow: / at the same time.
      { name: "robots", content: "noindex, nofollow" },
      {
        property: "og:title",
        content: "Halliday Architects | Architecture Practice in Ocean City, NJ",
      },
      { property: "og:description", content: "Residential architecture in Ocean City, New Jersey." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Halliday Architects" },
      { name: "twitter:description", content: "Architecture practice in Ocean City, New Jersey." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      // Backend + image storage: open the connection before the first query.
      { rel: "preconnect", href: "https://cbngutdwgciuvpbzpmoy.supabase.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://cbngutdwgciuvpbzpmoy.supabase.co" },
    ],
    scripts: [{ type: "application/ld+json", children: STRUCTURED_DATA }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const PageFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
  </div>
);

/** Applies an uploaded favicon at runtime. Must sit inside the query provider. */
const FaviconSync = () => {
  useFaviconFromSettings();
  return null;
};

/** First-party pageview ping. Must sit inside the router. */
const AnalyticsTracker = () => {
  usePageTracking();
  return null;
};

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Warm the shared content queries right after hydration completes, so the
  // first client render still matches the server-rendered HTML exactly.
  useEffect(() => {
    void prefetchBootData();
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <FaviconSync />
          <ScrollToTop />
          <AnalyticsTracker />
          <Suspense fallback={<PageFallback />}>
            <Outlet />
          </Suspense>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-8 h-11 text-sm font-medium rounded-sm bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 h-11 text-sm font-medium rounded-sm border border-input bg-background text-foreground transition-colors hover:bg-secondary"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
