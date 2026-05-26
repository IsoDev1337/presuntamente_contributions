#!/usr/bin/env node
/**
 * Archivado en archive.org de URLs sin url_archivo.
 *
 * Fuentes:
 *   - content/documentos/*.yaml — documentos N4 (campo url_canonica)
 *   - content/cobertura-mediatica/*.yaml — noticias del corpus (campo url por ítem)
 *
 * Modos:
 *   --staged-only      Solo YAML en staging. Usado por hooks/pre-commit (tope por
 *                      defecto: 5 URLs; ver ARCHIVAR_HOOK_MAX).
 *   --catchup          Todo el backlog pendiente del repo.
 *   --caso=<slug>      Filtra por caso_principal_id (documentos) o caso_id (cobertura).
 *   --dry-run          Lista pendientes sin llamar a archive.org.
 *   --hook-max=<n>     Tope en --staged-only (default 5; 0 = sin tope).
 *
 * Comportamiento:
 *   - Modifica YAMLs in-place insertando url_archivo tras url_canonica o url.
 *   - En --staged-only re-stagea los YAML modificados.
 *   - Si archive.org falla: avisa y continúa; no bloquea commits (exit 0).
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
const DEFAULT_HOOK_MAX = 5;
const UA = 'presuntamente.org/archivar-n4 (https://github.com/davidchicano/presuntamente)';

const args = process.argv.slice(2);
const stagedOnly = args.includes('--staged-only');
const catchup = args.includes('--catchup');
const dryRun = args.includes('--dry-run');
const casoArg = args.find((a) => a.startsWith('--caso='));
const hookMaxArg = args.find((a) => a.startsWith('--hook-max='));
const casoFilter = casoArg ? casoArg.slice('--caso='.length) : null;

let hookMax = DEFAULT_HOOK_MAX;
if (process.env.ARCHIVAR_HOOK_MAX != null && process.env.ARCHIVAR_HOOK_MAX !== '') {
  hookMax = Number.parseInt(process.env.ARCHIVAR_HOOK_MAX, 10);
}
if (hookMaxArg) {
  hookMax = Number.parseInt(hookMaxArg.slice('--hook-max='.length), 10);
}
if (Number.isNaN(hookMax) || hookMax < 0) {
  hookMax = DEFAULT_HOOK_MAX;
}

if (!stagedOnly && !catchup) {
  console.error(
    'Uso: node scripts/archivar-n4.mjs (--staged-only|--catchup) [--caso=<slug>] [--dry-run] [--hook-max=<n>]',
  );
  process.exit(2);
}

function listStagedPaths(globPath) {
  const out = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=AM', '--', globPath],
    { encoding: 'utf-8' },
  );
  return out.split('\n').filter((l) => l.endsWith('.yaml'));
}

async function loadCandidateDocFiles() {
  if (stagedOnly) {
    return listStagedPaths('content/documentos/');
  }
  return glob('content/documentos/*.yaml');
}

async function loadCandidateCoberturaFiles() {
  if (stagedOnly) {
    return listStagedPaths('content/cobertura-mediatica/');
  }
  return glob('content/cobertura-mediatica/*.yaml');
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

function pickPendingDocumentos(parsedDocs) {
  return parsedDocs
    .filter(({ data }) => data?.nivel_fuente === 4)
    .filter(({ data }) => typeof data?.url_canonica === 'string' && data.url_canonica.length > 0)
    .filter(({ data }) => !data?.url_archivo)
    .filter(({ data }) => !data?.url_archivo_no_disponible)
    .filter(({ data }) => (casoFilter ? data?.caso_principal_id === casoFilter : true))
    .map(({ file, raw, data }) => ({
      source: 'documento',
      file,
      raw,
      id: data.id,
      url: data.url_canonica,
    }));
}

function pickPendingCobertura(parsedCobertura) {
  const items = [];
  for (const { file, raw, data } of parsedCobertura) {
    if (!data?.caso_id) continue;
    if (casoFilter && data.caso_id !== casoFilter) continue;
    const noticias = Array.isArray(data.noticias) ? data.noticias : [];
    for (const noticia of noticias) {
      if (!noticia?.id || typeof noticia.url !== 'string' || !noticia.url) continue;
      if (noticia.url_archivo) continue;
      items.push({
        source: 'cobertura',
        file,
        raw,
        id: noticia.id,
        url: noticia.url,
      });
    }
  }
  return items;
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

function insertUrlArchivoDocumento(rawYaml, archiveUrl) {
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

function insertUrlArchivoCobertura(rawYaml, targetUrl, archiveUrl) {
  const lines = rawYaml.split('\n');
  const needle = targetUrl.replace(/"/g, '');
  for (let i = 0; i < lines.length; i++) {
    if (!/^    url:\s/.test(lines[i])) continue;
    if (!lines[i].includes(needle)) continue;
    const next = lines[i + 1];
    if (next && /^    url_archivo:\s/.test(next)) {
      lines[i + 1] = `    url_archivo: "${archiveUrl}"`;
    } else {
      lines.splice(i + 1, 0, `    url_archivo: "${archiveUrl}"`);
    }
    return lines.join('\n');
  }
  return null;
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
  const docFiles = await loadCandidateDocFiles();
  const cobFiles = await loadCandidateCoberturaFiles();

  if (docFiles.length === 0 && cobFiles.length === 0) {
    if (catchup) console.log('✅ No hay YAML de documentos ni cobertura mediática para revisar.');
    return;
  }

  const parsedDocs = docFiles.length ? await loadParsed(docFiles) : [];
  const parsedCob = cobFiles.length ? await loadParsed(cobFiles) : [];

  let pending = [...pickPendingDocumentos(parsedDocs), ...pickPendingCobertura(parsedCob)];

  if (pending.length === 0) {
    if (catchup) console.log('✅ Ninguna URL pendiente de archivar (documentos N4 + cobertura mediática).');
    return;
  }

  const totalPending = pending.length;
  let deferred = 0;
  if (stagedOnly && hookMax > 0 && pending.length > hookMax) {
    deferred = pending.length - hookMax;
    pending = pending.slice(0, hookMax);
  }

  const ctx = stagedOnly ? '(staged)' : '(catchup)';
  const label = `${pending.length} URL(s)${deferred ? ` (${deferred} aplazada(s) por tope del hook; usa pnpm archive:catchup)` : ''}`;
  console.log(`📚 archivar-n4 ${ctx}: ${label}${casoFilter ? ` — caso=${casoFilter}` : ''}`);

  if (dryRun) {
    for (const d of pending) {
      console.log(`  [${d.source}] ${d.id}`);
      console.log(`    ${d.url}`);
    }
    if (deferred) {
      console.log(`  … y ${deferred} más no listadas (tope --hook-max)`);
    }
    console.log('(dry-run: no se ha hecho ninguna llamada)');
    return;
  }

  let okCount = 0;
  let failCount = 0;
  const fileCache = new Map();

  for (let i = 0; i < pending.length; i++) {
    const d = pending[i];
    process.stdout.write(`  [${i + 1}/${pending.length}] [${d.source}] ${d.id} … `);

    const r = await saveOne(d.url);
    if (r.ok) {
      let raw = fileCache.get(d.file) ?? d.raw;
      const updated =
        d.source === 'documento'
          ? insertUrlArchivoDocumento(raw, r.archiveUrl)
          : insertUrlArchivoCobertura(raw, d.url, r.archiveUrl);

      if (updated) {
        await writeFile(d.file, updated, 'utf-8');
        fileCache.set(d.file, updated);
        if (stagedOnly) gitAdd(d.file);
        console.log('OK');
        okCount++;
      } else {
        console.log('OK (archivado) pero NO se pudo insertar url_archivo en el YAML');
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
    console.log('   Los fallidos quedan sin url_archivo; reintenta con pnpm archive:catchup.');
  }
  if (deferred > 0) {
    console.log(`   Quedan ${deferred} URL(s) pendiente(s) en este staging — ejecuta: pnpm archive:catchup`);
  }
  if (catchup && totalPending > pending.length) {
    // catchup has no cap; this branch unused
  }
}

main().catch((err) => {
  console.error('archivar-n4 (no bloquea commit):', err.message);
  process.exit(0);
});
