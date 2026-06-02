/**
 * OG image por defecto del sitio.
 *
 * Servida como og:image en todas las páginas que no tienen una OG card
 * propia (inicio, /casos, /personas, /organizaciones, /biblioteca,
 * /delitos, /cifras, /sobre, /aviso-legal, /buscar, /rectificar).
 *
 * Contenido: identidad del proyecto + cifras agregadas del inventario.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgDefault } from '@/lib/og';
import { idsCasosVisibles, entidadesEnCasosVisibles } from '@/lib/visibilidad';

export const prerender = true;

export const GET: APIRoute = async () => {
  const [casos, personas, organizaciones, documentos, roles, hechos, hitos, vinculos] = await Promise.all([
    getCollection('casos'),
    getCollection('personas'),
    getCollection('organizaciones'),
    getCollection('documentos'),
    getCollection('roles'),
    getCollection('hechos'),
    getCollection('hitos'),
    getCollection('vinculos'),
  ]);

  // Cifras del sello: en prod sólo el inventario visible (igual que /cifras).
  const casosVis = idsCasosVisibles(casos);
  const ent = entidadesEnCasosVisibles({
    casos,
    roles,
    hechos: hechos as unknown as { data: { caso_id: string; personas_implicadas?: string[]; organizaciones_implicadas?: string[] } }[],
    hitos,
    vinculos,
    documentos,
  });
  const docsVis = documentos.filter((d) => !d.data.caso_principal_id || casosVis.has(d.data.caso_principal_id)).length;

  const png = await renderOgDefault({
    title: 'Inventario público de casos de corrupción en España',
    subtitle:
      'Cada afirmación con su fuente y nivel. Tratamiento sin cuota política. Open source bajo AGPL-3.0 y CC BY-SA 4.0.',
    stats: [
      { label: 'casos',          value: casosVis.size },
      { label: 'personas',       value: ent.personas.size },
      { label: 'organizaciones', value: ent.organizaciones.size },
      { label: 'documentos',     value: docsVis },
    ],
  });

  return new Response(png, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
