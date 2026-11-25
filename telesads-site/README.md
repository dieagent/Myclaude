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
- **Infinite slider:** drifts on its own, speeds up and follows your scroll direction; slides shrink slightly near the centre
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

## Logo

`assets/teles-ads-logo.svg` is the TELES ADS wordmark: monoline letters, with a custom T whose crossbar curls into a loop. The page uses it as an inline SVG symbol (`#logo`), so it takes the text colour (`currentColor`). The loader draws it stroke by stroke.

## Fonts

No paid licences are needed. Both fonts are free on Google Fonts:
- **Bricolage Grotesque**, at its condensed width (75) and weight 800, for headlines. It stands in for MD Nichrome.
- **Inter Tight** for body text. It stands in for Neue Montreal.

## Before launch: replace the demo images

The Work cards use rendered mock-ups in `assets/work/` (900 × 1125 px, 4:5):

| File | Card |
| --- | --- |
| `ggshot-bot.jpg` | @GGShot_Bot |
| `trading-mentors-bot.jpg` | @tradingmentorsIgnaIs_bot |
| `ai-trading-bot.jpg` | @AIGPT5Trading_bot |
| `quant-pocket-bot.jpg` | @quant_pocket_bot |
| `channel-promotion.jpg` | Channel Promotion (demo showcase, marked `data-demo`) |
| `meta-ad-creatives.jpg` | Ad Creatives (demo showcase, marked `data-demo`) |

To use real photos, save them over these files with the same names, or change the `src` in `index.html`. Keep the 4:5 ratio.

## About page (`about.html`)

It uses the same nav, loader, contact overlay and footer as the home page. The loader is skipped when you move between pages; a reload plays it again.

- **Hero:** "Small team, big Telegram energy". Letters bounce up, pills pop in, the swirl draws, the illustration pops and floats, and the intro rises line by line.
- **Story:** a thick orange line draws as you scroll, then its stroke widens until it floods the team section orange.
- **Team:** three cards pop in with a tilt.
- **Behind the work:** two image rows. The top row moves left and the bottom row moves right; both flip with scroll direction and slow down on hover.
- **House rules 01–04:** cards stick and stack; a bar fills as each one arrives.
- **We've got range:** every service as a pill; on hover a fat orange stroke fills the pill.

### Before launch: replace the About placeholders

| File | Use |
| --- | --- |
| `assets/about/team-owner.jpg` | Owner (@TeIeAd) photo, 5:6 |
| `assets/about/team-manager.jpg` | Manager (@ExpertsAd) photo, 5:6 |
| `assets/about/team-member.jpg` | Team (@TelesTeam1) photo, 5:6 |
| `assets/about/*.jpg` (the rest) | "Behind the work" tiles, 4:5: office, desk and team photos |

Change names, roles or handles in the `.team-grid` block of `about.html`.
