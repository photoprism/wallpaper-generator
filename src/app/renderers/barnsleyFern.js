import { adjust } from '../../lib/color.js';
import { randomFloat, randomInt } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const barnsleyFern = {
  name: 'barnsleyFern',
  label: 'Barnsley Fern',
  draw({ ctx, width, height, colors }) {
    const background = adjust(pickColor(colors), { l: -0.6 });
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const scaleX = (width / 6) * randomFloat(0.9, 1.15);
    const scaleY = -(height / 10) * randomFloat(0.9, 1.15);
    const offsetX = width / 2 + randomInt(-50, 50);
    const offsetY = height + randomInt(-50, 50);
    let x = 0;
    let y = 0;
    const iterations = randomInt(60000, 95000);

    ctx.globalAlpha = 0.85;
    for (let i = 0; i < iterations; i += 1) {
      let nextX;
      let nextY;
      const r = Math.random();
      if (r < 0.01) {
        nextX = 0;
        nextY = 0.16 * y;
      } else if (r < 0.86) {
        nextX = 0.85 * x + 0.04 * y;
        nextY = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.93) {
        nextX = 0.2 * x - 0.26 * y;
        nextY = 0.23 * x + 0.22 * y + 1.6;
      } else {
        nextX = -0.15 * x + 0.28 * y;
        nextY = 0.26 * x + 0.24 * y + 0.44;
      }
      x = nextX;
      y = nextY;

      const px = x * scaleX + offsetX;
      const py = y * scaleY + offsetY;
      const pointSize = Math.random() * 1.4 + 0.3;

      ctx.fillStyle = adjust(pickColor(colors), { l: randomFloat(0.05, 0.2) });
      ctx.fillRect(px, py, pointSize, pointSize);
    }
    ctx.globalAlpha = 1;
  },
};
