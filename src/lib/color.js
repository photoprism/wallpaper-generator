import { clamp, lerp } from './math.js';

// Convert a hex string (e.g. "#ffaa00") into an RGB object.
export function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const segments = normalized.match(/.{1,2}/g);

  if (!segments) {
    return { r: 0, g: 0, b: 0 };
  }

  const [r, g, b] = segments.map((segment) => parseInt(segment, 16));

  return { r, g, b };
}

// Convert RGB channel values (0-255) to a hex string.
export function rgbToHex(r, g, b) {
  const toHex = (value) => value.toString(16).padStart(2, '0');

  return `#${toHex(clamp(r, 0, 255))}${toHex(clamp(g, 0, 255))}${toHex(clamp(b, 0, 255))}`;
}

// Convert RGB values (0-255) to an HSL representation.
export function rgbToHsl(r, g, b) {
  let red = r / 255;
  let green = g / 255;
  let blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue;
  let saturation;
  const lightness = (max + min) / 2;

  if (max === min) {
    hue = saturation = 0;
  } else {
    const diff = max - min;
    saturation = lightness > 0.5 ? diff / (2 - max - min) : diff / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / diff + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / diff + 2;
        break;
      default:
        hue = (red - green) / diff + 4;
    }

    hue /= 6;
  }

  return { h: hue, s: saturation, l: lightness };
}

// Convert HSL values back into RGB channel integers.
export function hslToRgb(h, s, l) {
  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p, q, t) => {
    let temp = t;

    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;

    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);

  return { r, g, b };
}

// Adjust a hex color by tweaking its HSL saturation/lightness.
export function adjust(hex, { s = 0, l = 0 } = {}) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s: sat, l: light } = rgbToHsl(r, g, b);
  const adjustedS = clamp(sat + s, 0, 1);
  const adjustedL = clamp(light + l, 0, 1);
  const rgb = hslToRgb(h, adjustedS, adjustedL);

  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// Linearly interpolate between two hex colors.
export function lerpColor(fromHex, toHex, t) {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);

  return rgbToHex(
    Math.round(lerp(from.r, to.r, t)),
    Math.round(lerp(from.g, to.g, t)),
    Math.round(lerp(from.b, to.b, t)),
  );
}
