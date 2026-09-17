# Go-live checklist — hallidayarchitects.com

The site currently runs on the temporary domain `ha.stagehomy.com` and is
deliberately hidden from search engines. Everything below is done on launch
day, in this order.

## 1. Lift the crawler block (one commit, both changes together)

Leaving one of these in place while lifting the other either keeps the site
invisible or lets the preview domain get indexed.

- [ ] `src/routes/__root.tsx` — remove the `{ name: "robots", content: "noindex, nofollow" }`
      meta tag and the TEMPORARY comment above it.
- [ ] `public/robots.txt` — replace the whole file with:

      User-agent: *
      Allow: /
      Disallow: /admin
      Sitemap: https://www.hallidayarchitects.com/sitemap.xml

## 2. Domain

- [ ] Connect `hallidayarchitects.com` (and `www`) in Lovable and publish.
- [ ] Set `APP_BASE_URL` to the live domain so invitation and password links
      point at the real site.
- [ ] Confirm `https://www.hallidayarchitects.com/sitemap.xml` renders — it is
      generated per request from the live host, so no code change is needed.
- [ ] Submit the sitemap in Google Search Console and request indexing of the
      homepage, `/projects` and `/services`.

## 3. Retire the temporary setup

- [ ] Remove the `ha.stagehomy.com` subdomain and its DNS records.
- [ ] Delete the legacy `sitemap` backend function (kept live only as rollback
      cover until the migrated site is published and verified).

## 4. Final checks on the live domain

- [ ] Every page has its own title and description (`curl -s <url> | grep -i '<title>'`).
- [ ] Contact form arrives in the inbox and emails the recipients set in Settings.
- [ ] Sign in works for Chris and Shannon; invited users land on `/admin/set-password`.
- [ ] Maintenance mode is off.
- [ ] Analytics is recording views on the live domain.
- [ ] Lighthouse: SEO and Accessibility 95+ on the homepage and one project page.
- [ ] Social preview: paste a project URL into a message and confirm the image
      and text look right.
