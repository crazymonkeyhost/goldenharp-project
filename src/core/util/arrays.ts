import { isFunction } from '@/core/util/functions';

export function createMatrix<T>(rows: number, columns: number, value: T): T[][] {
  return Array.from({ length: rows }, () => Array.from({ length: columns }, () => value));
}

export function getMatrixCell<T>(matrix: T[][], x: number, y: number): T {
  return matrix[y][x];
}

export function setMatrixCell<T>(matrix: T[][], x: number, y: number, value: T): void {
  matrix[y][x] = value;
}

export function createArray<T>(length: number, value: T | ((i: number) => T)): T[] {
  return Array.from({ length }, (_, i) => (isFunction(value) ? value(i) : value));
}

export function shuffleArray<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

export function getArraySlice<T>(arr: T[], start: number, cnt: number): T[] {
  return [...arr, ...arr].slice(start, start + cnt);
}
