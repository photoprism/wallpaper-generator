import { adjust, hexToRgb, lerpColor } from '../lib/color.js';
import { clamp, lerp, niceAngle } from '../lib/math.js';
import { randomChoice, randomFloat, randomInt, randomPosition } from '../lib/random.js';

const paletteAt = (colors, t) => {
  if (colors.length === 1) return colors[0];
  const lastIndex = colors.length - 1;
  const position = t * lastIndex;
  const index = Math.floor(position);
  const factor = position - index;
  const nextIndex = Math.min(index + 1, lastIndex);

  return lerpColor(colors[index], colors[nextIndex], factor);
};

const pickColor = (colors, fallback = '#ffffff') => {
  if (!colors || colors.length === 0) {
    return fallback;
  }
  return randomChoice(colors) ?? fallback;
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

  neonHorizon({ ctx, width, height, colors }) {
    const skyTop = adjust(colors[0], { l: 0.25 });
    const skyBottom = adjust(colors[1] ?? colors[0], { l: -0.35 });
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, skyTop);
    skyGradient.addColorStop(0.6, adjust(skyTop, { l: -0.05 }));
    skyGradient.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const sunRadius = Math.min(width, height) * 0.18;
    const sunX = width / 2;
    const sunY = height * 0.42;
    const sunGradient = ctx.createLinearGradient(0, sunY - sunRadius, 0, sunY + sunRadius);
    sunGradient.addColorStop(0, adjust(colors[2] ?? colors[0], { l: 0.3 }));
    sunGradient.addColorStop(1, adjust(colors[3] ?? colors[1] ?? colors[0], { l: -0.1 }));
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = adjust(colors[2] ?? colors[0], { l: 0.4 });
    ctx.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 10; i += 1) {
      const stripeHeight = (sunRadius * 2) / 20;
      const y = sunY - sunRadius + i * stripeHeight * 2;
      ctx.fillRect(sunX - sunRadius, y, sunRadius * 2, stripeHeight);
    }
    ctx.restore();

    const horizonY = height * 0.58;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    const peakCount = 6;
    for (let i = 0; i <= peakCount; i += 1) {
      const x = (width / peakCount) * i;
      const y =
        horizonY -
        height * 0.12 * (0.3 + Math.sin((i / peakCount) * Math.PI) + Math.random() * 0.4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = adjust(pickColor(colors), { l: -0.55 });
    ctx.fill();

    const gridTop = horizonY;
    const gridBottom = height;
    ctx.strokeStyle = adjust(colors[colors.length - 1] ?? '#ffffff', { l: 0.35 });
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;

    const horizonLines = 15;
    for (let i = 1; i < horizonLines; i += 1) {
      const t = i / horizonLines;
      const y = gridTop + (gridBottom - gridTop) * (t * t);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const verticalLines = 20;
    for (let i = -verticalLines; i <= verticalLines; i += 1) {
      const x = width / 2 + (i / verticalLines) * width;
      ctx.beginPath();
      ctx.moveTo(x, gridTop);
      ctx.lineTo(width / 2 + (i / (verticalLines * 0.2)) * width * 0.05, gridBottom);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  cyberRain({ ctx, width, height, colors }) {
    const base = adjust(colors[0], { l: -0.55 });
    const glow = adjust(colors[1] ?? colors[0], { l: 0.15 });
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, base);
    bgGradient.addColorStop(1, adjust(base, { l: -0.1 }));
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    const alleyWidth = width * 0.4;
    ctx.fillStyle = adjust(base, { l: -0.2 });
    ctx.fillRect((width - alleyWidth) / 2, height * 0.55, alleyWidth, height * 0.45);

    const panelCount = 6;
    for (let i = 0; i < panelCount; i += 1) {
      const panelWidth = width * 0.08;
      const panelHeight = height * randomFloat(0.25, 0.45);
      const offsetX = i < panelCount / 2 ? randomFloat(0.05, 0.18) : randomFloat(0.82, 0.95);
      const x = width * offsetX - panelWidth / 2;
      const y = height * randomFloat(0.1, 0.45);
      const panelGradient = ctx.createLinearGradient(x, y, x + panelWidth, y + panelHeight);
      panelGradient.addColorStop(0, adjust(pickColor(colors), { l: 0.35 }));
      panelGradient.addColorStop(0.5, pickColor(colors));
      panelGradient.addColorStop(1, adjust(pickColor(colors), { l: -0.2 }));
      ctx.fillStyle = panelGradient;
      ctx.fillRect(x, y, panelWidth, panelHeight);
    }

    const rainCount = Math.max(400, Math.floor((width * height) / 5000));
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = adjust(glow, { l: 0.2 });
    ctx.globalAlpha = 0.6;
    for (let i = 0; i < rainCount; i += 1) {
      const x = randomPosition(width);
      const y = randomPosition(height);
      const length = randomFloat(height * 0.02, height * 0.08);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - length * 0.1, y + length);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  quantumCity({ ctx, width, height, colors }) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, adjust(colors[0], { l: 0.25 }));
    skyGradient.addColorStop(1, adjust(colors[0], { l: -0.45 }));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const skylineHeight = height * 0.65;
    const buildingCount = 24;
    ctx.save();
    ctx.globalAlpha = 0.95;
    for (let i = 0; i < buildingCount; i += 1) {
      const buildingWidth = (width / buildingCount) * randomFloat(0.8, 1.6);
      const buildingHeight = skylineHeight * randomFloat(0.4, 1.05);
      const x =
        (width / buildingCount) * i +
        randomFloat((-width / buildingCount) * 0.2, (width / buildingCount) * 0.2);
      const y = height - buildingHeight;
      const facade = ctx.createLinearGradient(x, y, x + buildingWidth, y + buildingHeight);
      facade.addColorStop(0, adjust(pickColor(colors), { l: -0.4 }));
      facade.addColorStop(1, adjust(pickColor(colors), { l: -0.15 }));
      ctx.fillStyle = facade;
      ctx.fillRect(x, y, buildingWidth, buildingHeight);

      const windowRows = Math.max(4, Math.floor(buildingHeight / 30));
      const windowCols = Math.max(2, Math.floor(buildingWidth / 18));
      ctx.fillStyle = adjust(pickColor(colors), { l: 0.35 });
      ctx.globalAlpha = 0.35;
      for (let row = 0; row < windowRows; row += 1) {
        for (let col = 0; col < windowCols; col += 1) {
          if (Math.random() < 0.6) continue;
          const wx = x + 6 + col * (buildingWidth / windowCols);
          const wy = y + 6 + row * (buildingHeight / windowRows);
          const ww = buildingWidth / windowCols - 8;
          const wh = buildingHeight / windowRows - 10;
          if (ww <= 0 || wh <= 0) continue;
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
      ctx.globalAlpha = 0.95;
    }
    ctx.restore();

    const scanlines = Math.floor(height / 6);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < scanlines; i += 1) {
      if (i % 2 === 0) continue;
      const y = (height / scanlines) * i;
      ctx.fillRect(0, y, width, 1);
    }
    ctx.globalAlpha = 1;
  },

  synthwaveMirage({ ctx, width, height, colors }) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, adjust(colors[0], { l: 0.4 }));
    skyGradient.addColorStop(0.7, adjust(colors[1] ?? colors[0], { l: -0.2 }));
    skyGradient.addColorStop(1, adjust(colors[2] ?? colors[0], { l: -0.5 }));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const sunRadius = Math.min(width, height) * 0.12;
    const sunX = width * 0.75;
    const sunY = height * 0.3;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunGradient.addColorStop(0, adjust(colors[3] ?? colors[0], { l: 0.45 }));
    sunGradient.addColorStop(1, adjust(colors[4] ?? colors[1] ?? colors[0], { l: -0.1 }));
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    const groundY = height * 0.62;
    ctx.fillStyle = adjust(colors[colors.length - 1] ?? '#241132', { l: -0.55 });
    ctx.fillRect(0, groundY, width, height - groundY);

    ctx.strokeStyle = adjust(colors[colors.length - 1] ?? '#ffffff', { l: 0.4 });
    ctx.globalAlpha = 0.5;
    const gridRows = 14;
    for (let i = 1; i < gridRows; i += 1) {
      const t = i / gridRows;
      const y = groundY + (height - groundY) * t * t;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    const gridCols = 24;
    for (let i = -gridCols; i <= gridCols; i += 1) {
      const x = width / 2 + (i / gridCols) * width;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(width / 2 + (i / (gridCols * 0.25)) * width * 0.04, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const palmCount = 4;
    for (let i = 0; i < palmCount; i += 1) {
      const baseX = width * (0.15 + i * 0.2 + Math.random() * 0.05);
      const baseY = groundY;
      const trunkHeight = height * randomFloat(0.18, 0.26);
      const trunkWidth = width * 0.01;
      ctx.fillStyle = adjust(colors[colors.length - 2] ?? '#0f0f2f', { l: -0.3 });
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(randomFloat(-0.06, 0.06));
      ctx.fillRect(-trunkWidth / 2, -trunkHeight, trunkWidth, trunkHeight);
      ctx.restore();

      const frondCount = 6;
      ctx.strokeStyle = adjust(colors[colors.length - 2] ?? '#0f0f2f', { l: 0.2 });
      ctx.lineWidth = 2;
      for (let f = 0; f < frondCount; f += 1) {
        const angle =
          -Math.PI / 2 + randomFloat(-0.7, 0.7) + (f / frondCount - 0.5) * Math.PI * 0.8;
        const length = trunkHeight * randomFloat(0.7, 1.05);
        ctx.beginPath();
        ctx.moveTo(baseX, baseY - trunkHeight);
        ctx.quadraticCurveTo(
          baseX + Math.cos(angle) * length * 0.4,
          baseY - trunkHeight - Math.sin(angle) * length * 0.6,
          baseX + Math.cos(angle) * length,
          baseY - trunkHeight - Math.sin(angle) * length,
        );
        ctx.stroke();
      }
    }
  },

  hologramPalms({ ctx, width, height, colors }) {
    const base = adjust(colors[0], { l: -0.5 });
    const top = adjust(colors[1] ?? colors[0], { l: 0.3 });
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, top);
    gradient.addColorStop(1, base);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.globalAlpha = 0.4;
    ctx.fillStyle = adjust(pickColor(colors), { l: 0.4 });
    for (let i = 0; i < 120; i += 1) {
      const size = randomFloat(2, 4);
      const x = randomPosition(width);
      const y = randomPosition(height * 0.6);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const horizonY = height * 0.65;
    ctx.fillStyle = adjust(colors[colors.length - 1] ?? '#1a0f2a', { l: -0.4 });
    ctx.fillRect(0, horizonY, width, height - horizonY);

    const waveCount = 5;
    for (let i = 0; i < waveCount; i += 1) {
      const t = i / waveCount;
      const y = horizonY + t * (height - horizonY);
      ctx.globalAlpha = 0.1 + 0.1 * (1 - t);
      ctx.fillStyle = adjust(pickColor(colors), { l: 0.25 });
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= width; x += width / 50) {
        const offset =
          Math.sin((x / width) * Math.PI * 6 + t * Math.PI * 3) * height * 0.01 * (1 - t);
        ctx.lineTo(x, y + offset);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const palmPairs = 3;
    for (let i = 0; i < palmPairs; i += 1) {
      const baseX = width * (0.2 + i * 0.2 + Math.random() * 0.05);
      const baseY = horizonY;
      const trunkHeight = height * randomFloat(0.22, 0.3);
      ctx.fillStyle = adjust(colors[colors.length - 1] ?? '#111022', { l: -0.3 });
      ctx.fillRect(baseX - 4, baseY - trunkHeight, 8, trunkHeight);

      const holoGradient = ctx.createLinearGradient(
        baseX - 4,
        baseY - trunkHeight,
        baseX + 4,
        baseY,
      );
      holoGradient.addColorStop(0, adjust(pickColor(colors), { l: 0.4 }));
      holoGradient.addColorStop(1, adjust(pickColor(colors), { l: -0.2 }));
      ctx.strokeStyle = holoGradient;
      ctx.lineWidth = 3;

      const fronds = 5;
      for (let f = 0; f < fronds; f += 1) {
        const angle = -Math.PI / 2 + (f / (fronds - 1) - 0.5) * Math.PI * 0.9;
        const length = trunkHeight * randomFloat(0.9, 1.1);
        ctx.beginPath();
        ctx.moveTo(baseX, baseY - trunkHeight);
        ctx.quadraticCurveTo(
          baseX + Math.cos(angle) * length * 0.4,
          baseY - trunkHeight - Math.sin(angle) * length * 0.6,
          baseX + Math.cos(angle) * length,
          baseY - trunkHeight - Math.sin(angle) * length,
        );
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
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

  barnsleyFern({ ctx, width, height, colors }) {
    const background = adjust(pickColor(colors), { l: -0.6 });
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const scaleX = (width / 6) * randomFloat(0.9, 1.15);
    const scaleY = -(height / 10) * randomFloat(0.9, 1.15);
    const offsetX = width / 2 + randomInt(-50, 50);
    const offsetY = height + randomInt(-50, 50);
    let x = 0;
    let y = 0;
    const iterations = randomInt(60000, 95000);

    ctx.globalAlpha = 0.85;
    for (let i = 0; i < iterations; i += 1) {
      let nextX;
      let nextY;
      const r = Math.random();
      if (r < 0.01) {
        nextX = 0;
        nextY = 0.16 * y;
      } else if (r < 0.86) {
        nextX = 0.85 * x + 0.04 * y;
        nextY = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.93) {
        nextX = 0.2 * x - 0.26 * y;
        nextY = 0.23 * x + 0.22 * y + 1.6;
      } else {
        nextX = -0.15 * x + 0.28 * y;
        nextY = 0.26 * x + 0.24 * y + 0.44;
      }
      x = nextX;
      y = nextY;

      const px = x * scaleX + offsetX;
      const py = y * scaleY + offsetY;
      const pointSize = Math.random() * 1.4 + 0.3;

      ctx.fillStyle = adjust(pickColor(colors), { l: randomFloat(0.05, 0.2) });
      ctx.fillRect(px, py, pointSize, pointSize);
    }
    ctx.globalAlpha = 1;
  },

  fractalTree({ ctx, width, height, colors }) {
    const background = adjust(pickColor(colors), { l: -0.55 });
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const drawBranch = (startX, startY, length, angle, depth, branchWidth) => {
      if (depth <= 0) {
        return;
      }

      const endX = startX + length * Math.cos(angle);
      const endY = startY + length * Math.sin(angle);

      ctx.strokeStyle = adjust(pickColor(colors), { l: randomFloat(-0.05, 0.15) });
      ctx.lineWidth = branchWidth;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const nextDepth = depth - 1;
      const nextWidth = branchWidth * randomFloat(0.68, 0.78);
      const nextLength = length * randomFloat(0.68, 0.75);
      const angleVariation = Math.PI / 8 + Math.random() * (Math.PI / 16);
      const branchCount = randomInt(2, 3);

      drawBranch(endX, endY, nextLength, angle - angleVariation, nextDepth, nextWidth);
      drawBranch(endX, endY, nextLength, angle + angleVariation, nextDepth, nextWidth);
      if (branchCount === 3) {
        drawBranch(endX, endY, nextLength, angle, nextDepth, nextWidth);
      }
    };

    ctx.save();
    const depth = randomInt(8, 12);
    const trunkLength = height * 0.36;
    const startX = width / 2;
    const startY = height * 1.05;
    ctx.translate(startX, startY);
    drawBranch(0, 0, trunkLength, -Math.PI / 2, depth, 8);
    ctx.restore();
  },

  bokehBloom({ ctx, width, height, colors }) {
    const base = adjust(pickColor(colors), { l: -0.5 });
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, adjust(base, { l: -0.1 }));
    gradient.addColorStop(1, adjust(base, { l: 0.1 }));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const total = Math.max(60, Math.floor((width * height) / 8000));
    const minDim = Math.min(width, height);
    const layers = [
      {
        count: Math.round(total * 0.25),
        blur: 30,
        minRadius: minDim * 0.07,
        maxRadius: minDim * 0.16,
      },
      {
        count: Math.round(total * 0.45),
        blur: 16,
        minRadius: minDim * 0.035,
        maxRadius: minDim * 0.09,
      },
      {
        count: Math.round(total * 0.3),
        blur: 6,
        minRadius: minDim * 0.018,
        maxRadius: minDim * 0.045,
      },
    ];

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const layer of layers) {
      ctx.filter = `blur(${layer.blur}px)`;
      for (let i = 0; i < layer.count; i += 1) {
        const x = randomPosition(width);
        const y = randomPosition(height);
        const radius = randomFloat(layer.minRadius, layer.maxRadius);
        const color = adjust(pickColor(colors), { l: randomFloat(-0.05, 0.18) });
        const { r, g, b } = hexToRgb(color);
        const alpha = randomFloat(0.12, 0.32);
        const gradientCircle = ctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
        gradientCircle.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradientCircle.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradientCircle;
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.filter = 'none';

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < total * 0.4; i += 1) {
      const x = randomPosition(width);
      const y = randomPosition(height);
      const radius = randomFloat(minDim * 0.012, minDim * 0.035);
      const color = adjust(pickColor(colors), { l: randomFloat(-0.05, 0.25) });
      ctx.globalAlpha = randomFloat(0.2, 0.5);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
    ctx.restore();
  },

  glassBubbles({ ctx, width, height, colors }) {
    const palette = colors.length > 0 ? colors : ['#6ec3ff', '#f6f1ff'];
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, adjust(pickColor(palette), { l: -0.2 }));
    gradient.addColorStop(1, adjust(pickColor(palette), { l: 0.1 }));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const bubbleCount = Math.max(40, Math.floor((width * height) / 35000));
    const maxRadius = Math.min(Math.max(width, height) * 0.06, Math.min(width, height) * 0.12);
    for (let i = 0; i < bubbleCount; i += 1) {
      const x = randomPosition(width);
      const y = randomPosition(height);
      const radius = randomInt(20, Math.max(40, Math.round(maxRadius)));
      const baseColor = adjust(pickColor(palette), { l: randomFloat(-0.05, 0.3) });
      const { r, g, b } = hexToRgb(baseColor);

      const bubbleGradient = ctx.createRadialGradient(
        x - radius * 0.35,
        y - radius * 0.35,
        radius * 0.1,
        x,
        y,
        radius,
      );
      bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      bubbleGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.35)`);
      bubbleGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = bubbleGradient;
      ctx.fill();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();

      const highlightRadius = radius * 0.25;
      ctx.beginPath();
      ctx.arc(x - radius * 0.35, y - radius * 0.35, highlightRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();
    }
  },

  snowflakes({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(pickColor(colors), { l: -0.55 });
    ctx.fillRect(0, 0, width, height);

    const flakeCount = Math.max(80, Math.floor((width * height) / 40000));
    ctx.lineCap = 'round';

    for (let i = 0; i < flakeCount; i += 1) {
      const x = randomPosition(width);
      const y = randomPosition(height);
      const size = randomInt(8, 24);
      const color = adjust(pickColor(colors), { l: randomFloat(0.2, 0.5) });

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      for (let arm = 0; arm < 6; arm += 1) {
        const angle = (arm * Math.PI) / 3;
        const xEnd = x + size * Math.cos(angle);
        const yEnd = y + size * Math.sin(angle);
        ctx.moveTo(x, y);
        ctx.lineTo(xEnd, yEnd);

        const branchSize = size * 0.45;
        const branchAngle1 = angle + Math.PI / 6;
        const branchAngle2 = angle - Math.PI / 6;
        ctx.moveTo(xEnd, yEnd);
        ctx.lineTo(
          xEnd + branchSize * Math.cos(branchAngle1),
          yEnd + branchSize * Math.sin(branchAngle1),
        );
        ctx.moveTo(xEnd, yEnd);
        ctx.lineTo(
          xEnd + branchSize * Math.cos(branchAngle2),
          yEnd + branchSize * Math.sin(branchAngle2),
        );
      }
      ctx.stroke();
    }
  },
};

export const DEFAULT_STYLE = 'softGradient';
