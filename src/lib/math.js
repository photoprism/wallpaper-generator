// Clamp a value so it always falls within [min, max].
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Linearly interpolate between start and end with parameter t (0..1).
export const lerp = (start, end, t) => start + (end - start) * t;

// Generate a random integer angle (0..359) for convenience.
export const niceAngle = () => Math.floor(Math.random() * 360);
