# khoahuynh.dev

Khoa Huỳnh's static landing page and IT services calculator, deployed with Cloudflare Workers Static Assets at https://khoahuynh.dev. Hand-written HTML, CSS and browser JavaScript; no framework, runtime dependencies, external fonts/CDNs, analytics or cookies.

## Build and preview production

Node.js 22 or newer is sufficient. No dependency installation is needed.

```sh
node --test tests/codex-pricing.test.mjs tests/build-site.test.mjs
node scripts/build-site.mjs
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000/ and http://localhost:8000/pricing.html. Python is only needed for the local preview. Cloudflare serves `pricing.html` at `/pricing` and redirects the `.html` URL to the extensionless URL.

The build copies an explicit allowlist into a fresh `dist/`. It publishes the Codex calculator as `pricing.html`, together with its assets, the landing/privacy/404 pages, favicon, sitemap, robots file, `_headers` and `_redirects`. Generated output is ignored by Git. Add new public files to `scripts/build-site.mjs` deliberately.

Claude's implementation, pricing notes, tests, assistant settings and repository files are not copied. Do not deploy the repository root: excluding a file from navigation or search engines would not prevent direct access to it.

## Existing Cloudflare Worker

The project uses **Workers Builds**, not Pages. In the existing `landing` Worker's build settings, use:

| Setting | Value |
| --- | --- |
| Git repository | `khoahuynhdev/landing` |
| Production branch | `main` |
| Root directory | Repository root (leave unchanged if already correct) |
| Build command | `node scripts/build-site.mjs` |
| Deploy command | `npx wrangler deploy` |
| Build watch paths | `*` |

There is no Pages-style output-directory field here. `wrangler.jsonc` sets `assets.directory` to `./dist`, so Wrangler uploads only the generated public files. The name `landing` must match the existing Worker. Do not use a deploy command with `--assets .`, which would override the configured directory. Build watch paths only control which commits trigger a build; they do not control which files are uploaded.

The configuration also sets `assets.not_found_handling` to `404-page`, so unknown paths return the custom `404.html` with HTTP 404. No server-side Worker script or framework is required. Keep the existing custom-domain configuration.

Pushes to `main` deploy through the existing Git integration after the build and deploy commands are configured. `_headers` and `_redirects` are copied into the assets directory for Cloudflare to apply. Old `/codex-pricing` and `/codex-pricing.html` URLs redirect to `/pricing`.

For an optional local check of Cloudflare routing and headers, run `node scripts/build-site.mjs` and then `npx wrangler dev`. Wrangler is deployment tooling and can be fetched by `npx`; the application itself has no runtime dependencies.

After deployment, check the home-page calculator link, hourly/project modes, downloads and printing. Confirm `/claude-pricing.html`, `/claude-version.md`, `/codex-version.md` and `/README.md` return 404.

Cloudflare references: [Workers build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Static assets](https://developers.cloudflare.com/workers/static-assets/), [Custom 404 pages](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/).

## Review Claude's version locally

Both implementations and their tests are kept in Git. To compare their original source pages, serve the repository root locally:

```sh
python3 -m http.server 8001
```

- Codex: http://localhost:8001/codex-pricing.html
- Claude: http://localhost:8001/claude-pricing.html

The production link `/pricing.html` exists in generated `dist/`, not in the source root. Use the production preview above when checking navigation end to end. A plain Python server does not apply Cloudflare redirects or headers.

## Calculator maintenance

`codex-pricing.html`, `codex-pricing.css` and `codex-pricing.js` implement the selected calculator. Shared landing-page styling comes from `styles.css`. Edit `codex-pricing-model.mjs` for rates, appointment windows, catalog scope and calculation rules. Business assumptions are documented in `codex-version.md`.

Standalone hourly work is 500,000 VND/hour, with weekday appointment windows of 07:30–09:00, 16:00–18:00 and 19:00–21:00, Vietnam time. Fixed-project packages use a 400,000 VND/hour base plus 10–20% contingency (460,000/hour at the standard 15%). Retainers are 900k/2 hours, 1.35M/3 hours and 2M/5 hours; approved overage is 500,000/hour. Comparison rates use estimated or included hours, before tax and external costs. Taxes are unresolved, not assumed zero.

The calculator processes inputs in the browser without persistence or submission. Download produces a text proposal; print produces a proposal with the applicable scope, prices and terms. The shared content security policy permits the same-origin modules without inline scripts.

## Email

The site displays hello@khoahuynh.dev. Confirm that email forwarding and replies work before using it for customer quotations.
