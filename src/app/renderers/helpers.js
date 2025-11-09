import { lerpColor } from '../../lib/color.js';
import { clamp } from '../../lib/math.js';
import { randomChoice } from '../../lib/random.js';

export const paletteAt = (colors, t) => {
  if (!colors || colors.length === 0) {
    return '#ffffff';
  }

  if (colors.length === 1) {
    return colors[0];
  }

  const lastIndex = colors.length - 1;
  const position = t * lastIndex;
  const index = Math.floor(position);
  const factor = position - index;
  const nextIndex = Math.min(index + 1, lastIndex);

  return lerpColor(colors[index], colors[nextIndex], clamp(factor, 0, 1));
};

export const pickColor = (colors, fallback = '#ffffff') => {
  if (!colors || colors.length === 0) {
    return fallback;
  }

  return randomChoice(colors) ?? fallback;
};
