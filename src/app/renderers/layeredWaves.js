import { adjust } from '../../lib/color.js';

export const layeredWaves = {
  name: 'layeredWaves',
  label: 'Layered Waves',
  draw({ ctx, width, height, colors }) {
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
};
