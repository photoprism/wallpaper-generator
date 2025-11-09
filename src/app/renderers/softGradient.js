import { niceAngle } from '../../lib/math.js';

export const softGradient = {
  name: 'softGradient',
  label: 'Soft Gradient',
  draw({ ctx, width, height, colors }) {
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
      gradient.addColorStop(index / (colors.length - 1 || 1), color);
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
};
