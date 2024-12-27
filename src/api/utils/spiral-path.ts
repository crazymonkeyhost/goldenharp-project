import { slotConfig } from '@/config/slot-config';

export class SpiralPath {
  public readonly columns: number;

  public readonly rows: number;

  public readonly path: Array<[x: number, y: number]> = [];

  // cached path map for quick access to path index by x and y. key is in the format 'x_y'
  private pathMap = new Map<string, number>();

  constructor(columns: number, rows: number) {
    this.columns = columns;
    this.rows = rows;
    this.generatePath();
  }

  /** Iterates over the path by spiral path */
  public forEach(callback: (x: number, y: number, index: number) => void) {
    this.path.forEach(([x, y], index) => {
      callback(x, y, index);
    });
  }

  public arrayToMatrix<T>(array: T[]): T[][] {
    const matrix: T[][] = Array.from({ length: this.rows }, () => Array.from({ length: this.columns }));

    this.path.forEach(([x, y], index) => {
      matrix[y][x] = array[index];
    });

    return matrix;
  }

  public matrixToArray<T>(matrix: T[][]): T[] {
    return Array.from({ length: this.pathLength }, (_, index) => {
      const [x, y] = this.path[index];

      return matrix[y][x];
    });
  }

  public getMatrixPosition(index: number): [x: number, y: number] {
    return this.path[index];
  }

  /** Returns the path index by x and y */
  public getIndexByPosition(x: number, y: number) {
    return this.pathMap.get(`${x}_${y}`)!;
  }

  /** Returns the path direction of current index */
  public getDirection(index: number): 'left' | 'right' {
    return Math.floor(index / this.columns) % 2 === 0 ? 'right' : 'left';
  }

  /** Returns the path slice from start to end */
  getPathSlice(start: number, end: number) {
    return this.path.slice(start, end + 1);
  }

  get pathLength() {
    return this.columns * this.rows;
  }

  private generatePath() {
    for (let i = 0; i < this.pathLength; i++) {
      const y = Math.floor(i / this.columns);

      const x = y % 2 == 0 ? i % this.columns : this.columns - 1 - (i % this.columns);

      this.pathMap.set(`${x}_${y}`, i);

      this.path.push([x, y]);
    }
  }
}

export const spiralPath = new SpiralPath(slotConfig.reels, slotConfig.reelWindow);
