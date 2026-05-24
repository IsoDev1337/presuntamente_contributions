// Atom 1.0 feed de los hitos más recientes del inventario.
//
// Servido como `/feed.xml`. Es la variante moderna y preferida frente a
// `/rss.xml` (RSS 2.0), que coexiste por compatibilidad con lectores
// antiguos. Misma fuente de datos (`getFeedItems`), serialización distinta.

import type { APIRoute } from 'astro';
import {
  feedItemTitle,
  flattenForFeed,
  getFeedItems,
  toAtomDate,
  xmlEscape,
} from '@/lib/feed';

export const GET: APIRoute = async ({ site }) => {
  // `site` está garantizado por la configuración (`astro.config.mjs` define
  // `site: 'https://presuntamente.org'`). El non-null assertion es seguro en
  // build estático.
  const siteUrl = site!;
  const selfUrl = new URL('/feed.xml', siteUrl).toString();
  const homeUrl = siteUrl.toString();

  const items = await getFeedItems(siteUrl);
  // `updated` del feed: la fecha del item más reciente, o el momento del
  // build si el inventario está vacío.
  const feedUpdated =
    items.length > 0 ? toAtomDate(items[0].fecha) : new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const entries = items
    .map((it) => {
      const body = flattenForFeed(it.descripcion ?? it.titulo);
      return [
        '  <entry>',
        `    <title>${xmlEscape(feedItemTitle(it))}</title>`,
        `    <link rel="alternate" type="text/html" href="${xmlEscape(it.url)}"/>`,
        `    <id>${xmlEscape(it.tagId)}</id>`,
        `    <published>${toAtomDate(it.fecha)}</published>`,
        `    <updated>${toAtomDate(it.fecha)}</updated>`,
        `    <category term="${xmlEscape(it.tipo)}" label="${xmlEscape(it.tipoLabel)}"/>`,
        `    <category term="caso:${xmlEscape(it.casoId)}" label="${xmlEscape(it.casoNombre)}"/>`,
        `    <summary type="text">${xmlEscape(body)}</summary>`,
        '  </entry>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="es">
  <title>presuntamente · Hitos recientes</title>
  <subtitle>Nuevos hitos en el inventario público de casos de corrupción en España.</subtitle>
  <link rel="self" type="application/atom+xml" href="${xmlEscape(selfUrl)}"/>
  <link rel="alternate" type="text/html" href="${xmlEscape(homeUrl)}"/>
  <id>tag:presuntamente.org,2026:hitos</id>
  <updated>${feedUpdated}</updated>
  <generator uri="https://astro.build" version="5">Astro</generator>
  <rights>Contenido bajo CC BY-SA 4.0 · presuntamente.org</rights>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
};
