import { adjust, lerpColor } from '../lib/color.js';
import { clamp, lerp, niceAngle } from '../lib/math.js';

const paletteAt = (colors, t) => {
  if (colors.length === 1) return colors[0];
  const lastIndex = colors.length - 1;
  const position = t * lastIndex;
  const index = Math.floor(position);
  const factor = position - index;
  const nextIndex = Math.min(index + 1, lastIndex);

  return lerpColor(colors[index], colors[nextIndex], factor);
};

export const RENDERERS = {
  softGradient({ ctx, width, height, colors }) {
    const angle = niceAngle();
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    const startX = width * (0.5 - x);
    const startY = height * (0.5 - y);
    const endX = width * (0.5 + x);
    const endY = height * (0.5 + y);
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);

    colors.forEach((color, index) => {
      gradient.addColorStop(index / (colors.length - 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    const vignette = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(width, height));
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  },

  auroraBlurs({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(colors[0], { l: -0.3 });
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.filter = 'blur(72px)';
    const blobCount = 6;
    for (let index = 0; index < blobCount; index += 1) {
      const color = colors[index % colors.length];
      const radiusX = (0.2 + Math.random() * 0.6) * width;
      const radiusY = (0.15 + Math.random() * 0.5) * height;
      const centreX = Math.random() * width;
      const centreY = Math.random() * height;
      const blob = ctx.createRadialGradient(
        centreX,
        centreY,
        0,
        centreX,
        centreY,
        Math.max(radiusX, radiusY),
      );
      blob.addColorStop(0, adjust(color, { l: 0.08 }));
      blob.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = blob;
      ctx.beginPath();
      ctx.save();
      ctx.translate(centreX, centreY);
      ctx.scale(radiusX, radiusY);
      ctx.arc(0, 0, 1, 0, Math.PI * 2);
      ctx.restore();
      ctx.fill();
    }
    ctx.restore();

    const verticalFade = ctx.createLinearGradient(0, 0, 0, height);
    verticalFade.addColorStop(0, 'rgba(0,0,0,.12)');
    verticalFade.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = verticalFade;
    ctx.fillRect(0, 0, width, height);
  },

  layeredWaves({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(colors[0], { l: -0.28 });
    ctx.fillRect(0, 0, width, height);

    const layers = 8;
    const baseAmplitude = height * 0.05;
    const baseFrequency = (2 * Math.PI) / (width * (0.6 + Math.random() * 0.7));

    for (let index = 0; index < layers; index += 1) {
      const t = index / (layers - 1);
      const color = colors[index % colors.length];
      const yBase = height * 0.3 + t * height * 0.5 + Math.random() * height * 0.02;
      const amplitude = baseAmplitude * (0.6 + t * 1.2);
      const phase = Math.random() * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 6) {
        const y = yBase + Math.sin(x * baseFrequency + phase) * amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.globalAlpha = 0.09 + t * 0.08;
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },

  gradientMesh({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(colors[0], { l: -0.35 });
    ctx.fillRect(0, 0, width, height);

    const points = 18;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let index = 0; index < points; index += 1) {
      const color = colors[index % colors.length];
      const centreX = Math.random() * width;
      const centreY = Math.random() * height;
      const radius = Math.max(width, height) * (0.12 + Math.random() * 0.28);
      const gradient = ctx.createRadialGradient(centreX, centreY, 0, centreX, centreY, radius);
      gradient.addColorStop(0, adjust(color, { l: 0.08 }));
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centreX, centreY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.8,
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  },

  neuralCurves({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(colors[0], { l: -0.42 });
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const lines = 300;
    for (let index = 0; index < lines; index += 1) {
      const color = adjust(colors[(index % (colors.length - 1)) + 1], { l: 0.18 });
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8 + Math.random() * 1.8;
      ctx.globalAlpha = 0.08 + Math.random() * 0.12;
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;

      const startX = -width * 0.1;
      const startY = Math.random() * height;
      const midX = width * Math.random();
      const midY = Math.random() * height;
      const endX = width * 1.1;
      const endY = Math.random() * height;

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        lerp(startX, midX, 0.5),
        startY * 0.4 + midY * 0.6,
        lerp(midX, endX, 0.5),
        midY * 0.4 + endY * 0.6,
        endX,
        endY,
      );
      ctx.stroke();
    }
    ctx.restore();

    const glow = ctx.createRadialGradient(
      width * 0.7,
      height * 0.3,
      0,
      width * 0.7,
      height * 0.3,
      Math.max(width, height),
    );
    glow.addColorStop(0, 'rgba(0,0,0,0)');
    glow.addColorStop(1, 'rgba(0,0,0,.35)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  },

  spectrumDots({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(colors[0], { l: -0.48 });
    ctx.fillRect(0, 0, width, height);

    const spectrum = colors.slice(1);
    const waveCount = Math.floor(Math.random() * 19) + 2;
    const waves = [];

    for (let index = 0; index < waveCount; index += 1) {
      const row = (index + Math.random() * 0.5) / Math.max(3, waveCount - 1);
      const baseY = height * (0.38 + row * 0.35 + (Math.random() - 0.5) * 0.06);
      waves.push({
        baseY,
        amp: height * (0.07 + Math.random() * 0.1),
        freq: (Math.PI * 2) / (width * (0.85 + Math.random() * 0.5)),
        phase: Math.random() * Math.PI * 2,
        turbAmp: height * (0.015 + Math.random() * 0.035),
        turbFreq: (Math.PI * 2) / (width * (0.25 + Math.random() * 0.45)),
        colorShift: Math.random(),
      });
    }

    const step = clamp(Math.round(width / 420), 5, 12);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.filter = 'blur(6px)';

    for (const wave of waves) {
      for (let x = 0; x < width; x += step) {
        const t = x / (width - 1);
        const yCore = wave.baseY + Math.sin(x * wave.freq + wave.phase) * wave.amp;
        const yTurb = Math.sin(x * wave.turbFreq + wave.phase * 0.7) * wave.turbAmp;
        const y = yCore + yTurb;
        const crest = Math.abs(Math.cos(x * wave.freq + wave.phase));
        const radius = 2 + crest * 1.6;
        ctx.globalAlpha = 0.12 + crest * 0.2;
        const color = paletteAt(spectrum, (t + wave.colorShift) % 1);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const wave of waves) {
      for (let x = 0; x < width; x += step) {
        const t = x / (width - 1);
        const yCore = wave.baseY + Math.sin(x * wave.freq + wave.phase) * wave.amp;
        const yTurb = Math.sin(x * wave.turbFreq + wave.phase * 0.7) * wave.turbAmp;
        const y = yCore + yTurb;
        const crest = Math.abs(Math.cos(x * wave.freq + wave.phase));
        const radius = 1.4 + crest * 1.3;
        const color = paletteAt(spectrum, (t + wave.colorShift) % 1);
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.globalAlpha = 0.75;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.max(width, height),
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  },
};

export const DEFAULT_STYLE = 'softGradient';
