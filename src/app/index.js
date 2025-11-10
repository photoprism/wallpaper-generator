import { DEFAULT_STYLE, RENDERER_DEFINITIONS, RENDERER_INFO, RENDERERS } from './renderers.js';
import { makeNoisePattern } from '../lib/noise.js';
import { getRandomPalette } from '../lib/palette.js';
import { clamp } from '../lib/math.js';

const STYLE_OPTIONS = RENDERER_DEFINITIONS.map(({ name, label }) => ({
  value: name,
  label,
}));

// Load a saved preference from localStorage (or return the provided fallback).
const loadPreference = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(`photoprism-wallpaper:${key}`);
    if (!stored) return fallback;
    return JSON.parse(stored);
  } catch {
    return fallback;
  }
};

// Persist a preference to localStorage (silently ignore quota errors).
const savePreference = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`photoprism-wallpaper:${key}`, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
};

// Read the current style from the URL hash (if valid).
const getStyleFromHash = () => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.slice(1);
  return hash && RENDERERS[hash] ? hash : null;
};

// Persist the selected style in the URL hash for easy sharing/reloads.
const setStyleHash = (style) => {
  if (typeof window === 'undefined') return;
  const { pathname, search } = window.location;
  const newUrl = style ? `${pathname}${search}#${style}` : `${pathname}${search}`;
  window.history.replaceState(null, '', newUrl);
};

// Ensure custom size objects contain numeric width/height within valid bounds.
const ensureCustomSize = (value) => {
  if (!value || typeof value !== 'object') {
    return { width: 2560, height: 1440 };
  }
  return {
    width: clamp(Number(value.width) || 2560, MIN_WIDTH, MAX_DIMENSION),
    height: clamp(Number(value.height) || 1440, MIN_HEIGHT, MAX_DIMENSION),
  };
};

const SIZE_PRESETS = [
  { value: '1280x720', label: '1280×720 (HD)', width: 1280, height: 720 },
  { value: '1920x1080', label: '1920×1080 (Full HD)', width: 1920, height: 1080 },
  { value: '1080x2340', label: '1080×2340 (iPhone mini)', width: 1080, height: 2340 },
  { value: '1179x2556', label: '1179×2556 (iPhone 15/16)', width: 1179, height: 2556 },
  { value: '2560x1440', label: '2560×1440 (QHD)', width: 2560, height: 1440 },
  { value: '2880x1800', label: '2880×1800 (Mac 15.3")', width: 2880, height: 1800 },
  { value: '3024x1964', label: '3024×1964 (Mac 14.2")', width: 3024, height: 1964 },
  { value: '3440x1440', label: '3440×1440 (Ultrawide)', width: 3440, height: 1440 },
  { value: '3840x2160', label: '3840×2160 (4K)', width: 3840, height: 2160 },
  { value: '5120x2880', label: '5120×2880 (5K)', width: 5120, height: 2880 },
  { value: '7680x4320', label: '7680×4320 (8K)', width: 7680, height: 4320 },
  { value: 'custom', label: 'Custom...' },
];

const FORMAT_OPTIONS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
];

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const MAX_DIMENSION = 20000;
const HEX_PATTERN = /^#?[0-9a-f]{6}$/i;

const isIOSDevice = () => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent ?? '';
  const isiOS = /iPad|iPhone|iPod/.test(userAgent);

  if (!isiOS) {
    return false;
  }

  if (typeof window === 'undefined') {
    return true;
  }

  return !window.MSStream;
};

