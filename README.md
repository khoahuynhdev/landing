# khoahuynh.dev

This repository holds the personal landing page of Khoa Huỳnh, served at https://khoahuynh.dev. It is plain hand-written HTML and one CSS file. There is no build step, no framework, no JavaScript, no external fonts or CDNs, no analytics and no cookies. The pages are `index.html` and `privacy.html`, styled by `styles.css`, with `favicon.svg`, `robots.txt`, and `sitemap.xml`. The `_headers` file sets the security and cache headers.

## Prerequisites

None. You only need a browser. For a local preview you need Python 3, which most systems already have.

## Local preview

Run `python3 -m http.server` in the repository root, then open http://localhost:8000. The pages use root-relative links, so serve from the root and not by opening the files directly.

## Deployment

The site is hosted on Cloudflare Pages. In the Cloudflare dashboard, create a Pages project and connect it to the GitHub repository khoahuynhdev/landing. Set the production branch to `main`, the framework preset to None, leave the build command empty, and set the build output directory to `/`, which is the repository root.

Then open Custom domains in the project and add khoahuynh.dev. The domain is already on Cloudflare, so Pages creates the DNS record for you. First remove any existing A, AAAA or CNAME record for the apex, or Pages cannot create its own.

Every push to `main` deploys to production. Other branches get preview URLs. The `_headers` file in the repository root sets the security headers and cache rules, and Pages parses it instead of serving it. When you add a new page, no extra configuration is needed.

Known limit: Pages serves every file in the output directory, so this README is public at https://khoahuynh.dev/README.md. It holds no secrets. The `.assetsignore` file that excludes files is a Workers feature, and the Pages documentation does not describe it, so it is not used here.

## Email

The site shows hello@khoahuynh.dev as the contact address. This address does not work until you set up email forwarding for the domain, for example with Cloudflare Email Routing or ImprovMX. Do this and send a test message before you use the site in any application.
