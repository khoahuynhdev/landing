import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from '../scripts/build-site.mjs';

test('deployment contains only public files, resolves local assets and removes stale drafts', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'landing-build-'));
  const output = join(temp, 'dist');
  try {
    await buildSite(output);
    await writeFile(join(output, 'claude-version.md'), 'stale file from an earlier build');
    await buildSite(output);
    const files = await readdir(output);
    assert.deepEqual(files.sort(), [
      '404.html', '_headers', '_redirects', 'codex-pricing-model.mjs', 'codex-pricing.css',
      'codex-pricing.js', 'favicon.svg', 'index.html', 'og-image.png', 'og-pricing.png', 'pricing.html',
      'privacy.html', 'robots.txt', 'sitemap.xml', 'styles.css',
    ].sort());
    assert.equal(await readFile(join(output, 'pricing.html'), 'utf8'), await readFile(new URL('../codex-pricing.html', import.meta.url), 'utf8'));
    for (const file of files.filter(name => name.endsWith('.html'))) {
      const html = await readFile(join(output, file), 'utf8');
      for (const [, url] of html.matchAll(/(?:href|src)="(\/[^\"]*)"/g)) {
        const path = url.split('#')[0];
        assert.ok(files.includes(path === '/' ? 'index.html' : path.slice(1)), `${file}: missing asset ${url}`);
      }
    }
    const script = await readFile(join(output, 'codex-pricing.js'), 'utf8');
    for (const [, module] of script.matchAll(/from ['"]\.\/([^'"]+)['"]/g)) assert.ok(files.includes(module));
    assert.match(await readFile(join(output, 'sitemap.xml'), 'utf8'), /https:\/\/khoahuynh.dev\/pricing</);
    assert.match(await readFile(join(output, '_headers'), 'utf8'), /Content-Security-Policy:/);
    assert.match(await readFile(join(output, '_redirects'), 'utf8'), /\/codex-pricing \/pricing 301/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});

test('shareable pages have link-preview metadata with a deployed PNG image', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'landing-build-'));
  const output = join(temp, 'dist');
  try {
    await buildSite(output);
    const files = await readdir(output);
    for (const page of ['index.html', 'privacy.html', 'pricing.html']) {
      const html = await readFile(join(output, page), 'utf8');
      const meta = Object.fromEntries([...html.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)">/g)].map(([, key, value]) => [key, value]));
      for (const key of ['og:type', 'og:site_name', 'og:title', 'og:description', 'og:url', 'og:image', 'og:image:alt']) {
        assert.ok(meta[key], `${page}: missing ${key}`);
      }
      assert.equal(meta['twitter:card'], 'summary_large_image', `${page}: twitter:card`);
      assert.equal(meta['og:url'], html.match(/<link rel="canonical" href="([^"]+)">/)[1], `${page}: og:url must match canonical`);

      // Crawlers need an absolute URL, and Facebook and X do not render SVG previews.
      const image = meta['og:image'].match(/^https:\/\/khoahuynh\.dev\/([\w-]+\.png)$/)?.[1];
      assert.ok(image && files.includes(image), `${page}: og:image must be a deployed PNG on khoahuynh.dev`);
      const png = await readFile(join(output, image));
      assert.equal(png.readUInt32BE(16), Number(meta['og:image:width']), `${page}: image width`);
      assert.equal(png.readUInt32BE(20), Number(meta['og:image:height']), `${page}: image height`);
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
