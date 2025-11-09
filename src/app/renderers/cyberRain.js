import { adjust } from '../../lib/color.js';
import { randomFloat, randomPosition } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const cyberRain = {
  name: 'cyberRain',
  label: 'Cyber Rain Alley',
  draw({ ctx, width, height, colors }) {
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
};
