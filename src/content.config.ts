// Astro Content Collections — fuente de verdad para tipos en build.
//
// Las collections leen los YAML de /content/ y los exponen tipados a las
// páginas vía `getCollection()` / `getEntry()`. Los Zod schemas aquí son
// MÍNIMOS VIABLES: cubren los campos que el sitio consume hoy, sin duplicar
// los JSON Schemas de /schemas/ (que siguen siendo la validación canónica
// ejecutada por `pnpm validate`). Cada schema usa `.passthrough()` para no
// romper si los YAML traen campos extra todavía no tipados aquí.
//
// IDs: por defecto el glob loader genera el id a partir del path. Para
// `casos`, `hitos`, `hechos` y `roles` lo derivamos del campo `data.id`
// del propio YAML — así los slugs en la app coinciden con los del YAML.

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// El glob loader detecta el parser por extensión: para `.yaml`/`.yml` invoca
// `yaml` (ya instalado como dependencia transitiva). No pasamos `parser`
// porque el tipo `GlobOptions` no lo expone como opción pública en Astro 5.

// --- Slots compartidos -------------------------------------------------------

const ESTADO_PUBLICACION = z.enum([
  'borrador',
  'en_revision',
  'publicado',
  'retirado_temporalmente',
  'retirado_definitivamente',
]);

const FASE = z.enum([
  'denuncia_o_querella',
  'instruccion',
  'fase_intermedia',
  'juicio_oral',
  'sentencia_primera_instancia',
  'recurso',
  'sentencia_firme',
  'ejecucion',
  'archivo_provisional',
  'archivo_libre',
]);

// --- casos -------------------------------------------------------------------

const casos = defineCollection({
  loader: glob({
    pattern: '*/caso.yaml',
    base: './content/casos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      nombre_oficial: z.string(),
      nombre_mediatico: z.string(),
      nombres_alternativos: z.array(z.string()).default([]),
      descripcion_corta: z.string().optional(),
      caso_padre_id: z.string().optional(),
      organo_judicial_id: z.string(),
      numero_procedimiento: z.string().optional(),
      tipo_procedimiento: z.string().optional(),
      fase_actual: FASE,
      fecha_apertura: z.string(),
      fecha_cierre: z.string().optional(),
      origen_denuncia: z.string(),
      querellante_inicial_id: z.string().optional(),
      delitos_atribuidos_en_la_causa: z.array(z.string()).default([]),
      resumen_cifras: z.string().optional(),
      estado_publicacion: ESTADO_PUBLICACION,
      ultima_revision_editorial: z.string().optional(),
      nivel_relevancia_editorial: z
        .enum(['baja', 'media', 'alta', 'capital'])
        .optional(),
    })
    .passthrough(),
});

// --- personas ----------------------------------------------------------------

const personas = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './content/personas',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      nombre_completo: z.string(),
      nombres_alternativos: z.array(z.string()).default([]),
      es_figura_publica: z.boolean(),
      cargo_publico_actual: z.string().optional(),
      biografia_corta: z.string().optional(),
      fallecido: z.boolean().default(false),
      estado_publicacion: ESTADO_PUBLICACION,
    })
    .passthrough(),
});

// --- organizaciones ----------------------------------------------------------

const organizaciones = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './content/organizaciones',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      nombre: z.string(),
      nombres_alternativos: z.array(z.string()).default([]),
      tipo: z.string(),
      descripcion_corta: z.string().optional(),
      siglas: z.string().optional(),
      url_canonica: z.string().optional(),
      estado_publicacion: ESTADO_PUBLICACION,
    })
    .passthrough(),
});

// --- documentos --------------------------------------------------------------

const documentos = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './content/documentos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      titulo: z.string(),
      tipo: z.string(),
      nivel_fuente: z.number().int().min(1).max(4),
      productor_organizacion_id: z.string().optional(),
      fecha_documento: z.string(),
      fecha_publicacion: z.string().optional(),
      url_canonica: z.string().optional(),
      caso_principal_id: z.string().optional(),
      estado_publicacion: ESTADO_PUBLICACION,
    })
    .passthrough(),
});

// --- delitos -----------------------------------------------------------------

const delitos = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './content/delitos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      nombre_tipico: z.string(),
      articulos_cp: z.array(z.string()),
      familia: z.string(),
      descripcion_breve: z.string().optional(),
      enlace_boe: z.string().optional(),
    })
    .passthrough(),
});

