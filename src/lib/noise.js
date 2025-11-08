export function makeNoisePattern(alpha = 0.035) {
  const size = 160;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Unable to get 2D context for noise pattern.');
  }

  const image = ctx.createImageData(size, size);
  const { data } = image;

  for (let index = 0; index < data.length; index += 4) {
    const value = Math.floor(Math.random() * 255);
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = Math.round(alpha * 255);
  }

  ctx.putImageData(image, 0, 0);
  return ctx.createPattern(canvas, 'repeat');
}
