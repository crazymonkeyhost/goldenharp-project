export function toSpiralMatrixPositions(index: number, columns: number): { row: number; column: number } {
  const row = Math.floor(index / columns);

  return {
    row: Math.floor(index / columns),

    column: row % 2 == 0 ? index % columns : columns - 1 - index % columns,
  };
}

export function getSpiralFlowInRow(row:number):'left' | 'right' {
  return row % 2 == 0 ? 'right' : 'left';

}