const layoutMarkup = `
  <div class="app-shell">
    <div class="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4">
          <div class="logo-chip">
            <img
              src="https://dl.photoprism.app/icons/logo.svg"
              alt="PhotoPrism"
              class="h-10 w-10"
              loading="lazy"
            />
          </div>
          <div>
            <h1 class="text-3xl font-semibold tracking-tight">AI Wallpaper Generator</h1>
            <p class="text-sm text-subtle">
              Create smooth, AI-inspired wallpapers with glowing gradients and neural vibes.
            </p>
          </div>
        </div>
        <div class="badge-pill" id="badge">
          <span id="badgeStyle" class="badge-label">Soft Gradient</span>
          <div id="badgeSwatches" class="badge-swatches" aria-hidden="true"></div>
        </div>
      </header>

      <main class="grid gap-6 lg:grid-cols-[360px,1fr]">
        <section class="card-surface" aria-label="Wallpaper controls">
          <div class="space-y-6">
            <div class="space-y-2">
              <label for="styleSelect" class="form-label">Style</label>
              <select id="styleSelect" class="form-input">
                ${STYLE_OPTIONS.map(({ value, label }) => `<option value="${value}">${label}</option>`).join('')}
              </select>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="form-label">Colors</label>
                <button type="button" id="shufflePalette" class="btn text-xs">Shuffle Palette</button>
              </div>
              <div id="paletteGrid" class="flex flex-col gap-3"></div>
              <p class="hint-text">
                Use soft neon hues for the best contrast. Hex inputs accept both shorthand (<code>#123abc</code>) and uppercase.
              </p>
            </div>

            <div class="space-y-3">
              <label for="sizeSelect" class="form-label">Size</label>
              <select id="sizeSelect" class="form-input">
                ${SIZE_PRESETS.map(({ value, label }) => `<option value="${value}">${label}</option>`).join('')}
              </select>
              <div id="customSizeRow" class="hidden gap-3 md:grid md:grid-cols-2">
                <div class="flex flex-col gap-1.5">
                  <label for="customWidth" class="form-label text-xs">Custom Width</label>
                  <input
                    id="customWidth"
                    type="number"
                    min="${MIN_WIDTH}"
                    max="${MAX_DIMENSION}"
                    step="1"
                    class="form-input"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label for="customHeight" class="form-label text-xs">Custom Height</label>
                  <input
                    id="customHeight"
                    type="number"
                    min="${MIN_HEIGHT}"
                    max="${MAX_DIMENSION}"
                    step="1"
                    class="form-input"
                  />
                </div>
                <p class="md:col-span-2 hint-text">
                  Size can range from ${MIN_WIDTH}×${MIN_HEIGHT} to ${MAX_DIMENSION}×${MAX_DIMENSION}.
                </p>
              </div>
            </div>

            <div class="toolbar-grid">
              <button type="button" id="randomStyle" class="btn grow">Random Style</button>
              <button type="button" id="generate" class="btn btn-primary grow">Generate</button>
            </div>

            <div class="toolbar-grid">
              <div class="flex grow items-center gap-2">
                <label for="formatSelect" class="form-label flex-none">Format</label>
                <select id="formatSelect" class="form-input grow">
                  ${FORMAT_OPTIONS.map(({ value, label }) => `<option value="${value}">${label}</option>`).join('')}
                </select>
              </div>
              <button type="button" id="download" class="btn grow">Download</button>
            </div>

            <p class="hint-text">
              Download name includes style, resolution, and colors.
            </p>
          </div>
        </section>

        <section class="card-surface flex flex-col gap-5" aria-label="Wallpaper preview">
          <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <h2 class="text-lg font-semibold">Preview</h2>
            <p class="text-xs text-subtle">
              Tip:
              <span class="font-semibold">Ctrl/⌘ + S</span>
              after downloading lets you pick any folder.
            </p>
          </div>
          <div class="canvas-shell">
            <canvas
              id="wallpaperCanvas"
              width="2560"
              height="1440"
              class="preview-canvas"
              aria-label="Wallpaper preview canvas"
            ></canvas>
          </div>
          <div id="status" class="status-banner">
            Ready.
          </div>
        </section>
      </main>
    </div>
  </div>
`;

const defaultState = () => ({
  style: DEFAULT_STYLE,
  palette: getRandomPalette(),
  sizePreset: loadPreference('sizePreset', '2560x1440'),
  format: loadPreference('format', 'png'),
  customSize: ensureCustomSize(loadPreference('customSize', { width: 2560, height: 1440 })),
  noisePattern: null,
  lastRender: null,
});

