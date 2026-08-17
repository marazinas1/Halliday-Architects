// Prebuild: fetch published portfolio projects from the database and write
// public/sitemap.xml so Lovable static hosting serves /sitemap.xml.
// The same list is available dynamically via the `sitemap` edge function.

import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://halliday-architects.lovable.app";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ?? "https://cbngutdwgciuvpbzpmoy.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/team", changefreq: "monthly", priority: "0.6" },
  { path: "/services", changefreq: "monthly", priority: "0.8" },
  { path: "/projects", changefreq: "weekly", priority: "0.9" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
];

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function fetchProjects(): Promise<
  Array<{ slug: string; updated_at: string | null }>
> {
  if (!SUPABASE_ANON_KEY) return [];
  const url = `${SUPABASE_URL}/rest/v1/projects?select=slug,updated_at&published=eq.true`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    console.warn(`[sitemap] projects fetch failed: ${res.status}`);
    return [];
  }
  return res.json();
}

async function main() {
  const projects = await fetchProjects();

  const urls: string[] = [];
  for (const p of STATIC_PAGES) {
    urls.push(
      `  <url><loc>${BASE_URL}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`,
    );
  }
  for (const row of projects) {
    const slug = xmlEscape(String(row.slug));
    const lastmod = row.updated_at
      ? new Date(row.updated_at).toISOString().slice(0, 10)
      : null;
    urls.push(
      `  <url><loc>${BASE_URL}/projects/${slug}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<priority>0.7</priority></url>`,
    );
  }


  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(
    `sitemap.xml written (${STATIC_PAGES.length} static + ${projects.length} projects)`,
  );
}

main().catch((err) => {
  console.error("[sitemap] generation failed:", err);
  process.exit(0); // don't block the build
});