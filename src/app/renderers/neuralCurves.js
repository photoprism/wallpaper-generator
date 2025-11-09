import { adjust } from '../../lib/color.js';
import { lerp } from '../../lib/math.js';

export const neuralCurves = {
  name: 'neuralCurves',
  label: 'Neural Curves',
  draw({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(colors[0], { l: -0.42 });
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const lines = 300;
    for (let index = 0; index < lines; index += 1) {
      const color = adjust(colors[(index % (colors.length - 1 || 1)) + 1] ?? colors[0], {
        l: 0.18,
      });
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
};