const normalizeHex = (value) => {
  const trimmed = value.trim();
  if (!HEX_PATTERN.test(trimmed)) {
    return null;
  }
  const hex = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return hex.toLowerCase();
};

const styleSlug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Friendly label lookup for the currently selected style.
const getStyleLabel = (value) =>
  STYLE_OPTIONS.find((option) => option.value === value)?.label ?? value;

// Clamp user-supplied size values to safe numbers.
const sanitizeDimension = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return clamp(parsed, MIN_WIDTH, MAX_DIMENSION);
};

// Resolve the active dimensions taking the preset/custom settings into account.
const getActiveSize = (state) => {
  if (state.sizePreset === 'custom') {
    const width = clamp(Math.round(state.customSize.width), MIN_WIDTH, MAX_DIMENSION);
    const height = clamp(Math.round(state.customSize.height), MIN_HEIGHT, MAX_DIMENSION);
    return { width, height };
  }

  const [width, height] = state.sizePreset.split('x').map((value) => Number.parseInt(value, 10));
  return { width, height };
};

// Approximate DPR for mobile targets (width < height). Narrower widths imply higher DPR.
const resolveTargetPixelRatio = (width, height) => {
  let ratio = 1;

  if (height > width) {
    if (width <= 1280) ratio = 3;
    else if (width <= 1600) ratio = 2.5;
    else ratio = 2;
  }

  if (isIOSDevice()) {
    ratio = Math.min(ratio, 2.5);
  }

  return ratio;
};

const setStatus = (statusEl, message) => {
  statusEl.textContent = message;
};

// Update the header badge with the active style + palette swatches.
const updateBadge = (state, refs) => {
  refs.badgeStyle.textContent = getStyleLabel(state.style);
  if (!refs.badgeSwatches) {
    return;
  }

  refs.badgeSwatches.innerHTML = '';
  state.palette.forEach((hex) => {
    const swatch = document.createElement('span');
    swatch.className = 'badge-swatch';
    swatch.style.background = hex;
    refs.badgeSwatches.appendChild(swatch);
  });
};

const createPaletteRow = (index, hex, refs, state) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'palette-row';

  const colorInput = document.createElement('input');
  colorInput.type = 'color';
  colorInput.value = hex;
  colorInput.className = 'palette-swatch';
  colorInput.setAttribute('aria-label', `Palette color ${index + 1}`);

  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.value = hex;
  textInput.maxLength = 7;
  textInput.spellcheck = false;
  textInput.autocapitalize = 'characters';
  textInput.autocomplete = 'off';
  textInput.inputMode = 'text';
  textInput.className = 'palette-hex-input';
  textInput.setAttribute('aria-label', `Hex value for color ${index + 1}`);

  const applyHex = (value, syncInputs = true) => {
    const next = normalizeHex(value);
    if (!next) {
      textInput.value = state.palette[index];
      return false;
    }

    state.palette[index] = next;
    state.lastRender = null;
    if (syncInputs) {
      colorInput.value = next;
      textInput.value = next;
    }
    setStatus(refs.status, 'Palette updated. Click Generate to refresh preview.');
    updateBadge(state, refs);
    return true;
  };

  colorInput.addEventListener('input', ({ target }) => {
    applyHex(target.value);
  });

  textInput.addEventListener('blur', ({ target }) => {
    applyHex(target.value);
  });

  textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyHex(event.currentTarget.value);
    }
  });

  wrapper.append(colorInput, textInput);
  return { wrapper, colorInput, textInput };
};

const renderPaletteControls = (state, refs) => {
  refs.paletteGrid.innerHTML = '';
  refs.paletteInputs = state.palette.map((hex, index) => {
    const { wrapper, colorInput, textInput } = createPaletteRow(index, hex, refs, state);
    refs.paletteGrid.appendChild(wrapper);
    return { colorInput, textInput };
  });
};

