// Canon de visibilidad pública de casos y de las entidades que cuelgan de ellos.
//
// En el build de producción (`import.meta.env.PROD`) sólo los casos en un
// estado publicado (`beta_publica` | `en_revision` | `publicado`) son
// navegables; los `pendiente` / `borrador` quedan fuera de TODO vector público:
// página de caso, listado /casos, fichas de persona/organización, índices,
// feed, OG images, /cifras y /delitos. En desarrollo local (`import.meta.env.DEV`)
// se muestra todo para que el maintainer itere sobre fichas en construcción.
//
// Antes esta lógica vivía duplicada (PgInicio, PgGraficas, PgCasos,
// casos/[slug].astro, conexiones.ts) y SÓLO cubría la página de caso, la home,
// el listado y el grafo. Las fichas de persona/organización, el feed y los
// índices generaban contenido de casos en `borrador` por la puerta de atrás
// (rol + delitos atribuidos + bio + cifras + hitos recientes). Centralizado y
// extendido a todos los vectores el 2026-06-02, antes de publicar la tanda de
// 12 casos en borrador.

/** Estados de caso navegables en el sitio público (independiente del entorno). */
export const ESTADOS_CASO_VISIBLES: ReadonlySet<string> = new Set([
  'beta_publica',
  'en_revision',
  'publicado',
]);

/**
 * ¿Debe este caso representarse en el contexto de render actual?
 * En `dev` siempre (para iterar); en `prod` sólo si está publicado.
 * Misma semántica que `src/pages/casos/[slug].astro` (genera todas las rutas
 * en dev y sólo las publicadas en prod).
 */
export function casoVisibleAqui(estado: string): boolean {
  return import.meta.env.DEV || ESTADOS_CASO_VISIBLES.has(estado);
}

interface ConEstado {
  data: { id: string; estado_publicacion: string };
}

/** Conjunto de ids de caso visibles en el entorno actual (dev: todos). */
export function idsCasosVisibles(casos: ConEstado[]): Set<string> {
  return new Set(
    casos.filter((c) => casoVisibleAqui(c.data.estado_publicacion)).map((c) => c.data.id),
  );
}

// --- Entidades (persona/organización) ligadas a un caso visible -------------

// Formas mínimas que necesita el cálculo. Las collections usan passthrough, así
// que algunos campos (personas_implicadas, organizaciones_implicadas) viajan sin
// tipar y se acceden por cast.
interface RolLike {
  data: {
    caso_id: string;
    sujeto_tipo?: 'persona' | 'organizacion';
    sujeto_persona_id?: string;
    sujeto_organizacion_id?: string;
  };
}
interface CasoLike {
  data: {
    id: string;
    estado_publicacion: string;
    organo_judicial_id?: string;
    querellante_inicial_id?: string;
  };
}
interface HechoLike {
  data: { caso_id: string; personas_implicadas?: string[]; organizaciones_implicadas?: string[] };
}
interface HitoLike {
  data: { caso_id: string; personas_afectadas?: string[]; organizaciones_afectadas?: string[] };
}
interface VinculoLike {
  data: {
    relevancia_para_caso_ids?: string[];
    sujeto_persona_id?: string;
    sujeto_organizacion_id?: string;
    objeto_persona_id?: string;
    objeto_organizacion_id?: string;
  };
}
interface DocumentoLike {
  data: { caso_principal_id?: string; productor_organizacion_id?: string };
}
interface CoberturaLike {
  data: { caso_id: string; noticias?: { medio_id?: string }[] };
}

export interface EntidadesVisiblesInput {
  casos: CasoLike[];
  roles: RolLike[];
  hechos?: HechoLike[];
  hitos?: HitoLike[];
  vinculos?: VinculoLike[];
  documentos?: DocumentoLike[];
  cobertura?: CoberturaLike[];
}

export interface EntidadesVisibles {
  /** Ids de caso visibles en el entorno actual. */
  casos: Set<string>;
  /** Ids de persona con al menos un punto de aparición en un caso visible. */
  personas: Set<string>;
  /** Ids de organización con al menos un punto de aparición en un caso visible. */
  organizaciones: Set<string>;
}

/**
 * Personas y organizaciones que aparecen en al menos un caso visible, por
 * cualquiera de las vías por las que la ficha de un caso publicado las enlaza:
 * rol procesal, órgano/querellante, hechos (implicadas), hitos (afectadas),
 * vínculo institucional relevante para el caso y producción documental. Es un
 * superconjunto deliberado de "entidad enlazada desde una página publicada":
 * garantiza que ninguna ficha publicada apunte a una página no generada.
 */
export function entidadesEnCasosVisibles(input: EntidadesVisiblesInput): EntidadesVisibles {
  const casos = idsCasosVisibles(input.casos);
  const personas = new Set<string>();
  const organizaciones = new Set<string>();

  for (const c of input.casos) {
    if (!casos.has(c.data.id)) continue;
    if (c.data.organo_judicial_id) organizaciones.add(c.data.organo_judicial_id);
    if (c.data.querellante_inicial_id) organizaciones.add(c.data.querellante_inicial_id);
  }
  for (const r of input.roles) {
    if (!casos.has(r.data.caso_id)) continue;
    if (r.data.sujeto_persona_id) personas.add(r.data.sujeto_persona_id);
    if (r.data.sujeto_organizacion_id) organizaciones.add(r.data.sujeto_organizacion_id);
  }
  for (const h of input.hechos ?? []) {
    if (!casos.has(h.data.caso_id)) continue;
    for (const id of h.data.personas_implicadas ?? []) personas.add(id);
    for (const id of h.data.organizaciones_implicadas ?? []) organizaciones.add(id);
  }
  for (const h of input.hitos ?? []) {
    if (!casos.has(h.data.caso_id)) continue;
    for (const id of h.data.personas_afectadas ?? []) personas.add(id);
    for (const id of h.data.organizaciones_afectadas ?? []) organizaciones.add(id);
  }
  for (const v of input.vinculos ?? []) {
    const rel = v.data.relevancia_para_caso_ids ?? [];
    if (!rel.some((id) => casos.has(id))) continue;
    if (v.data.sujeto_persona_id) personas.add(v.data.sujeto_persona_id);
    if (v.data.objeto_persona_id) personas.add(v.data.objeto_persona_id);
    if (v.data.sujeto_organizacion_id) organizaciones.add(v.data.sujeto_organizacion_id);
    if (v.data.objeto_organizacion_id) organizaciones.add(v.data.objeto_organizacion_id);
  }
  for (const d of input.documentos ?? []) {
    if (d.data.caso_principal_id && casos.has(d.data.caso_principal_id) && d.data.productor_organizacion_id) {
      organizaciones.add(d.data.productor_organizacion_id);
    }
  }
  // Medios citados en la cobertura mediática de un caso visible: tienen ficha de
  // clasificación editorial y la propia ficha del caso enlaza a ellos.
  for (const c of input.cobertura ?? []) {
    if (!casos.has(c.data.caso_id)) continue;
    for (const n of c.data.noticias ?? []) {
      if (n.medio_id) organizaciones.add(n.medio_id);
    }
  }

  return { casos, personas, organizaciones };
}
