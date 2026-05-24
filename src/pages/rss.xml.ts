// RSS 2.0 feed de los hitos más recientes del inventario.
//
// Servido como `/rss.xml`. Coexiste con `/feed.xml` (Atom 1.0) por
// compatibilidad: la inmensa mayoría de lectores soporta ambos, pero algunos
// agregadores antiguos y muchos clientes de email/RSS sólo entienden RSS 2.0.

import type { APIRoute } from 'astro';
import {
  feedItemTitle,
  flattenForFeed,
  getFeedItems,
  toRssDate,
  xmlEscape,
} from '@/lib/feed';

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site!;
  const selfUrl = new URL('/rss.xml', siteUrl).toString();
  const homeUrl = siteUrl.toString();

  const items = await getFeedItems(siteUrl);
  const lastBuild =
    items.length > 0 ? toRssDate(items[0].fecha) : toRssDate(new Date().toISOString().slice(0, 10));

  const entries = items
    .map((it) => {
      const body = flattenForFeed(it.descripcion ?? it.titulo);
      return [
        '    <item>',
        `      <title>${xmlEscape(feedItemTitle(it))}</title>`,
        `      <link>${xmlEscape(it.url)}</link>`,
        `      <guid isPermaLink="false">${xmlEscape(it.tagId)}</guid>`,
        `      <pubDate>${toRssDate(it.fecha)}</pubDate>`,
        `      <category>${xmlEscape(it.tipoLabel)}</category>`,
        `      <category>${xmlEscape(it.casoNombre)}</category>`,
        `      <description>${xmlEscape(body)}</description>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>presuntamente · Hitos recientes</title>
    <link>${xmlEscape(homeUrl)}</link>
    <description>Nuevos hitos en el inventario público de casos de corrupción en España.</description>
    <language>es</language>
    <copyright>Contenido bajo CC BY-SA 4.0 · presuntamente.org</copyright>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>Astro</generator>
    <atom:link href="${xmlEscape(selfUrl)}" rel="self" type="application/rss+xml"/>
${entries}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
