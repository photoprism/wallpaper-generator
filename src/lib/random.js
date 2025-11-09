// Random integer between min and max (inclusive).
export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Random float between min and max.
export const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Return a random item from an array.
export const randomChoice = (values) => {
  if (!values || values.length === 0) {
    return undefined;
  }

  const index = randomInt(0, values.length - 1);
  return values[index];
};

// Generate a random float from 0 to limit.
export const randomPosition = (limit) => Math.random() * limit;
