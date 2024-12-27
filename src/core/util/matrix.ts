export function forEachMatrixElement<T>(matrix: T[][], callback: MatrixCallback<T>) {
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      callback(matrix[y][x], x, y);
    }
  }
}

type MatrixCallback<T> = (value: T, x: number, y: number) => void;

export function transposeMatrix<T>(matrix: T[][]): T[][] {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

export function copyMatrix<T>(matrix: T[][]): T[][] {
  return matrix.map(row => row.slice());
}
