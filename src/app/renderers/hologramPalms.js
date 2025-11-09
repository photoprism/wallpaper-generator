import { adjust } from '../../lib/color.js';
import { randomFloat, randomPosition } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const hologramPalms = {
  name: 'hologramPalms',
  label: 'Hologram Palms',
  draw({ ctx, width, height, colors }) {
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
};
