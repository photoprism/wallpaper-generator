import { adjust, hexToRgb } from '../../lib/color.js';
import { randomFloat, randomInt, randomPosition } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const glassBubbles = {
  name: 'glassBubbles',
  label: 'Glass Bubbles',
  draw({ ctx, width, height, colors }) {
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
};