// Replace the palette with new colors and optionally re-render immediately.
const applyPalette = (state, refs, palette, renderAfter = false) => {
  const nextPalette = palette.length > 0 ? palette : getRandomPalette();
  state.palette = [...nextPalette];
  state.lastRender = null;
  renderPaletteControls(state, refs);
  updateBadge(state, refs);
  setStatus(refs.status, renderAfter ? 'Palette refreshed. Rendering...' : 'Palette shuffled.');
  if (renderAfter) {
    renderCanvas(state, refs);
  }
};

let renderQueue = Promise.resolve();

// Render the wallpaper onto the main canvas (supports both 2D and WebGL renderers).
const renderCanvas = (state, refs) => {
  const runRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(async () => {
        const rendererDef = RENDERER_INFO[state.style] ?? RENDERER_INFO[DEFAULT_STYLE];
        const mode = rendererDef?.mode ?? '2d';
        const applyNoise = rendererDef?.applyNoise ?? true;
        const styleName = rendererDef?.label ?? getStyleLabel(state.style);
        setStatus(refs.status, `Rendering ${styleName}...`);
        state.lastRender = null;

        if (!Array.isArray(state.palette) || state.palette.length === 0) {
          state.palette = getRandomPalette();
          renderPaletteControls(state, refs);
          updateBadge(state, refs);
        }

        const { width, height } = getActiveSize(state);
        refs.canvas.width = width;
        refs.canvas.height = height;
        const pixelRatio = resolveTargetPixelRatio(width, height);
        const renderer = RENDERERS[state.style];
        if (!renderer) {
          throw new Error(`Renderer for style "${state.style}" not found.`);
        }

        let ctx = null;
        if (mode !== 'webgl') {
          ctx = refs.canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas 2D context unavailable.');
          }
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, width, height);
        }

        const drawArgs =
          mode === 'webgl'
            ? { canvas: refs.canvas, width, height, colors: state.palette, pixelRatio }
            : { ctx, canvas: refs.canvas, width, height, colors: state.palette, pixelRatio };

        const finalize = () => {
          const targetCtx = mode === 'webgl' ? refs.canvas.getContext('2d') : ctx;
          if (applyNoise && targetCtx) {
            if (!state.noisePattern) {
              state.noisePattern = makeNoisePattern();
            }
            targetCtx.save();
            targetCtx.globalAlpha = 1;
            targetCtx.fillStyle = state.noisePattern;
            targetCtx.fillRect(0, 0, width, height);
            targetCtx.restore();
          }

          state.lastRender = {
            styleKey: state.style,
            styleName,
            colors: [...state.palette],
            width,
            height,
          };

          setStatus(refs.status, `Rendered ${styleName} • ${width}x${height}`);
          updateBadge(state, refs);
          resolve(state.lastRender);
        };

        try {
          await renderer(drawArgs);
          finalize();
        } catch (error) {
          console.error(error);
          setStatus(refs.status, 'Render failed.');
          resolve(null);
        }
      });
    });

  const previousQueue = renderQueue;
  renderQueue = (async () => {
    try {
      await previousQueue;
    } catch {
      /* ignore prior render errors */
    }
    return runRender();
  })();

  return renderQueue;
};

const supportsFilePicker = () =>
  typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function';

const attemptFilePickerSave = async (blob, filename, mime, format) => {
  if (!supportsFilePicker()) {
    return 'unsupported';
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: format === 'jpeg' ? 'JPEG Image' : 'PNG Image',
          accept: {
            [mime]: [`.${format}`],
          },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return 'saved';
  } catch (error) {
    if (error?.name === 'AbortError') {
      return 'aborted';
    }
    console.error('showSaveFilePicker failed, falling back to default download behaviour.', error);
    return 'failed';
  }
};

const triggerBlobDownload = (blob, filename, statusEl) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  setStatus(statusEl, `Downloaded ${filename}`);
};

const triggerDataUrlDownload = (dataUrl, filename, statusEl) => {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setStatus(statusEl, `Downloaded ${filename}`);
};

