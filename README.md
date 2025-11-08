# PhotoPrism — AI Wallpaper Generator

Generate PhotoPrism-inspired wallpapers with rich neural gradients, aurora waves, and spectrum dots right in your browser. This Vite + Tailwind app rebuilds the legacy prototype on modern tooling so it is easier to extend, theme, and ship as a single HTML file.

## Features

- 🎨 Multiple render styles (soft gradient, aurora blurs, layered waves, gradient mesh, neural curves, neon horizon grid, cyber rain alley, quantum city pulse, synthwave mirage, hologram palms, spectrum dots, Barnsley fern, fractal tree, bokeh bloom, glass bubbles, snowflakes).
- 🌈 Dynamic color palettes (shuffle or edit any number of swatches; palettes align with PhotoPrism’s homepage gradients).
- 🖥️ Resolution presets covering HD through 8K, plus a custom size option with validation.
- ⬇️ One-click download in PNG or JPEG; filenames capture style, resolution, and colors.
- ♿ Keyboard-friendly controls, accessible labels, and consistent button sizing.

## Getting Started

This project expects Node.js 20.10+ and npm 10.5+. Install dependencies with:

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Visit the printed local URL (default http://localhost:5173/) to interact with the app.

### Quality Checks

```bash
npm run lint     # ESLint (flat config, ESLint 9)
npm run format   # Prettier + Tailwind class sorting
```

### Production Build

```bash
make build
```

The build step runs `vite build` with `vite-plugin-singlefile` and writes the self-contained output to `dist/wallpaper-generator.html`.

## Project Structure

- `index.html` — Vite HTML entry and metadata.
- `src/main.js` — Application bootstrap.
- `src/app/index.js` — UI state, canvas orchestration, download logic.
- `src/app/renderers.js` — Canvas render algorithms.
- `src/lib/` — Shared helpers (color math, palettes, noise, math utilities).
- `src/styles.css` — Tailwind layers with the PhotoPrism-neutral dark theme (12px container radius, 8px element radius, system font stack).
- `vite.config.js` — Single-file bundling configuration.
- `tailwind.config.js` / `postcss.config.cjs` — Tailwind + PostCSS setup.
- `eslint.config.js` / `prettier.config.cjs` — Lint/format tooling.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
