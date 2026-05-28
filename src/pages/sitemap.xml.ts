import type { APIRoute } from 'astro';

export const prerender = false;

const BASE = 'https://boursa.mr';
const API  = process.env.PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function url(loc: string, priority: string, changefreq: string, lastmod?: string): string {
  return `
  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  </url>`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Pages statiques
  const staticUrls = [
    url(`${BASE}/fr/`,            '1.0', 'daily',   today),
    url(`${BASE}/ar/`,            '1.0', 'daily',   today),
    url(`${BASE}/fr/vehicules`,   '0.9', 'hourly',  today),
    url(`${BASE}/ar/vehicules`,   '0.9', 'hourly',  today),
    url(`${BASE}/fr/agences`,     '0.8', 'daily',   today),
    url(`${BASE}/ar/agences`,     '0.8', 'daily',   today),
    url(`${BASE}/fr/estimer`,     '0.6', 'monthly', today),
    url(`${BASE}/ar/estimer`,     '0.6', 'monthly', today),
    url(`${BASE}/fr/magazine`,    '0.6', 'weekly',  today),
    url(`${BASE}/ar/magazine`,    '0.6', 'weekly',  today),
    url(`${BASE}/fr/a-propos`,    '0.4', 'monthly', today),
    url(`${BASE}/fr/contact`,     '0.4', 'monthly', today),
  ].join('');

  // Véhicules actifs depuis l'API
  let vehicleUrls = '';
  try {
    let page = 1;
    let lastPage = 1;
    do {
      const res  = await fetch(`${API}/vehicles?status=active&per_page=100&page=${page}`);
      const data = await res.json();
      const vehicles = data.data ?? [];
      lastPage = data.meta?.last_page ?? 1;

      for (const v of vehicles) {
        const lastmod = v.updated_at
          ? new Date(v.updated_at).toISOString().split('T')[0]
          : today;
        vehicleUrls += url(`${BASE}/fr/vehicules/${v.id}`, '0.8', 'weekly', lastmod);
        vehicleUrls += url(`${BASE}/ar/vehicules/${v.id}`, '0.8', 'weekly', lastmod);
      }
      page++;
    } while (page <= lastPage && page <= 20); // max 2000 véhicules
  } catch (e) {
    console.error('Sitemap vehicles error:', e);
  }

  // Agences
  let agencyUrls = '';
  try {
    const res  = await fetch(`${API}/agencies?per_page=100`);
    const data = await res.json();
    for (const a of (data.data ?? [])) {
      agencyUrls += url(`${BASE}/fr/agences/${a.slug}`, '0.7', 'weekly', today);
      agencyUrls += url(`${BASE}/ar/agences/${a.slug}`, '0.7', 'weekly', today);
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}${vehicleUrls}${agencyUrls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
