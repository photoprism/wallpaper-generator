import { adjust, hexToRgb } from '../../lib/color.js';
import { randomFloat, randomPosition } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const bokehBloom = {
  name: 'bokehBloom',
  label: 'Bokeh Bloom',
  draw({ ctx, width, height, colors }) {
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
    ctx.globalAlpha = 1;
  },
};
