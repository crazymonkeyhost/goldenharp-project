import { getRandElement, rand } from '@/core/util/math';
import { getSearchParam, hasSearchParam } from '@/core/util/get-search-param';
import { shuffleArray } from '@/core/util/arrays';
import { LocalServerApi } from '@/api/local-api/local-server-api';
import { lowSymbols, seniorSymbols, SYMBOLS, wildSymbols } from '@/config/slot-config';

export const simulation = {
  balance: getSearchParam('balance'),
  key: hasSearchParam('key'),
  cronus: hasSearchParam('cronus'),
  zeus: hasSearchParam('zeus'),
  hades: hasSearchParam('hades'),
  poseidon: hasSearchParam('poseidon'),
  wild: hasSearchParam('wild'),
  jackpot: hasSearchParam('jackpot'),
  megawin: hasSearchParam('megawin'),
  ultrawin: hasSearchParam('ultrawin'),
  bigwin: hasSearchParam('bigwin'),
  customMessage: getSearchParam('custom_message'),
};

export function getSimulationMatrix(
  currentMatrix: string[][],
  slotLogic: LocalServerApi,
  isFreeGames: boolean,
  wild:string
): string[][] {


  if (simulation.wild) {
    const symbol = getRandElement([...lowSymbols, ...seniorSymbols]);

    return placeCombination(currentMatrix, [symbol, wild, symbol]);
  }

  if (simulation.cronus) {
    simulation.cronus = false;

    return scatterSymbolsOnReels(currentMatrix, SYMBOLS.CRONUS, [3, 4]);
  }


  if (simulation.zeus) {
    simulation.zeus = false;

    return placeCombination(currentMatrix, [SYMBOLS.ZEUS, SYMBOLS.ZEUS, SYMBOLS.ZEUS]);
  }

  return currentMatrix;
}

export function getSuperGameSimulation<T>(current: T) {
  if (simulation.zeus) {
    simulation.zeus = false;

    return 'zeus';
  }

  if (simulation.hades) {
    simulation.hades = false;

    return 'hades';
  }

  if (simulation.poseidon) {
    simulation.poseidon = false;

    return 'poseidon';
  }

  return current;
}

function simulateTillAnyWin(_slotLogic: LocalServerApi, _isFreeGames = false): string[][] {
  let _limit = 1000;

  const _result: string[][] = [];

  // while (limit > 0) {
  //   result = LocalServerApi.getRandomReels(
  //      [],
  //     slotLogic.config.reel.columns,
  //     slotLogic.config.reel.rows,
  //   );
  //
  //   const winLines = slotLogic.findWinLines(result);
  //
  //   if (winLines.length > 0) {
  //     console.log(`spinned ${1000 - limit + 1} times to get win`);
  //
  //     break;
  //   }
  //
  //   limit--;
  // }
  //
  return _result;
}

/** scatter some symbols on the reels in random positions */
function scatterSymbolsOnReels(reels: string[][], symbol: string, amount: [from: number, to: number]): string[][] {
  const alreadyOnReels = reels.flat().reduce((acc, cell) => (cell === symbol ? acc + 1 : acc), 0);

  const toAdd = rand(amount[0], amount[1]) - alreadyOnReels;

  if (toAdd <= 0) {
    return reels;
  }

  const availablePositions = reels
    .flatMap((reel, r) => reel.map((s, c) => [s, r, c] as const))
    .filter(([s]) => s !== symbol);

  shuffleArray(availablePositions)
    .slice(0, toAdd)
    .forEach(([_, r, c]) => {
      reels[r][c] = symbol;
    });

  return reels;
}

function placeCombination(reels: string[][], combination: string[]) {
  const lastReel = reels.length - 1;

  combination.forEach((symbol, i) => {
    reels[reels[0].length - 1][lastReel - i] = symbol;
  });

  return reels;
}
