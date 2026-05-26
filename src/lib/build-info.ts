// build-info.ts — metadatos de la versión publicada del sitio.
//
// Se evalúa en build (Astro estático) y queda inlineado en el HTML
// generado. Permite mostrar al lector qué versión del código está
// viendo, lo que facilita reportar bugs (con el hash sabemos a qué
// commit corresponde el sitio que vio).
//
// Orden de prioridad para detectar el hash:
//   1. CF_PAGES_COMMIT_SHA (Cloudflare Pages, plataforma de despliegue).
//   2. Otras CIs comunes (Vercel, Netlify, GitHub Actions) — útil si
//      el deploy migra alguna vez.
//   3. `git rev-parse HEAD` local — para `pnpm dev` y `pnpm build`
//      en la máquina del maintainer.
//   4. 'unknown' si nada de lo anterior funciona.

import { execSync } from 'node:child_process';

function readCommitSha(): string {
  const envCandidate =
    process.env.CF_PAGES_COMMIT_SHA ??
    process.env.VERCEL_GIT_COMMIT_SHA ??
    process.env.COMMIT_REF ??
    process.env.GITHUB_SHA;
  if (envCandidate && envCandidate.trim() !== '') {
    return envCandidate.trim();
  }
  try {
    return execSync('git rev-parse HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return 'unknown';
  }
}

export const commitSha = readCommitSha();
export const commitShaShort =
  commitSha === 'unknown' ? 'unknown' : commitSha.slice(0, 7);
export const buildDate = new Date().toISOString().slice(0, 10);

// URL al commit en GitHub. Útil si en algún momento queremos linkar el
// hash desde el footer; por ahora se exporta sin usarse activamente.
export const commitUrl =
  commitSha === 'unknown'
    ? null
    : `https://github.com/davidchicano/presuntamente/commit/${commitSha}`;
