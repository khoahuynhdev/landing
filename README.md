# khoahuynh.dev

This repository holds the personal landing page of Khoa Huỳnh, served at https://khoahuynh.dev. It is plain hand-written HTML and one CSS file. There is no build step, no framework, no JavaScript, no external fonts or CDNs, no analytics and no cookies. The pages are `index.html` and `privacy.html`, styled by `styles.css`, with `favicon.svg`, `robots.txt`, `sitemap.xml` and a `CNAME` file for the custom domain.

## Prerequisites

None. You only need a browser. For a local preview you need Python 3, which most systems already have.

## Local preview

Run `python3 -m http.server` in the repository root, then open http://localhost:8000. The pages use root-relative links, so serve from the root and not by opening the files directly.

## Deploy to GitHub Pages

In the repository settings, open Pages and set the source to deploy from the `main` branch, root folder. The `CNAME` file already contains `khoahuynh.dev`, so GitHub picks up the custom domain.

At your DNS provider, add these records for the apex domain khoahuynh.dev. The A records are 185.199.108.153, 185.199.109.153, 185.199.110.153 and 185.199.111.153. The AAAA records are 2606:50c0:8000::153, 2606:50c0:8001::153, 2606:50c0:8002::153 and 2606:50c0:8003::153.

The `.dev` top-level domain is on the HSTS preload list, so browsers only connect over HTTPS. Turn on "Enforce HTTPS" in the Pages settings once the certificate is issued, or the site will not load.

## Email

The site shows hello@khoahuynh.dev as the contact address. This address does not work until you set up email forwarding for the domain, for example with Cloudflare Email Routing or ImprovMX. Do this and send a test message before you use the site in any application.
