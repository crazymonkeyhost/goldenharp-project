import { lowSymbols, PaylineConfig, Paytable, specialSymbols, SYMBOLS, symbols } from '@/config/slot-config';
import { getRandElement } from '@/core/util/math';
import { TCombination, TCombinationItem, WinLineData } from '@/api/response-types';
import { RefineWinLineData } from '@/data/DO/spin-result-do';
import { transposeMatrix } from '@/core/util/matrix';

export function findCombination(
  line: string[],
  from = 0,
  axis: 'x' | 'y',
  oppositeAxisValue: number,
  combinations: TCombination[] = [],
  paytable: Paytable,
  bet = 1,
  wheelWild: string|null = null,
): TCombination[] {
  let i = from;

  let keepStraight = true;

  const combinationItems: TCombinationItem[] = [];

  while (keepStraight && i < line.length) {
    const s = line[i];

    keepStraight =
      combinationItems.length === 0 ||
      combinationItems.every((c) => c.symbol === s || c.symbol.includes('wild') || s.includes('wild'));

    if (keepStraight) {
      combinationItems.push({
        replacedTo: null,
        symbol: s,
        location: [axis === 'x' ? i : oppositeAxisValue, axis === 'y' ? i : oppositeAxisValue],
      });

      i++;
    }
  }

  const symbol = combinationItems.find((c) => !c.symbol.includes('wild'))?.symbol;

  const isWildApplicable = !isSpecialSymbol(symbol!);

  if (
    symbol && // if there is no symbol, it means all symbols are wild (not acceptable)
    combinationItems.length >= 3 && // minimum 3 symbols
    (isWildApplicable || combinationItems.every((c) => c.symbol === symbol)) && // if wild is not applicable, all symbols should be the same
    symbol !== SYMBOLS.CRONUS // cronus is not a normal symbol
  ) {
    combinations.push({
      items: combinationItems,
      symbol,
      win: paytable.getPayout(symbol!, combinationItems.length) * bet,
      type: 'normal',
      wildFeatured : combinationItems.some((c) => c.symbol === wheelWild),
    });
  }

  if (i === line.length) {
    return combinations;
  } else {
    return findCombination(line, i, axis, oppositeAxisValue, combinations, paytable, bet, wheelWild);
  }
}

export function findWinLines(
  this: unknown,
  reels: string[][],
  paylines: PaylineConfig[],
  paytable: Paytable,
  bet = 1,
): WinLineData[] {
  const winLines: WinLineData[] = [];

  for (let l = 0; l < paylines.length; l++) {
    const payline = paylines[l];

    const combination: string[] = [];

    let i = 0;

    let keepStraight = true;

    while (keepStraight && i < payline.length) {
      const j = payline[i];

      if (j === null) {
        i++;
        combination.push('-');
        continue;
      }
      const s = reels[i][j];

      keepStraight =
        combination.length === 0 || combination.every((c) => c === s || c === '-' || c === 'wild') || s === 'wild';

      if (keepStraight) {
        combination.push(s);
      }

      i++;
    }

    const s = combination.find((s) => s !== 'wild' && s !== '-');

    // only wild was in combination
    if (!s) {
      continue;
    }

    const length = combination.filter((s) => s !== '-').length;

    let win = paytable.getPayout(s, length);

    if (!win) continue;

    win *= bet;

    winLines.push({
      line: l + 1,
      patternDefinition: payline,
      pattern: Array.from({ length: combination.length }, (_, i) => payline[i]),
      symbols: combination,
      symbol: s,
      win,
      multi: 1,
      multiX: false,
      // multiplierSymbols,
    });
  }

  return winLines;
}

export function refineWinlines(_reels: string[][], winlines: WinLineData[]): RefineWinLineData[] {
  return winlines.map((line) => {
    return line;
  });
}

export function getFullBigSymbolsInfo(reel: string[], cells = []): { start: number; symbol: string } | null {
  for (const symbol of cells) {
    const start = startIndexOfFullyLocatedSymbol(reel, symbol);

    if (start !== -1) {
      return { start, symbol };
    }
  }

  return null;
}

function startIndexOfFullyLocatedSymbol(reel: string[], symbol: string): number {
  let cnt = 0;
  let start = -1;
  for (let i = 0; i < reel.length; i++) {
    const s = reel[i];

    if (s === symbol) {
      if (start === -1) {
        start = i;
      }

      cnt++;
    } else {
      cnt = 0;
      start = -1;
    }

    if (cnt === 3) {
      break;
    }
  }

  return cnt === 3 ? start : -1;
}

export function findSymbolPositionsInMatrix(matrix: string[][], symbol: string): [x: number, y: number][] {
  const positions: [x: number, y: number][] = [];

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === symbol) {
        positions.push([j, i]);
      }
    }
  }

  return positions;
}

export function transformReelsData(reels: string[][]): string[][] {
  return transposeMatrix(reels).map((reel) => reel.map((symbol) => symbol.replace(/-\d/, '')));
}

export function isLowSymbol(symbolId: string): boolean {
  return lowSymbols.includes(symbolId);
}

export function isSeniorSymbol(symbolId: string): boolean {
  return ['O1', 'O2', 'O3', 'O4'].includes(symbolId);
}

export function isSpecialSymbol(symbolId: string): boolean {
  return specialSymbols.includes(symbolId);
}

export function getRandomSymbol(ignore: string[] = []): string {
  return getRandElement(symbols.filter((s) => !ignore.includes(s)));
}
