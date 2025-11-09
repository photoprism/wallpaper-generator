import { adjust } from '../../lib/color.js';
import { randomFloat, randomInt } from '../../lib/random.js';
import { pickColor } from './helpers.js';

export const fractalTree = {
  name: 'fractalTree',
  label: 'Fractal Tree',
  draw({ ctx, width, height, colors }) {
    const background = adjust(pickColor(colors), { l: -0.55 });
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const drawBranch = (startX, startY, length, angle, depth, branchWidth) => {
      if (depth <= 0) {
        return;
      }

      const endX = startX + length * Math.cos(angle);
      const endY = startY + length * Math.sin(angle);

      ctx.strokeStyle = adjust(pickColor(colors), { l: randomFloat(-0.05, 0.15) });
      ctx.lineWidth = branchWidth;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const nextDepth = depth - 1;
      const nextWidth = branchWidth * randomFloat(0.68, 0.78);
      const nextLength = length * randomFloat(0.68, 0.75);
      const angleVariation = Math.PI / 8 + Math.random() * (Math.PI / 16);
      const branchCount = randomInt(2, 3);

      drawBranch(endX, endY, nextLength, angle - angleVariation, nextDepth, nextWidth);
      drawBranch(endX, endY, nextLength, angle + angleVariation, nextDepth, nextWidth);
      if (branchCount === 3) {
        drawBranch(endX, endY, nextLength, angle, nextDepth, nextWidth);
      }
    };

    ctx.save();
    const depth = randomInt(8, 12);
    const trunkLength = height * 0.36;
    const startX = width / 2;
    const startY = height * 1.05;
    ctx.translate(startX, startY);
    drawBranch(0, 0, trunkLength, -Math.PI / 2, depth, 8);
    ctx.restore();
  },
};
