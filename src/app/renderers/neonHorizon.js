import { adjust } from '../../lib/color.js';
import { pickColor } from './helpers.js';

export const neonHorizon = {
  name: 'neonHorizon',
  label: 'Neon Horizon Grid',
  draw({ ctx, width, height, colors }) {
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
};