const downloadWallpaper = async (state, refs) => {
  const renderInfo = state.lastRender ?? (await renderCanvas(state, refs));
  if (!renderInfo) {
    return;
  }

  const { styleName, colors, width, height } = renderInfo;
  const format = state.format;
  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpeg' ? 0.9 : 1;
  const colorSlug = colors.map((hex) => hex.replace('#', '')).join('-');
  const filename = `aiwallpaper_${styleSlug(styleName)}_${width}x${height}_${colorSlug}.${format}`;

  if (refs.canvas.toBlob) {
    try {
      const blob = await new Promise((resolve, reject) => {
        refs.canvas.toBlob(
          (result) => (result ? resolve(result) : reject(new Error('Canvas toBlob returned null'))),
          mime,
          quality,
        );
      });

      const canShareFile = (file) =>
        typeof navigator !== 'undefined' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] });

      const attemptIOSShare = async (file) => {
        if (!isIOSDevice()) {
          return 'unsupported';
        }
        if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
          return 'unsupported';
        }
        if (!canShareFile(file)) {
          return 'unsupported';
        }
        try {
          await navigator.share({
            files: [file],
            title: 'PhotoPrism — AI Wallpaper',
            text: 'Generated with the PhotoPrism AI Wallpaper Generator.',
          });
          return 'shared';
        } catch (error) {
          if (error?.name === 'AbortError') {
            return 'aborted';
          }
          console.error('navigator.share failed, falling back to download flow.', error);
          return 'failed';
        }
      };

      if (typeof File === 'function') {
        const fileForShare = new File([blob], filename, { type: mime });
        const shareResult = await attemptIOSShare(fileForShare);
        if (shareResult === 'shared') {
          setStatus(refs.status, `Shared ${filename}`);
          return;
        }
        if (shareResult === 'aborted') {
          setStatus(refs.status, 'Share canceled.');
          return;
        }
      }

      const pickerResult = await attemptFilePickerSave(blob, filename, mime, format);
      if (pickerResult === 'saved') {
        setStatus(refs.status, `Saved ${filename}`);
        return;
      }
      if (pickerResult === 'aborted') {
        setStatus(refs.status, 'Save canceled.');
        return;
      }

      triggerBlobDownload(blob, filename, refs.status);
      return;
    } catch (error) {
      console.error('Failed to export canvas as blob, falling back to data URL.', error);
    }
  }

  const dataUrl = refs.canvas.toDataURL(mime, quality);
  triggerDataUrlDownload(dataUrl, filename, refs.status);
};

const getRefs = (root) => {
  const requireEl = (selector) => {
    const element = root.querySelector(selector);
    if (!element) {
      throw new Error(`Expected element "${selector}" in layout.`);
    }
    return element;
  };

  return {
    badge: requireEl('#badge'),
    badgeStyle: requireEl('#badgeStyle'),
    badgeSwatches: requireEl('#badgeSwatches'),
    styleSelect: requireEl('#styleSelect'),
    sizeSelect: requireEl('#sizeSelect'),
    formatSelect: requireEl('#formatSelect'),
    customRow: requireEl('#customSizeRow'),
    customWidth: requireEl('#customWidth'),
    customHeight: requireEl('#customHeight'),
    shuffleButton: requireEl('#shufflePalette'),
    randomStyleButton: requireEl('#randomStyle'),
    generateButton: requireEl('#generate'),
    downloadButton: requireEl('#download'),
    status: requireEl('#status'),
    paletteGrid: requireEl('#paletteGrid'),
    canvas: requireEl('#wallpaperCanvas'),
    paletteInputs: [],
  };
};

