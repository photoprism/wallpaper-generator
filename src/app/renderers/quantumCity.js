import { adjust } from '../../lib/color.js';
import { randomFloat } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const quantumCity = {
  name: 'quantumCity',
  label: 'Quantum City Pulse',
  draw({ ctx, width, height, colors }) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, adjust(colors[0], { l: 0.25 }));
    skyGradient.addColorStop(1, adjust(colors[0], { l: -0.45 }));
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    const skylineHeight = height * 0.65;
    const buildingCount = 24;
    ctx.save();
    ctx.globalAlpha = 0.95;
    for (let i = 0; i < buildingCount; i += 1) {
      const buildingWidth = (width / buildingCount) * randomFloat(0.8, 1.6);
      const buildingHeight = skylineHeight * randomFloat(0.4, 1.05);
      const x =
        (width / buildingCount) * i +
        randomFloat(-(width / buildingCount) * 0.2, (width / buildingCount) * 0.2);
      const y = height - buildingHeight;
      const facade = ctx.createLinearGradient(x, y, x + buildingWidth, y + buildingHeight);
      facade.addColorStop(0, adjust(pickColor(colors), { l: -0.4 }));
      facade.addColorStop(1, adjust(pickColor(colors), { l: -0.15 }));
      ctx.fillStyle = facade;
      ctx.fillRect(x, y, buildingWidth, buildingHeight);

      const windowRows = Math.max(4, Math.floor(buildingHeight / 30));
      const windowCols = Math.max(2, Math.floor(buildingWidth / 18));
      ctx.fillStyle = adjust(pickColor(colors), { l: 0.35 });
      ctx.globalAlpha = 0.35;
      for (let row = 0; row < windowRows; row += 1) {
        for (let col = 0; col < windowCols; col += 1) {
          if (Math.random() < 0.6) continue;
          const wx = x + 6 + col * (buildingWidth / windowCols);
          const wy = y + 6 + row * (buildingHeight / windowRows);
          const ww = buildingWidth / windowCols - 8;
          const wh = buildingHeight / windowRows - 10;
          if (ww <= 0 || wh <= 0) continue;
          ctx.fillRect(wx, wy, ww, wh);
        }
      }
      ctx.globalAlpha = 0.95;
    }
    ctx.restore();

    const scanlines = Math.floor(height / 6);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < scanlines; i += 1) {
      if (i % 2 === 0) continue;
      const y = (height / scanlines) * i;
      ctx.fillRect(0, y, width, 1);
    }
    ctx.globalAlpha = 1;
  },
};