// --- glosario ----------------------------------------------------------------
//
// "Cosas de interés" no jerárquicas que se citan en prosa sin ser entidades
// formales: programas o fondos públicos por nombre comercial, operaciones
// policiales nombradas, sobrenombres mediáticos de tramas. RichProse las
// detecta automáticamente y las renderiza con dotted underline + tooltip
// (sin link interno ni externo por defecto, por seguridad editorial).

const glosario = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './content/glosario',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      label: z.string(),
      nombres_alternativos: z.array(z.string()).default([]),
      categoria: z.enum(['programa_publico', 'operacion_policial', 'trama_sobrenombre', 'otra']),
      descripcion_breve: z.string(),
      estado_publicacion: z.enum(['borrador', 'publicado', 'retirado']),
      ultima_revision_editorial: z.string(),
    })
    .passthrough(),
});

// --- hitos (anidados en casos/<slug>/hitos/) ---------------------------------

const hitos = defineCollection({
  loader: glob({
    pattern: '*/hitos/*.yaml',
    base: './content/casos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      caso_id: z.string(),
      tipo: z.string(),
      fecha: z.string(),
      fecha_precision: z.enum(['dia', 'mes', 'anio']),
      titulo: z.string(),
      descripcion: z.string().optional(),
      personas_afectadas: z.array(z.string()).default([]),
      organizaciones_afectadas: z.array(z.string()).default([]),
      documento_principal_id: z.string().optional(),
      fase_resultante: FASE.optional(),
    })
    .passthrough(),
});

// --- hechos (anidados en casos/<slug>/hechos/) -------------------------------

const hechos = defineCollection({
  loader: glob({
    pattern: '*/hechos/*.yaml',
    base: './content/casos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      caso_id: z.string(),
      enunciado: z.string(),
      tipo: z.enum([
        'acreditado',
        'investigado',
        'atribuido',
        'exculpatorio',
        'desmentido',
        'no_concluyente',
      ]),
      fecha_o_periodo: z
        .object({
          desde: z.string(),
          hasta: z.string().optional(),
          precision: z.enum(['dia', 'mes', 'anio', 'rango']),
        })
        .passthrough(),
      vigencia: z.enum(['vigente', 'superado', 'retirado']),
      estado_publicacion: ESTADO_PUBLICACION,
    })
    .passthrough(),
});

// --- roles (anidados en casos/<slug>/roles/) ---------------------------------

const roles = defineCollection({
  loader: glob({
    pattern: '*/roles/*.yaml',
    base: './content/casos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      caso_id: z.string(),
      sujeto_tipo: z.enum(['persona', 'organizacion']),
      sujeto_persona_id: z.string().optional(),
      sujeto_organizacion_id: z.string().optional(),
      rol: z.string(),
      delitos_atribuidos: z.array(z.string()).default([]),
      fecha_inicio: z.string(),
      fecha_fin: z.string().optional(),
      hito_origen_id: z.string().optional(),
      hito_fin_id: z.string().optional(),
      notas: z.string().optional(),
    })
    .passthrough(),
});

// --- relaciones-entre-casos --------------------------------------------------
//
// Conexión NO jerárquica entre dos casos del inventario. La jerarquía padre-pieza
// vive en Caso.caso_padre_id; aquí se modelan vínculos transversales
// (derivado_de, conexion_factual, misma_trama, etc.). La validación canónica
// del schema vive en /schemas/relacion-entre-casos.schema.json (V-15: salvo
// `comparte_actor_con`, exigen al menos un documento de respaldo).

const relaciones = defineCollection({
  loader: glob({
    pattern: '*.yaml',
    base: './content/relaciones-entre-casos',
    generateId: ({ data }) => String(data.id),
  }),
  schema: z
    .object({
      id: z.string(),
      caso_a_id: z.string(),
      caso_b_id: z.string(),
      tipo: z.enum([
        'derivado_de',
        'comparte_actor_con',
        'conexion_factual',
        'misma_trama',
        'contradiccion_factual',
      ]),
      descripcion: z.string(),
      documentos_respaldo: z.array(z.string()).default([]),
      fecha_inicio: z.string().optional(),
      fecha_fin: z.string().optional(),
      estado_publicacion: ESTADO_PUBLICACION,
      ultima_revision_editorial: z.string().optional(),
    })
    .passthrough(),
});

export const collections = {
  casos,
  personas,
  organizaciones,
  documentos,
  delitos,
  glosario,
  hitos,
  hechos,
  roles,
  relaciones,
};
