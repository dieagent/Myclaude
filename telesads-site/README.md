# TELES ADS website

Single-page site for TELES ADS. Plain HTML, CSS and JS with no build step.

- `index.html`: content and structure
- `style.css`: fluid scaling (1rem tracks the viewport against 1440 / 834 / 430px designs), brand tokens, layout
- `main.js`: motion. GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) and Lenis smooth scrolling, loaded from jsDelivr

To preview, open `index.html` in a browser or run `npx serve telesads-site`.
To deploy, upload the folder to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

The page stays fully usable without JavaScript, if the CDN fails, and with reduced motion turned on.