const attachEventHandlers = (state, refs) => {
  refs.styleSelect.value = state.style;
  refs.sizeSelect.value = state.sizePreset;
  refs.formatSelect.value = state.format;
  refs.customWidth.value = state.customSize.width;
  refs.customHeight.value = state.customSize.height;

  refs.styleSelect.addEventListener('change', ({ target }) => {
    state.style = target.value;
    state.lastRender = null;
    setStyleHash(state.style);
    updateBadge(state, refs);
    renderCanvas(state, refs);
  });

  const updateCustomVisibility = () => {
    if (state.sizePreset === 'custom') {
      refs.customRow.classList.remove('hidden');
    } else {
      refs.customRow.classList.add('hidden');
    }
  };

  refs.sizeSelect.addEventListener('change', ({ target }) => {
    state.sizePreset = target.value;
    state.lastRender = null;
    savePreference('sizePreset', state.sizePreset);
    updateCustomVisibility();
    if (state.sizePreset !== 'custom') {
      const preset = SIZE_PRESETS.find((option) => option.value === state.sizePreset);
      if (preset) {
        state.customSize = { width: preset.width, height: preset.height };
        refs.customWidth.value = preset.width;
        refs.customHeight.value = preset.height;
        savePreference('customSize', state.customSize);
      }
    }
    setStatus(refs.status, `Size set to ${state.sizePreset}. Click Generate to render.`);
  });

  const syncCustomInputs = () => {
    const nextWidth = sanitizeDimension(refs.customWidth.value, state.customSize.width);
    const nextHeight = sanitizeDimension(refs.customHeight.value, state.customSize.height);
    const changed = nextWidth !== state.customSize.width || nextHeight !== state.customSize.height;

    state.customSize.width = nextWidth;
    state.customSize.height = nextHeight;
    refs.customWidth.value = state.customSize.width;
    refs.customHeight.value = state.customSize.height;

    if (state.sizePreset !== 'custom') {
      state.sizePreset = 'custom';
      refs.sizeSelect.value = 'custom';
      savePreference('sizePreset', state.sizePreset);
      updateCustomVisibility();
    }

    if (changed) {
      state.lastRender = null;
      savePreference('customSize', state.customSize);
      setStatus(refs.status, 'Custom size updated. Click Generate to render.');
    } else {
      savePreference('customSize', state.customSize);
    }
  };

  ['change', 'blur'].forEach((eventName) => {
    refs.customWidth.addEventListener(eventName, syncCustomInputs);
    refs.customHeight.addEventListener(eventName, syncCustomInputs);
  });

  refs.formatSelect.addEventListener('change', ({ target }) => {
    state.format = target.value;
    savePreference('format', state.format);
    setStatus(refs.status, `Format set to ${state.format.toUpperCase()}.`);
  });

  refs.shuffleButton.addEventListener('click', () => {
    applyPalette(state, refs, getRandomPalette(), true);
  });

  refs.randomStyleButton.addEventListener('click', () => {
    const index = Math.floor(Math.random() * STYLE_OPTIONS.length);
    state.style = STYLE_OPTIONS[index].value;
    refs.styleSelect.value = state.style;
    setStyleHash(state.style);
    updateBadge(state, refs);
    renderCanvas(state, refs);
  });

  refs.generateButton.addEventListener('click', () => {
    syncCustomInputs();
    renderCanvas(state, refs);
  });

  refs.downloadButton.addEventListener('click', async () => {
    await downloadWallpaper(state, refs);
  });

  const isEditableElement = (element) => {
    if (!element) {
      return false;
    }
    const tag = element.tagName?.toLowerCase();
    return (
      element.isContentEditable ||
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select'
    );
  };

  const handleSaveShortcut = async (event) => {
    if (
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === 's'
    ) {
      if (event.repeat || isEditableElement(event.target)) {
        return;
      }
      event.preventDefault();
      await downloadWallpaper(state, refs);
    }
  };

  window.addEventListener('keydown', handleSaveShortcut);

  updateCustomVisibility();
};

export const initApp = (root) => {
  root.innerHTML = layoutMarkup;
  const refs = getRefs(root);
  const state = defaultState();
  const hashStyle = getStyleFromHash();
  if (hashStyle) {
    state.style = hashStyle;
  }

  renderPaletteControls(state, refs);
  updateBadge(state, refs);
  attachEventHandlers(state, refs);
  setStyleHash(state.style);
  setStatus(refs.status, 'Ready.');
  renderCanvas(state, refs);
};
