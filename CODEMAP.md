# PhotoPrism — AI Wallpaper Generator CODEMAP

**Last Updated:** November 9, 2025

## Purpose

- Give agents and contributors a fast, reliable map of where things live and how they fit together, so you can add features, fix bugs, and write tests without spelunking.
- Sources of truth: prefer Makefile targets and documentation linked in AGENTS.md.

## Application Layout

- `index.html`: Vite HTML entry with metadata and `/src/main.js` script hook.
- `src/main.js`: boots the Tailwind UI once the DOM is ready.
- `src/app/index.js`: orchestrates state, controls, canvas rendering, and download workflow.
- `src/app/renderers.js`: houses the style-specific algorithms (soft gradient, aurora, gradient mesh, neural curves, particle waves, spectrum dots, bokeh bloom, Barnsley fern, fractal tree, snowflakes, layered waves, etc.). Many renderers (particle waves, spectrum dots, snowflakes) now rely on Three.js and expect a `{ pixelRatio }` argument for high-DPI rendering.
- `src/app/renderers/`: contains individual renderer modules. WebGL styles create offscreen Three.js scenes, render to a data URL, and blit to the main canvas; each module disposes geometries/materials and optionally skips noise overlays (`applyNoise: false`) where appropriate.
- `src/lib/`: shared helpers for color math, random palettes, and noise textures. `palette.js` now supports variable-length palettes aligned with homepage gradients.
- `src/lib/random.js`: utility helpers for random numbers and palette sampling across renderers.
- `src/styles.css`: Tailwind layers (base/components) defining the neutral PhotoPrism-inspired dark theme (background `#212121`, 12px container radius, 8px element radius, system font stack).
- URL hash stores the active style; `localStorage` keeps size/format/custom dimensions between sessions. Renders are serialized via a queue in `renderCanvas` to avoid overlapping 2D/WebGL draws.
- `downloadWallpaper` supports File System Access API saves, iOS Web Share-based transfers to Photos, and falls back to anchor downloads; keyboard shortcut `Ctrl/⌘ + S` hooks into the same logic.

## Build And Tooling

- `package.json`: npm scripts (`dev`, `build`, `lint`, `format`) and devDependencies (Vite 7, Tailwind 3, ESLint 9).
- `vite.config.js`: enables `vite-plugin-singlefile`, inlines assets, and targets `dist/`.
- `tailwind.config.js` + `postcss.config.cjs`: theme extensions, forms plugin, and PostCSS pipeline.
- `eslint.config.js`: Flat-config ESLint 9 setup with import, node, promise, and Prettier integration.
- `prettier.config.cjs` / `.prettierignore`: formatting defaults plus Tailwind class sorting.
- `Makefile`: wraps npm workflows; `make build` emits `dist/index.html` (self-contained bundle), plus `dev`, `lint`, `format`, `install`.
