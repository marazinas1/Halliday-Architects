// Dynamic sitemap: static pages + every published project at /projects/:slug.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BASE_URL = "https://www.hallidayleonard.com";

const STATIC_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/testimonials", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("published", true);

  if (error) {
    return new Response(`sitemap error: ${error.message}`, { status: 500 });
  }

  const urls: string[] = [];

  for (const p of STATIC_PAGES) {
    urls.push(
      `  <url><loc>${BASE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    );
  }

  for (const row of data ?? []) {
    const slug = xmlEscape(String(row.slug));
    const lastmod = row.updated_at ? new Date(row.updated_at).toISOString().slice(0, 10) : null;
    urls.push(
      `  <url><loc>${BASE_URL}/projects/${slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>0.8</priority></url>`,
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
      "Access-Control-Allow-Origin": "*",
    },
  });
});
