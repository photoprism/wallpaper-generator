export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomFloat = (min, max) => Math.random() * (max - min) + min;

export const randomChoice = (values) => {
  if (!values || values.length === 0) {
    return undefined;
  }

  const index = randomInt(0, values.length - 1);
  return values[index];
};

export const randomPosition = (limit) => Math.random() * limit;
