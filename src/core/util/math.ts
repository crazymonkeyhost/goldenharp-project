export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandElement<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

// lerp(0, 10, 0.5) === 5
export function lerp(start: number, end: number, t: number) {
  return start + t * (end - start);
}

// normalize(5, 0, 10) === 0.5
// normalize(5, 0, 5) === 1
export function normalize(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

export function safeNumberParse(value: unknown, defaultValue = 0): number {
  if (typeof value === 'number') {
    return value;
  }

  const parsed = parseFloat(`${value}`);

  return isNaN(parsed) ? defaultValue : parsed;
}

export function roundNumber(number: string | number, fraction = 2): number {
  return Math.round(Number(number) * Math.pow(10, fraction)) / Math.pow(10, fraction);
}

export function weightedRandom<T>(arr: Array<T>, weights: Array<number>): T {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  const randValue = Math.random() * totalWeight;

  let currentWeight = 0;

  for (let i = 0; i < arr.length; i++) {
    currentWeight += weights[i];

    if (randValue <= currentWeight) {
      return arr[i];
    }
  }

  return arr[arr.length - 1];
}
