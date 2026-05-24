/**
 * OG image por organización: /og/organizaciones/<slug>.png
 *
 * Composición: nombre + tipo (con `tipoOrgLabel`) + descripción corta + cifras
 * (casos donde aparece · documentos producidos).
 *
 * Conteo de casos: mismo criterio que `PgOrganizacionDetalle.astro` —
 * unión de organo_judicial_id + querellante_inicial_id + roles +
 * hechos.organizaciones_implicadas + hitos.organizaciones_afectadas.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgOrganizacion } from '@/lib/og';
import { tipoOrgLabel } from '@/lib/labels';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const orgs = await getCollection('organizaciones');
  return orgs.map((o) => ({ params: { slug: o.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;

  const [orgs, casos, roles, hechos, hitos, documentos] = await Promise.all([
    getCollection('organizaciones'),
    getCollection('casos'),
    getCollection('roles'),
    getCollection('hechos'),
    getCollection('hitos'),
    getCollection('documentos'),
  ]);

  const org = orgs.find((o) => o.id === slug);
  if (!org) return new Response('Not found', { status: 404 });
  const data = org.data;

  const casoIds = new Set<string>();
  for (const c of casos) {
    if (c.data.organo_judicial_id === data.id) casoIds.add(c.data.id);
    if (c.data.querellante_inicial_id === data.id) casoIds.add(c.data.id);
  }
  for (const r of roles) {
    if (r.data.sujeto_tipo === 'organizacion' && r.data.sujeto_organizacion_id === data.id) {
      casoIds.add(r.data.caso_id);
    }
  }
  for (const h of hechos) {
    const oi = (h.data as { organizaciones_implicadas?: string[] }).organizaciones_implicadas;
    if (oi?.includes(data.id)) casoIds.add(h.data.caso_id);
  }
  for (const h of hitos) {
    if (h.data.organizaciones_afectadas?.includes(data.id)) casoIds.add(h.data.caso_id);
  }

  const docsProducidos = documentos.filter((d) => d.data.productor_organizacion_id === data.id).length;

  const stats = [
    { label: casoIds.size === 1 ? 'caso' : 'casos', value: casoIds.size },
  ];
  if (docsProducidos > 0) {
    stats.push({
      label: docsProducidos === 1 ? 'documento producido' : 'documentos producidos',
      value: docsProducidos,
    });
  }

  const png = await renderOgOrganizacion({
    nombre: data.nombre,
    tipoLabel: tipoOrgLabel(data.tipo),
    descripcionCorta: data.descripcion_corta,
    stats,
  });

  return new Response(png, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
