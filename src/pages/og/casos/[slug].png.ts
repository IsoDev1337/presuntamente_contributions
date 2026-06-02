/**
 * OG image por caso: /og/casos/<slug>.png
 *
 * Composición: nombre mediático + nombre oficial + badge de fase + último
 * hito (fecha + título) + cifras (procesados · hitos · documentos).
 *
 * La cifra "procesados" cuenta personas únicas con rol procesal del lado
 * acusado (imputacion_activa o condenado, conforme a `rolGrupo()` de
 * `lib/labels.ts`). NO cuenta jueces, fiscales, abogados, ni acusación
 * popular — la card vende el caso por su carga procesal contra personas.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgCaso } from '@/lib/og';
import { rolGrupo } from '@/lib/labels';
import { casoVisibleAqui } from '@/lib/visibilidad';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const casos = await getCollection('casos');
  // Sin OG card para casos no publicados en prod (la ficha tampoco se genera).
  return casos
    .filter((c) => casoVisibleAqui(c.data.estado_publicacion))
    .map((c) => ({ params: { slug: c.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;

  const [casos, hitos, roles, documentos] = await Promise.all([
    getCollection('casos'),
    getCollection('hitos'),
    getCollection('roles'),
    getCollection('documentos'),
  ]);

  const caso = casos.find((c) => c.id === slug);
  if (!caso) return new Response('Not found', { status: 404 });
  const data = caso.data;

  const hitosDelCaso = hitos
    .filter((h) => h.data.caso_id === data.id)
    .sort((a, b) => b.data.fecha.localeCompare(a.data.fecha));
  const ultimo = hitosDelCaso[0]?.data;

  // Personas únicas con rol procesal de imputación activa o condena en el caso.
  const procesados = new Set<string>();
  for (const r of roles) {
    if (r.data.caso_id !== data.id) continue;
    if (r.data.sujeto_tipo !== 'persona' || !r.data.sujeto_persona_id) continue;
    const grupo = rolGrupo(r.data.rol);
    if (grupo === 'imputacion_activa' || grupo === 'condenado') {
      procesados.add(r.data.sujeto_persona_id);
    }
  }

  // Documentos asociados al caso (caso_principal_id + referenciados por hitos).
  const docIds = new Set<string>();
  for (const d of documentos) {
    if (d.data.caso_principal_id === data.id) docIds.add(d.data.id);
  }
  for (const h of hitosDelCaso) {
    const did = h.data.documento_principal_id;
    if (did) docIds.add(did);
  }

  const png = await renderOgCaso({
    nombreMediatico: data.nombre_mediatico,
    nombreOficial: data.nombre_oficial,
    fase: data.fase_actual,
    ultimoHito: ultimo ? { fecha: ultimo.fecha, titulo: ultimo.titulo } : null,
    stats: [
      { label: procesados.size === 1 ? 'procesada/o' : 'procesados', value: procesados.size },
      { label: hitosDelCaso.length === 1 ? 'hito' : 'hitos',         value: hitosDelCaso.length },
      { label: docIds.size === 1 ? 'documento' : 'documentos',       value: docIds.size },
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
