# TELES ADS website

Single-page site for TELES ADS. Plain HTML, CSS and JS with no build step. Its layout and motion follow the two26.studio structure, with TELES ADS content, original illustrations and free fonts.

- `index.html`: content, inline SVG illustrations
- `style.css`: fluid scaling (1rem tracks the viewport against 1440 / 834 / 390px designs), palette, layout
- `main.js`: motion. GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) and Lenis, loaded from jsDelivr

Sections and their motion:
- **Loader:** a trail draws, the letters pop in, then pink and orange strokes wipe away
- **Hero:** the headline rises line by line, pills pop, swirls draw, the illustration pops in and floats
- **Ribbon marquee:** the stroke draws in on scroll and the text loops along the curve
- **About:** pinned while each letter sweeps pale → orange → black, with pills popping in
- **Work:** cards open out from a small clip window with a 3D tilt; on hover a brush stroke reveals a colour panel
- **Services:** a winding line draws as you scroll; each icon expands and its description bubble pops in
- **How we think:** a stacked, tilted card deck (click, swipe or use the ticks)
- **FAQ:** chat bubbles; one is always open
- **Footer:** the heading bounces in; the giant wordmark stretches with scroll and springs back
- **Contact overlay:** a stroke wipes in, the content pops in, and the links do kinetic letter hovers

To preview, open `index.html` in a browser or run `npx serve telesads-site`.
To deploy, upload the folder to any static host.

The page stays usable without JavaScript, if the CDN fails, and with reduced motion turned on.

## Deploy

**GitHub Pages:** push this folder to the `main` branch of a new repository, then open **Settings → Pages** and set **Source** to **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` publishes the site on every push.

**Netlify:** drag this folder onto https://app.netlify.com/drop.

**Vercel or Cloudflare Pages:** import the repository with no build command, and set the output directory to the repository root.

**Custom domain (telesads.com):** add the domain in your host's settings, then point your DNS at the host as it instructs.
