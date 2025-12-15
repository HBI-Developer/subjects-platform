export default function randint(min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new TypeError("randint: both min and max must be integers");
  }
  if (max < min) {
    throw new RangeError("randint: max must be >= min");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
