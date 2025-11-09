# PhotoPrism — Wallpaper Generator Guidelines

**Last Updated:** November 9, 2025

## Purpose

This file tells automated coding agents (and humans) where to find the single sources of truth for building, testing, and contributing to the Wallpaper Generator project.
Learn more: https://agents.md/

## Sources of Truth

- Makefile targets (always prefer existing targets): [`Makefile`](Makefile)
- Code Maps: [`CODEMAP.md`](CODEMAP.md)
- Vite Documentation: https://vite.dev/guide/
- Frontend entry points: [`index.html`](index.html), [`src/main.js`](src/main.js)
- Build and tooling configuration: [`package.json`](package.json), [`vite.config.js`](vite.config.js), [`tailwind.config.js`](tailwind.config.js), [`eslint.config.js`](eslint.config.js), [`prettier.config.cjs`](prettier.config.cjs)
- Tailwind CSS Documentation: https://tailwindcss.com/docs/
- Mobile Device Resolutions: https://docs.photoprism.app/developer-guide/native-apps/device-resolutions/
- PhotoPrism:
  - Homepage: https://www.photoprism.app/
  - Brand Colors & Gradients: https://www.photoprism.app/static/build/site.7253a49e8318a95a9062.css
  - Logo (SVG): https://dl.photoprism.app/icons/logo.svg
  - Logo (PNG): https://dl.photoprism.app/icons/logo/512.png

> Quick Tip: to inspect GitHub issue details without leaving the terminal, run `curl -s https://api.github.com/repos/photoprism/wallpaper-generator/issues/<id>`.

## Workflow

- Install dependencies with `npm install` (or `make install`) before running local commands.
- Start Vite’s dev server with `npm run dev` (`make dev` mirrors this).
- Lint and format via `npm run lint` / `npm run format` (`make lint`, `make format` provided).
- Produce the single-file wallpaper build using `make build`; the target runs `vite build` with `vite-plugin-singlefile` and renames the output to `dist/index.html`.
- Do not edit `src/prototype/wallpaper-generator.html`; it remains as the historical reference for styling and behavior.
- Tailwind tokens live in `src/styles.css`; the neutral PhotoPrism palette (background `#212121`, muted surfaces, system font stack) should stay the source of truth for UI colors and typography.
- Style selection syncs with the URL hash, and size/format preferences persist in `localStorage` for faster testing.
- WebGL renderers (e.g., Spectrum Dots, Particle Waves, Snowflakes) now run through Three.js using offscreen canvases; render requests are serialized to avoid race conditions between 2D and WebGL outputs.
- Mobile portrait renders (width < height) apply a simulated DPR multiplier so particle sizes remain accurate; DPR caps on iOS keep Safari stable during palette shuffles.
- Downloads prefer the File System Access API when available, fall back to classic anchor downloads elsewhere, and on iOS attempt the Web Share sheet so users can “Save Image” directly to Photos.

### Specs & Style Notes

- Follow the formatting style in this AGENTS.md file when creating new Markdown documents.
- Document headings must use Title Case (capitalize words ≥4 letters in AP-style) across Markdown files to keep generated navigation and changelogs consistent.
- UI components use 12px radius for containers and 8px for interactive elements. Buttons, including `#generate` and `#download`, should share the `.btn` class plus modifiers (e.g., `.btn-primary`) for consistent sizing.
- JavaScript functions must include concise `//` comments describing their purpose.
- When adding new Three.js renderers, ensure point sizes honor the incoming `pixelRatio` argument; likewise, clean up WebGL resources (dispose geometries/materials, call `forceContextLoss`) before returning control.

### Additional Rules & Notes

- **Configuration:** Used variables, flags, and commands **must exist**; if unsure, browse documentation or follow official examples. Verify public images on Docker Hub/GHCR and prefer the latest **floating major** versions. Always **disable telemetry** in services that send usage data to external servers by default.
- **CLI:** When writing CLI examples or scripts, place option flags before positional arguments unless the command requires a different order.
- **Scripts:** Always run `shellcheck` on any script you create or modify before submitting changes.
- **YAML:** When embedding JSON inside YAML, always use block scalar syntax (`key: | …`) rather than inline strings so diffs stay readable and merges remain safe.
