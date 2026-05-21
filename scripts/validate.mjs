#!/usr/bin/env node
/**
 * Validador de YAML del repo contra los JSON Schemas en /schemas/.
 *
 * Carga todos los YAML bajo /content/, identifica la entidad por su path,
 * y valida contra el schema correspondiente.
 *
 * Validaciones cross-entity (V-01..V-21 del doc 01) se irán añadiendo en fases
 * posteriores conforme entre contenido real al repo.
 */

import { readFile } from 'node:fs/promises';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const SCHEMA_FOR_ENTITY = {
  casos: 'caso.schema.json',
  personas: 'persona.schema.json',
  organizaciones: 'organizacion.schema.json',
  documentos: 'documento.schema.json',
  delitos: 'delito.schema.json',
};

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

for (const file of Object.values(SCHEMA_FOR_ENTITY)) {
  const schema = JSON.parse(await readFile(`schemas/${file}`, 'utf-8'));
  ajv.addSchema(schema, file);
}

const files = await glob('content/**/*.yaml');
let errors = 0;
let validated = 0;
let skipped = 0;

for (const filepath of files) {
  if (filepath === 'content/signals.yaml') {
    skipped++;
    continue;
  }

  const segments = filepath.split('/');
  const entity = segments[1];
  const schemaFile = SCHEMA_FOR_ENTITY[entity];

  if (!schemaFile) {
    console.warn(`⚠️  ${filepath} — entidad "${entity}" sin schema, saltando.`);
    skipped++;
    continue;
  }

  // Para casos jerárquicos, sólo validamos el fichero caso.yaml en cada slug.
  // Hitos, hechos, etc. dentro de /casos/<slug>/ se validan con sus propios schemas
  // cuando lleguen (Fase 1+).
  if (entity === 'casos' && !filepath.endsWith('/caso.yaml')) {
    skipped++;
    continue;
  }

  const raw = await readFile(filepath, 'utf-8');
  let data;
  try {
    data = parseYaml(raw);
  } catch (err) {
    errors++;
    console.error(`❌ ${filepath} — YAML inválido: ${err.message}`);
    continue;
  }

  const validateFn = ajv.getSchema(schemaFile);
  const valid = validateFn(data);
  validated++;

  if (!valid) {
    errors++;
    console.error(`❌ ${filepath}`);
    for (const err of validateFn.errors) {
      const path = err.instancePath || '/';
      console.error(`   ${path}: ${err.message}`);
    }
  } else {
    console.log(`✅ ${filepath}`);
  }
}

console.log(
  `\nResumen: ${validated} validado(s), ${skipped} saltado(s), ${errors} con errores.`
);
process.exit(errors > 0 ? 1 : 0);
