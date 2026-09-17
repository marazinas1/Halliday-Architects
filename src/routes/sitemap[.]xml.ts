import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Sitemap, generated on request. The host comes from the request itself, so
 * the file is correct on the preview domain and on hallidayarchitects.com
 * without a code change at go-live.
 */
const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/blog", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const xmlEscape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const day = (value: string | null) =>
  value ? new Date(value).toISOString().slice(0, 10) : null;

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const supabase = createClient(
          process.env["VITE_SUPABASE_URL"] ?? process.env["SUPABASE_URL"]!,
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!,
          { auth: { persistSession: false } },
        );

        const [projects, posts] = await Promise.all([
          supabase.from("projects").select("slug, updated_at").eq("published", true),
          supabase.from("blog_posts").select("slug, updated_at").eq("published", true),
        ]);

        const urls = STATIC_PAGES.map(
          (page) =>
            `  <url><loc>${origin}${page.path}</loc><changefreq>${page.changefreq}</changefreq><priority>${page.priority}</priority></url>`,
        );

        for (const row of projects.data ?? []) {
          const lastmod = day(row.updated_at);
          urls.push(
            `  <url><loc>${origin}/projects/${xmlEscape(String(row.slug))}</loc>${
              lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
            }<priority>0.8</priority></url>`,
          );
        }

        for (const row of posts.data ?? []) {
          const lastmod = day(row.updated_at);
          urls.push(
            `  <url><loc>${origin}/blog/${xmlEscape(String(row.slug))}</loc>${
              lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
            }<priority>0.6</priority></url>`,
          );
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          status: 200,
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
