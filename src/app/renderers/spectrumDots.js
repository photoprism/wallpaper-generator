import { adjust } from '../../lib/color.js';
import { clamp } from '../../lib/math.js';
import { paletteAt } from './helpers.js';

export const spectrumDots = {
  name: 'spectrumDots',
  label: 'Spectrum Dots Wave',
  draw({ ctx, width, height, colors }) {
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
        const t = x / Math.max(1, width - 1);
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
        const t = x / Math.max(1, width - 1);
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
