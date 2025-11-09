import { adjust } from '../../lib/color.js';

export const gradientMesh = {
  name: 'gradientMesh',
  label: 'Gradient Mesh',
  draw({ ctx, width, height, colors }) {
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
};
