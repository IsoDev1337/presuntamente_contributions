// richProse — detecta acrónimos y cifras monetarias en texto plano y los
// envuelve en HTML compatible con los micro-componentes inline del DESIGN
// (§4 "Micro-componentes de citación inline"):
//
//   - Acrónimos institucionales y nombres con slug en /content/organizaciones/
//     → <a class="acron acron--link" href="/organizaciones/<slug>" title="…">
//     o <span class="acron"> si no existe el slug.
//   - Cifras monetarias (53,5 M€, 2,1 millones de euros, 5.000.000 €)
//     → <span class="money">…</span>.
//
// El texto original se escapa siempre antes de aplicar las sustituciones, de
// modo que cualquier HTML accidental en los YAML queda neutralizado.
//
// La lista blanca de acrónimos institucionales (UDEF, UCO, AN…) vive aquí
// y se complementa dinámicamente con los nombres_alternativos cortos de
// las organizaciones del inventario (≤6 caracteres, mayúsculas) — eso
// permite que cualquier organización con siglas conocidas (SEPI, JCI nº 4,
// CGPJ) se detecte sin tocar esta lista cuando se añadan al inventario.

type OrgLite = {
  id: string;
  nombre: string;
  nombres_alternativos?: string[];
  siglas?: string;
};

/** Lista blanca base de acrónimos institucionales que se citan en prosa
 *  procesal española. Si la organización existe en /content/organizaciones/
 *  con un slug equivalente, se enlaza; si no, se renderiza con tooltip
 *  (sin link). Texto canónico tomado de DESIGN.md §4. */
