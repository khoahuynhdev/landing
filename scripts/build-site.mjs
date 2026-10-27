import { copyFile, lstat, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Deliberate allowlist: review every new public file here. No directory copying.
export const publicFiles = [
  ['index.html', 'index.html'],
  ['privacy.html', 'privacy.html'],
  ['codex-pricing.html', 'pricing.html'],
  ['codex-pricing.js', 'codex-pricing.js'],
  ['codex-pricing-model.mjs', 'codex-pricing-model.mjs'],
  ['codex-pricing.css', 'codex-pricing.css'],
  ['styles.css', 'styles.css'],
  ['favicon.svg', 'favicon.svg'],
  ['robots.txt', 'robots.txt'],
  ['sitemap.xml', 'sitemap.xml'],
  ['404.html', '404.html'],
  ['_headers', '_headers'],
  ['_redirects', '_redirects'],
];

export async function buildSite(output = join(root, 'dist')) {
  const destination = resolve(output);
  if (destination === root || root.startsWith(destination + '/')) {
    throw new Error('Build output must not contain the source repository.');
  }
  // Validate inputs before replacing the previous build.
  for (const [source] of publicFiles) {
    if (!(await lstat(join(root, source))).isFile()) {
      throw new Error(`Expected a regular source file: ${source}`);
    }
  }
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  for (const [source, target] of publicFiles) {
    await copyFile(join(root, source), join(destination, target));
  }
  return destination;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const output = await buildSite();
  console.log(`Built ${publicFiles.length} public files in ${output}`);
}
