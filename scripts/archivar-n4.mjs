#!/usr/bin/env node
/**
 * Archivado en archive.org de documentos N4 sin url_archivo.
 *
 * Modos:
 *   --staged-only      Solo procesa documentos en el staging area del git
 *                      en curso. Usado por hooks/pre-commit.
 *   --catchup          Procesa TODO el backlog pendiente del repo. Usado
 *                      en arranque o cuando hay que rellenar histórico.
 *   --caso=<slug>      Filtra por caso_principal_id.
 *   --dry-run          Lista lo que haría sin llamar a archive.org.
 *
 * Comportamiento:
 *   - Modifica YAMLs in-place añadiendo `url_archivo` tras `url_canonica`.
 *     Preserva el resto del formato (comentarios, orden de keys, etc.)
 *     porque trabaja por inserción de línea, no por reescritura yaml.
 *   - En modo --staged-only re-stagea los YAMLs modificados para que
 *     entren en el mismo commit que los disparó.
 *   - Si archive.org no responde, devuelve rate-limit, o no se obtiene
 *     URL de snapshot: avisa al usuario y CONTINÚA sin bloquear. Los
 *     YAMLs sin url_archivo quedan para próximo intento.
 *
 * Sin autenticación. Cuota anónima de archive.org: 8.000 captures/día,
 * sobra varios órdenes de magnitud para el ritmo del proyecto.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { glob } from 'glob';
import { parse as parseYaml } from 'yaml';

const SAVE_ENDPOINT = 'https://web.archive.org/save/';
const WAIT_MS = 8_000;
const REQUEST_TIMEOUT_MS = 180_000;
const MAX_ATTEMPTS = 2;
const RATE_LIMIT_BACKOFF_MS = 60_000;
const UA = 'presuntamente.org/archivar-n4 (https://github.com/davidchicano/presuntamente)';

const args = process.argv.slice(2);
const stagedOnly = args.includes('--staged-only');
const catchup = args.includes('--catchup');
const dryRun = args.includes('--dry-run');
const casoArg = args.find((a) => a.startsWith('--caso='));
const casoFilter = casoArg ? casoArg.slice('--caso='.length) : null;

if (!stagedOnly && !catchup) {
  console.error('Uso: node scripts/archivar-n4.mjs (--staged-only|--catchup) [--caso=<slug>] [--dry-run]');
  process.exit(2);
}

function listStagedDocFiles() {
  const out = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=AM', '--', 'content/documentos/'], {
    encoding: 'utf-8',
  });
  return out.split('\n').filter((l) => l.endsWith('.yaml'));
}

async function loadCandidateFiles() {
  if (stagedOnly) {
    return listStagedDocFiles();
  }
  const files = await glob('content/documentos/*.yaml');
  return files;
}

function pickPending(parsedDocs) {
  return parsedDocs
    .filter(({ data }) => data?.nivel_fuente === 4)
    .filter(({ data }) => typeof data?.url_canonica === 'string' && data.url_canonica.length > 0)
    .filter(({ data }) => !data?.url_archivo)
    .filter(({ data }) => (casoFilter ? data?.caso_principal_id === casoFilter : true));
}

async function loadParsed(files) {
  const out = [];
  for (const file of files) {
    let raw;
    try {
      raw = await readFile(file, 'utf-8');
    } catch {
      continue;
    }
    let data;
    try {
      data = parseYaml(raw);
    } catch {
      continue;
    }
    out.push({ file, raw, data });
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function saveOne(url, attempt = 1) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const resp = await fetch(SAVE_ENDPOINT + url, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
    });

    if (resp.status === 429 || resp.status === 503) {
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RATE_LIMIT_BACKOFF_MS);
        return saveOne(url, attempt + 1);
      }
      return { ok: false, error: `rate limit (HTTP ${resp.status}) tras ${attempt} intentos` };
    }

    const location = resp.headers.get('location');
    const contentLocation = resp.headers.get('content-location');

    if (location && location.startsWith('https://web.archive.org/web/')) {
      return { ok: true, archiveUrl: location };
    }
    if (contentLocation && contentLocation.startsWith('/web/')) {
      return { ok: true, archiveUrl: 'https://web.archive.org' + contentLocation };
    }
    if (location && location.startsWith('/web/')) {
      return { ok: true, archiveUrl: 'https://web.archive.org' + location };
    }

    return { ok: false, error: `respuesta sin Location utilizable (HTTP ${resp.status})` };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { ok: false, error: `timeout (${REQUEST_TIMEOUT_MS / 1000}s)` };
    }
    return { ok: false, error: err.message };
  } finally {
    clearTimeout(t);
  }
}

function insertUrlArchivo(rawYaml, archiveUrl) {
  const lines = rawYaml.split('\n');
  const idx = lines.findIndex((l) => /^url_canonica:\s/.test(l));
  if (idx < 0) {
    return null;
  }
  const next = lines[idx + 1];
  if (next && /^url_archivo:\s/.test(next)) {
    lines[idx + 1] = `url_archivo: "${archiveUrl}"`;
  } else {
    lines.splice(idx + 1, 0, `url_archivo: "${archiveUrl}"`);
  }
  return lines.join('\n');
}

function gitAdd(file) {
  try {
    execFileSync('git', ['add', file], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const files = await loadCandidateFiles();
  if (files.length === 0) {
    if (catchup) console.log('✅ No hay documentos para archivar.');
    return;
  }

  const parsed = await loadParsed(files);
  const pending = pickPending(parsed);

  if (pending.length === 0) {
    if (catchup) console.log('✅ Ningún documento N4 pendiente de archivar.');
    return;
  }

  const ctx = stagedOnly ? '(staged)' : catchup ? '(catchup)' : '';
  console.log(`📚 archivar-n4 ${ctx}: ${pending.length} documento(s) N4 pendiente(s)${casoFilter ? ` — caso=${casoFilter}` : ''}`);

  if (dryRun) {
    for (const d of pending) {
      console.log(`  ${d.data.id}`);
      console.log(`    ${d.data.url_canonica}`);
    }
    console.log('(dry-run: no se ha hecho ninguna llamada)');
    return;
  }

  let okCount = 0;
  let failCount = 0;

  for (let i = 0; i < pending.length; i++) {
    const d = pending[i];
    process.stdout.write(`  [${i + 1}/${pending.length}] ${d.data.id} … `);

    const r = await saveOne(d.data.url_canonica);
    if (r.ok) {
      const updated = insertUrlArchivo(d.raw, r.archiveUrl);
      if (updated) {
        await writeFile(d.file, updated, 'utf-8');
        if (stagedOnly) gitAdd(d.file);
        console.log('OK');
        okCount++;
      } else {
        console.log('OK (archivado) pero NO se pudo insertar url_archivo: falta url_canonica en YAML');
        failCount++;
      }
    } else {
      console.log(`FAIL — ${r.error}`);
      failCount++;
    }

    if (i < pending.length - 1) {
      await sleep(WAIT_MS);
    }
  }

  console.log(`📝 ${okCount} archivado(s) · ${failCount} fallido(s)`);
  if (failCount > 0) {
    console.log('   Los fallidos quedan sin url_archivo; el próximo commit los reintentará.');
  }
}

main().catch((err) => {
  console.error('archivar-n4 (no bloquea commit):', err.message);
  process.exit(0);
});