const ACRONIMOS_BASE: Record<string, string> = {
  UDEF: 'Unidad de Delincuencia Económica y Fiscal',
  UCO: 'Unidad Central Operativa de la Guardia Civil',
  AN: 'Audiencia Nacional',
  TS: 'Tribunal Supremo',
  TC: 'Tribunal Constitucional',
  TSJ: 'Tribunal Superior de Justicia',
  AP: 'Audiencia Provincial',
  JCI: 'Juzgado Central de Instrucción',
  JI: 'Juzgado de Instrucción',
  BOE: 'Boletín Oficial del Estado',
  CGPJ: 'Consejo General del Poder Judicial',
  SEPI: 'Sociedad Estatal de Participaciones Industriales',
  AEAT: 'Agencia Estatal de Administración Tributaria',
  FGE: 'Fiscalía General del Estado',
  CIS: 'Centro de Investigaciones Sociológicas',
  AIReF: 'Autoridad Independiente de Responsabilidad Fiscal',
  CNMV: 'Comisión Nacional del Mercado de Valores',
  CNMC: 'Comisión Nacional de los Mercados y la Competencia',
  IGAE: 'Intervención General de la Administración del Estado',
  PSOE: 'Partido Socialista Obrero Español',
  PP: 'Partido Popular',
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface EnrichOpts {
  orgs: OrgLite[];
  /** Lang del sitio actual, para construir rutas /personas/x vs /cat/personas/x. */
  lang?: 'es' | 'ca';
}

/** Tokeniza una string y devuelve HTML con las citaciones inline aplicadas.
 *  El input se escapa primero; las sustituciones operan sobre el HTML
 *  escapado y emiten HTML seguro. */
export function richProse(input: string, opts: EnrichOpts): string {
  if (!input) return '';
  const { orgs, lang = 'es' } = opts;
  const orgsPrefix = lang === 'ca' ? '/cat/organizaciones' : '/organizaciones';

  // 1. Escapar HTML del texto entero.
  let html = escapeHtml(input);

  // 2. Money: regex estricta para evitar falsos positivos.
  //    Captura: 53 M€, 53,5 M€, 2.1 millones de euros, 5.000.000 €, 1 millón
  //    de euros. NO captura: 53 (sin unidad), año 2025, "art. 432 CP".
  const moneyRe =
    /\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\s*(M€|m€|millones?\s+de\s+euros|millón\s+de\s+euros|euros|€)\b/g;
  html = html.replace(moneyRe, (_full, amount, unit) => {
    // Sin espacio sólo para "M€", "m€" y "€" (ya pegados por convención).
    // Para "millones de euros", "millón de euros" y "euros" sí espacio.
    const noSpace = unit === 'M€' || unit === 'm€' || unit === '€';
    const formatted = `${amount}${noSpace ? '' : ' '}${unit}`.replace(/\s+/g, ' ').trim();
    return `<span class="money" data-money>${formatted}</span>`;
  });

  // 3. Construir lista de acrónimos efectivos: base + alias cortos de orgs.
  //    Para cada acrónimo / alias, buscamos su slug en orgs (match exacto
  //    por id, por nombre, por nombres_alternativos o por siglas). Si lo
  //    encontramos, generamos link; si no, span con tooltip si tenemos
  //    descripción base.
  type AcronymRule = { term: string; href?: string; tooltip?: string };
  const rules: AcronymRule[] = [];
  const seen = new Set<string>();

  function findOrgBy(term: string): OrgLite | undefined {
    const lower = term.toLowerCase();
    return orgs.find((o) => {
      if (o.id.toLowerCase() === lower) return true;
      if (o.nombre.toLowerCase() === lower) return true;
      if ((o.siglas ?? '').toLowerCase() === lower) return true;
      const alts = o.nombres_alternativos ?? [];
      return alts.some((a) => a.toLowerCase() === lower);
    });
  }

  // a) Acrónimos base
  for (const [term, tooltip] of Object.entries(ACRONIMOS_BASE)) {
    if (seen.has(term)) continue;
    seen.add(term);
    const match = findOrgBy(term);
    rules.push({
      term,
      href: match ? `${orgsPrefix}/${match.id}` : undefined,
      tooltip: match?.nombre ?? tooltip,
    });
  }

  // b) Alias cortos de organizaciones del inventario que no estén en la
  //    base. Solo añadimos siglas (todo mayúsculas, longitud 2-8) para
  //    minimizar falsos positivos con texto en prosa.
  for (const o of orgs) {
    const candidates = new Set<string>();
    if (o.siglas) candidates.add(o.siglas);
    for (const a of o.nombres_alternativos ?? []) candidates.add(a);
    for (const term of candidates) {
      // Sólo siglas en mayúsculas de longitud razonable (evita "Madrid" o
      // "Audiencia Nacional" como term — esos no son siglas; el long
      // "Audiencia Nacional" ya se cubre con el match "AN").
      if (!/^[A-ZÁÉÍÓÚÑ0-9.º\sº]{2,12}$/.test(term)) continue;
      if (seen.has(term)) continue;
      seen.add(term);
      rules.push({
        term,
        href: `${orgsPrefix}/${o.id}`,
        tooltip: o.nombre,
      });
    }
  }

  // 4. Aplicar acrónimos. Importante: NO sustituir dentro de etiquetas HTML
  //    ya generadas (Money, otros Acronym, etc.). Construimos una regex con
  //    word boundary que ignore matches dentro de <span class="money"> o
  //    <a class="acron">. La heurística: lookahead negativo de "..." o ">"
  //    no la podemos hacer trivialmente con regex JS sin DOM real. En
  //    cambio, procesamos por fragmentos: dividimos el HTML por las
  //    etiquetas que ya generamos y solo procesamos los fragmentos de
  //    texto puros entre ellas.
  const segments = html.split(/(<span class="money"[^>]*>[^<]*<\/span>|<a class="acron[^"]*"[^>]*>[^<]*<\/a>|<span class="acron"[^>]*>[^<]*<\/span>)/);
  for (let i = 0; i < segments.length; i++) {
    // Los segmentos pares son texto; los impares son las etiquetas ya
    // construidas que dejamos intactas.
    if (i % 2 === 1) continue;
    let frag = segments[i];
    for (const rule of rules) {
      // word boundary tolerante a puntos (JCI nº 4 → match "JCI"), pero
      // sin partir dentro de palabras compuestas.
      const re = new RegExp(`(^|[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9])(${escapeRegex(rule.term)})(?=$|[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9])`, 'g');
      frag = frag.replace(re, (_full, pre, term) => {
        const tooltip = rule.tooltip ? ` title="${escapeHtml(rule.tooltip)}"` : '';
        if (rule.href) {
          return `${pre}<a class="acron acron--link" href="${rule.href}"${tooltip}>${term}</a>`;
        }
        return `${pre}<span class="acron"${tooltip}>${term}</span>`;
      });
    }
    segments[i] = frag;
  }

  return segments.join('');
}
