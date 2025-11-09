import { adjust } from '../../lib/color.js';
import { randomFloat } from '../../lib/random.js';

export const synthwaveMirage = {
  name: 'synthwaveMirage',
  label: 'Synthwave Mirage',
  draw({ ctx, width, height, colors }) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, adjust(colors[0], { l: 0.4 }));
    skyGradient.addColorStop(0.7, adjust(colors[1] ?? colors[0], { l: -0.2 }));
    skyGradient.addColorStop(1, adjust(colors[2] ?? colors[0], { l: -0.5 }));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const sunRadius = Math.min(width, height) * 0.12;
    const sunX = width * 0.75;
    const sunY = height * 0.3;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunRadius);
    sunGradient.addColorStop(0, adjust(colors[3] ?? colors[0], { l: 0.45 }));
    sunGradient.addColorStop(1, adjust(colors[4] ?? colors[1] ?? colors[0], { l: -0.1 }));
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    const groundY = height * 0.62;
    ctx.fillStyle = adjust(colors[colors.length - 1] ?? '#241132', { l: -0.55 });
    ctx.fillRect(0, groundY, width, height - groundY);

    ctx.strokeStyle = adjust(colors[colors.length - 1] ?? '#ffffff', { l: 0.4 });
    ctx.globalAlpha = 0.5;
    const gridRows = 14;
    for (let i = 1; i < gridRows; i += 1) {
      const t = i / gridRows;
      const y = groundY + (height - groundY) * t * t;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    const gridCols = 24;
    for (let i = -gridCols; i <= gridCols; i += 1) {
      const x = width / 2 + (i / gridCols) * width;
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(width / 2 + (i / (gridCols * 0.25)) * width * 0.04, height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const palmCount = 4;
    for (let i = 0; i < palmCount; i += 1) {
      const baseX = width * (0.15 + i * 0.2 + Math.random() * 0.05);
      const baseY = groundY;
      const trunkHeight = height * randomFloat(0.18, 0.26);
      const trunkWidth = width * 0.01;
      ctx.fillStyle = adjust(colors[colors.length - 2] ?? '#0f0f2f', { l: -0.3 });
      ctx.save();
      ctx.translate(baseX, baseY);
      ctx.rotate(randomFloat(-0.06, 0.06));
      ctx.fillRect(-trunkWidth / 2, -trunkHeight, trunkWidth, trunkHeight);
      ctx.restore();

      const frondCount = 6;
      ctx.strokeStyle = adjust(colors[colors.length - 2] ?? '#0f0f2f', { l: 0.2 });
      ctx.lineWidth = 2;
      for (let f = 0; f < frondCount; f += 1) {
        const angle =
          -Math.PI / 2 + randomFloat(-0.7, 0.7) + (f / frondCount - 0.5) * Math.PI * 0.8;
        const length = trunkHeight * randomFloat(0.7, 1.05);
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
  },
};
