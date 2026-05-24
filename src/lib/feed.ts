// Helpers compartidos por los endpoints /feed.xml (Atom 1.0) y /rss.xml (RSS 2.0).
//
// Un "item de feed" es un Hito del inventario. Se incluyen los N hitos más
// recientes por `fecha` descendente, etiquetados con el caso al que pertenecen.
// El enlace lleva a la ficha del caso con ancla al hito concreto
// (`/casos/<slug>#hito-<hito-id>`), aprovechando el ancla estable que
// `Hito.astro` renderiza desde 2026-05-24 (campo `id`) y el flash visual de
// `:target` documentado en DESIGN.md §5 "Navegación interna en fichas largas".

import { getCollection } from 'astro:content';
import { tipoHitoLabel } from './labels';

/** Cuántos hitos se publican en el feed. Suficiente para periodistas que se
 *  suscriben (cubre ~3-6 meses al ritmo actual) sin inflar el XML. */
export const FEED_LIMIT = 50;

export interface FeedItem {
  /** Slug del Hito. */
  id: string;
  /** Slug del caso al que pertenece. */
  casoId: string;
  /** Nombre mediático del caso, para anteponerlo al título. */
  casoNombre: string;
  /** Título del Hito tal como aparece en la ficha. */
  titulo: string;
  /** Markdown ligero. Puede no existir; usar `titulo` como fallback. */
  descripcion?: string;
  /** Enum `tipo` del Hito (sin traducir). Útil como categoría. */
  tipo: string;
  /** Label legible del tipo (castellano). */
  tipoLabel: string;
  /** YYYY-MM-DD. La precisión real puede ser día/mes/año; en RSS/Atom siempre
   *  toca decidir un timestamp concreto. Para mes/año se usa el primer día y
   *  mediodía UTC (ver `toTimestamp`). */
  fecha: string;
  /** Precisión real declarada en el YAML, útil si en el futuro se quiere
   *  matizar la presentación. */
  precision: 'dia' | 'mes' | 'anio';
  /** URL absoluta canónica del item. */
  url: string;
  /** Identificador estable e independiente de la URL, formato Tag URI
   *  (RFC 4151). Útil como Atom <id> y RSS <guid isPermaLink="false">. */
  tagId: string;
}

/**
 * Devuelve los items del feed ordenados por fecha descendente y limitados a
 * `FEED_LIMIT`. Se omiten hitos cuyo caso no existe en la collection (refs
 * rotas, defensa en profundidad — `pnpm validate` ya las atrapa). El filtro
 * por `estado_publicacion` queda intencionalmente fuera: el resto del sitio
 * (PgCasos, PgCasoDetalle, etc.) tampoco filtra hoy, y todo el inventario
 * está en `borrador` durante el MVP. Si en el futuro se activa un gate
 * site-wide por `publicado`, este endpoint hereda la decisión sin cambios.
 */
export async function getFeedItems(siteUrl: URL): Promise<FeedItem[]> {
  const [hitos, casos] = await Promise.all([
    getCollection('hitos'),
    getCollection('casos'),
  ]);

  const casoIndex = new Map(casos.map((c) => [c.data.id, c.data]));

  const items: FeedItem[] = [];
  for (const h of hitos) {
    const caso = casoIndex.get(h.data.caso_id);
    if (!caso) continue;

    items.push({
      id: h.data.id,
      casoId: h.data.caso_id,
      casoNombre: caso.nombre_mediatico,
      titulo: h.data.titulo,
      descripcion: h.data.descripcion,
      tipo: h.data.tipo,
      tipoLabel: tipoHitoLabel(h.data.tipo),
      fecha: h.data.fecha,
      precision: h.data.fecha_precision,
      url: new URL(`/casos/${h.data.caso_id}#hito-${h.data.id}`, siteUrl).toString(),
      tagId: `tag:presuntamente.org,${h.data.fecha}:hito/${h.data.id}`,
    });
  }

  items.sort((a, b) => b.fecha.localeCompare(a.fecha));
  return items.slice(0, FEED_LIMIT);
}

// --- Formateo de fechas ------------------------------------------------------

/** Mediodía UTC del día del Hito. Evita ambigüedades de zona horaria sin
 *  inventar hora real (los YAML guardan sólo la fecha). */
function toDate(yyyyMmDd: string): Date {
  return new Date(`${yyyyMmDd}T12:00:00Z`);
}

/** ISO 8601 con segundos y zona UTC, exigido por Atom (RFC 4287 §3.3 → RFC 3339). */
export function toAtomDate(yyyyMmDd: string): string {
  return toDate(yyyyMmDd).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** RFC 822, exigido por RSS 2.0. */
export function toRssDate(yyyyMmDd: string): string {
  const d = toDate(yyyyMmDd);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${DOW[d.getUTCDay()]}, ${pad(d.getUTCDate())} ${MON[d.getUTCMonth()]} ${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} +0000`;
}

// --- Escape XML --------------------------------------------------------------

/** Escape mínimo y suficiente para texto y atributos XML. */
export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Aplana markdown ligero (block scalars YAML con saltos de línea, alguna
 *  marca Markdown suelta) a texto plano de una línea, recortando whitespace
 *  repetido. No interpreta sintaxis Markdown — los hitos no usan estructuras
 *  complejas en `descripcion`. */
export function flattenForFeed(s: string, max = 600): string {
  const flat = s.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max - 1).trimEnd() + '…';
}

/** Título del item: prefijo con caso y tipo procesal para que un lector de
 *  feed entienda contexto sin abrir el enlace. */
export function feedItemTitle(item: FeedItem): string {
  return `[${item.casoNombre} · ${item.tipoLabel}] ${item.titulo}`;
}
