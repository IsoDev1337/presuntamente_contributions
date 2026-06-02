/**
 * OG image por persona: /og/personas/<slug>.png
 *
 * Composición: nombre completo + cargo público actual (o "Figura
 * pública/privada") + badge del rol procesal más reciente activo + cifras
 * (casos donde aparece · roles totales).
 *
 * El "rol actual" es el primer rol sin `fecha_fin` ordenando por
 * `fecha_inicio` descendente (mismo criterio que `PgPersonaDetalle.astro`).
 * Si no hay roles activos, se usa el último rol cerrado.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { renderOgPersona, rolOgStyle } from '@/lib/og';
import { rolLabel } from '@/lib/labels';
import { entidadesEnCasosVisibles } from '@/lib/visibilidad';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const personas = await getCollection('personas');
  if (import.meta.env.DEV) return personas.map((p) => ({ params: { slug: p.id } }));
  const [casos, roles, hechos, hitos, vinculos, documentos] = await Promise.all([
    getCollection('casos'),
    getCollection('roles'),
    getCollection('hechos'),
    getCollection('hitos'),
    getCollection('vinculos'),
    getCollection('documentos'),
  ]);
  const { personas: visibles } = entidadesEnCasosVisibles({ casos, roles, hechos, hitos, vinculos, documentos });
  return personas.filter((p) => visibles.has(p.data.id)).map((p) => ({ params: { slug: p.id } }));
};

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug!;

  const [personas, roles] = await Promise.all([
    getCollection('personas'),
    getCollection('roles'),
  ]);

  const persona = personas.find((p) => p.id === slug);
  if (!persona) return new Response('Not found', { status: 404 });
  const data = persona.data;

  const rolesPersona = roles
    .filter((r) => r.data.sujeto_tipo === 'persona' && r.data.sujeto_persona_id === data.id)
    .sort((a, b) => b.data.fecha_inicio.localeCompare(a.data.fecha_inicio));

  const casosUnicos = new Set(rolesPersona.map((r) => r.data.caso_id));

  // Rol más representativo: primero el más reciente activo; si no, el más
  // reciente cerrado. Devuelve undefined si la persona no tiene roles
  // todavía (p.ej. perfil cargado sin asignaciones).
  const rolActivo = rolesPersona.find((r) => !r.data.fecha_fin);
  const rolReferencia = rolActivo ?? rolesPersona[0];

  const subtitulo =
    data.cargo_publico_actual ??
    (data.es_figura_publica ? 'Figura pública' : 'Figura privada');

  const png = await renderOgPersona({
    nombreCompleto: data.nombre_completo,
    subtitulo,
    rolActualLabel: rolReferencia ? rolLabel(rolReferencia.data.rol) : undefined,
    rolActualColor: rolReferencia ? rolOgStyle(rolReferencia.data.rol) : undefined,
    stats: [
      { label: casosUnicos.size === 1 ? 'caso' : 'casos',          value: casosUnicos.size },
      { label: rolesPersona.length === 1 ? 'rol' : 'roles totales', value: rolesPersona.length },
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
