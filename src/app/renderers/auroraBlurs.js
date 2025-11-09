import { adjust } from '../../lib/color.js';

export const auroraBlurs = {
  name: 'auroraBlurs',
  label: 'Aurora Blurs',
  draw({ ctx, width, height, colors }) {
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
};
