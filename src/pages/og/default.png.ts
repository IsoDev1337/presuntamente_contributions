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

export const prerender = true;

export const GET: APIRoute = async () => {
  const [casos, personas, organizaciones, documentos] = await Promise.all([
    getCollection('casos'),
    getCollection('personas'),
    getCollection('organizaciones'),
    getCollection('documentos'),
  ]);

  const png = await renderOgDefault({
    title: 'Inventario público de casos de corrupción en España',
    subtitle:
      'Cada afirmación con su fuente y nivel. Tratamiento sin cuota política. Open source bajo AGPL-3.0 y CC BY-SA 4.0.',
    stats: [
      { label: 'casos',          value: casos.length },
      { label: 'personas',       value: personas.length },
      { label: 'organizaciones', value: organizaciones.length },
      { label: 'documentos',     value: documentos.length },
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
