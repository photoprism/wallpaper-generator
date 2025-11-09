import { adjust } from '../../lib/color.js';
import { randomFloat, randomInt, randomPosition } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const snowflakes = {
  name: 'snowflakes',
  label: 'Snowflakes',
  draw({ ctx, width, height, colors }) {
    ctx.fillStyle = adjust(pickColor(colors), { l: -0.55 });
    ctx.fillRect(0, 0, width, height);

    const flakeCount = Math.max(80, Math.floor((width * height) / 40000));
    ctx.lineCap = 'round';

    for (let i = 0; i < flakeCount; i += 1) {
      const x = randomPosition(width);
      const y = randomPosition(height);
      const size = randomInt(8, 24);
      const color = adjust(pickColor(colors), { l: randomFloat(0.2, 0.5) });

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      for (let arm = 0; arm < 6; arm += 1) {
        const angle = (arm * Math.PI) / 3;
        const xEnd = x + size * Math.cos(angle);
        const yEnd = y + size * Math.sin(angle);
        ctx.moveTo(x, y);
        ctx.lineTo(xEnd, yEnd);

        const branchSize = size * 0.45;
        const branchAngle1 = angle + Math.PI / 6;
        const branchAngle2 = angle - Math.PI / 6;
        ctx.moveTo(xEnd, yEnd);
        ctx.lineTo(
          xEnd + branchSize * Math.cos(branchAngle1),
          yEnd + branchSize * Math.sin(branchAngle1),
        );
        ctx.moveTo(xEnd, yEnd);
        ctx.lineTo(
          xEnd + branchSize * Math.cos(branchAngle2),
          yEnd + branchSize * Math.sin(branchAngle2),
        );
      }
      ctx.stroke();
    }
  },
};
