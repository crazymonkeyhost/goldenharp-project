import { simulationSlotConfig } from '@/api/local-api/simulation-slot-config';
import { getArraySlice, shuffleArray } from '@/core/util/arrays';
import { getRandElement, rand, weightedRandom } from '@/core/util/math';
import { wait } from '@/core/util/time';
import { userService } from '@/api/local-api/user-service';
import { getSimulationMatrix, getSuperGameSimulation, simulation } from '@/api/local-api/simulation';
import {
  SuperGameResponse,
  ArabianNightResponse,
  FreeSpinResponse,
  PaytableResponse,
  PlayerDataResponse,
  SpinResponse,
  TCombination,
  TCascade,
  TCombinationItem,
} from '@/api/response-types';
import { majorCells, SlotConfig, SYMBOLS, wildSymbols } from '@/config/slot-config';
import { SpinResultDO } from '@/data/DO/spin-result-do';
import { GameModel } from '@/data/game-model';
import {
  findCombination,
  findSymbolPositionsInMatrix,
  getRandomSymbol,
  isLowSymbol,
} from '@/api/utils/slot-logic-utils';
import { spiralPath } from '@/api/utils/spiral-path';
import { copyMatrix, transposeMatrix } from '@/core/util/matrix';

export class LocalServerApi {
  reels: string[][] = [];

  freeSpinReels: string[][] = [];

  config: SimulationSlotConfig = simulationSlotConfig;

  private arabianNightBonuses: Record<string, ArabianNightResponse> = {};

  private superGames: Record<string, SuperGameResponse> = {};

  private model: GameModel;

  constructor(model: GameModel) {
    this.model = model;

    this.drawFullSlot();
  }

  public async getPlayerData(): Promise<PlayerDataResponse> {
    return {
      supergame: [
        {
          supergame: 0,
          // supergame_hash: 'hash-token',
          supergame_hash: null,
        },
        // {
        //   supergame: 1,
        //   supergame_hash: 'hash-token',
        // },
      ],
      arabian_night: [
        // {
        //   arabian_night_hash: 'hash-token',
        //   arabian_night: 1,
        // },
      ],
      keys: {
        keys_total: 15,
        keys_amount: userService.accumulatedKeys,
      },
      jars: {
        jars_total: 5,
        jars_amount: userService.accumulatedJars,
      },
      last_spin: null,
      freespin: [],
      session_uuid: '',
    };
  }

  public async getPaytableData(): Promise<PaytableResponse> {
    const paytables: Record<string, Record<string | number, number>> = {};

    this.config.symbolsConfiguration.forEach((symbol) => {
      paytables[symbol.name] = {};

      symbol.paytable?.forEach((win, index) => {
        paytables[symbol.name][index + 1] = win;
      });
    });

    return {
      paytables,
    };
  }

  public async getSpinData(_balance: number): Promise<SpinResultDO> {
    await wait(rand(200, 2000)); // artificial delay

    const bet = this.model.bet;

    console.log('Bet:', bet);

    const balanceBefore = userService.balance - bet;

    const result = await this.getResults({ bet }, false);

    // handle balance
    const balanceAfter = balanceBefore + result.total_win;
    userService.balance = balanceAfter;

    // handle free spins
    if (result.freespin.freespin_total > 0) {
      // add free spins to user account
      userService.startFreeSpinSession(result.freespin.freespin_total, bet);
    }

    result.before_balance = balanceBefore;
    result.after_balance = balanceAfter;
    result.bet = bet;

    return SpinResultDO.fromResponse(result, this.config.paylines, this.model.paytable, false);
  }

  public async getFreeSpinData(): Promise<SpinResultDO> {
    // if (userService.freeSpinsLeft <= 0) {
    //   return {
    //     status: 'error',
    //     message: 'Not enough free spins',
    //     balance: userService.balance,
    //   };
    // }

    // same as in bet method but not decreasing balance
    const balanceBefore = userService.balance;
    let balanceAfter = userService.balance;

    const total_bet = userService.data.freeSpins.bet;

    userService.data.freeSpins.left--;

    const spinResult = await this.getResults(
      {
        bet: userService.data.freeSpins.bet,
      },
      true,
    );

    const result: FreeSpinResponse = {
      ...spinResult,
      bet_level: total_bet,
      freespin_amount: 0,
      freespin_left: 0,
      freespin_total_win: 0,
    };

    // accumulate win
    userService.data.freeSpins.win += result.total_win;

    // check re-trigger
    // if (result.freespin.freespin_total > 0) {
    //   userService.reTriggerFreeSpins(result.freespin.freespin_total);
    // }

    const freeSpinSessionAmount = userService.data.freeSpins.win;

    if (userService.freeSpinsLeft === 0) {
      balanceAfter = balanceBefore + userService.data.freeSpins.win;

      userService.endFreeSpinSession();
    }

    userService.balance = balanceAfter;

    result.freespin_left = userService.freeSpinsLeft;
    result.freespin_total_win = freeSpinSessionAmount;
    result.before_balance = balanceBefore;
    result.after_balance = balanceAfter;

    return SpinResultDO.fromResponse(result, this.config.paylines, this.model.paytable, false);
  }

  get spiralLength() {
    return this.config.reel.columns * this.config.reel.rows;
  }

  private async getResults(betaData: BetData, isFreeGames: boolean): Promise<SpinResponse> {
    const spiral = Array.from({ length: this.spiralLength }).map(() => this.getRandomSymbol(isFreeGames));

    const wheelWild = getRandElement(wildSymbols);

    // const wheelWild = SYMBOLS.WILD_THUNDER;

    const matrix = getSimulationMatrix(spiralPath.arrayToMatrix(spiral), this, isFreeGames, wheelWild);

    const cascades = this.getCascades([], matrix, betaData.bet, isFreeGames, wheelWild);

    const lastCascadeMatrix = cascades.at(-1)?.spin_elements || matrix;

    // handle cronus
    const cronusSymbols = findSymbolPositionsInMatrix(lastCascadeMatrix, SYMBOLS.CRONUS);

    const combinationWin = cascades.reduce((acc, cascade) => acc + cascade.spin_win, 0);

    const resultReel = matrix;

    const freeSpinsAwarded = 0;

    const jackpot = simulation.jackpot ? 100 : 0;

    let total_win = jackpot;

    total_win += combinationWin;

    return {
      status: 'success',
      demo: 0,
      jackpot: jackpot,
      bigwin: simulation.bigwin ? 1 : 0,
      megawin: simulation.megawin ? 1 : 0,
      ultrawin: simulation.ultrawin ? 1 : 0,
      spin: {
        spin_elements: resultReel,
        spin_multi: combinationWin / betaData.bet,
        spin_win: combinationWin,
      },
      cascades: cascades,
      total_win: total_win,
      total_multi: total_win / betaData.bet,
      wheelSymbol: wheelWild,
      freespin: {
        freespin: freeSpinsAwarded > 0 ? 1 : 0,
        freespin_total: freeSpinsAwarded,
        freespin_hash: '',
        freespin_bet_level: betaData.bet,
        freespin_trigger: 'normal',
      },

      paylines: [],

      bet: 0,
      before_balance: 0,
      after_balance: 0,
      custom_message: simulation.customMessage || '',
      supergame: {
        supergame: cronusSymbols.length >= 3 ? 1 : 0,
        supergame_hash: cronusSymbols.length >= 3 ? 'hash-token' : null,
      },
    };
  }

  private findCombinations(matrix: string[][], bet: number, wheelWild: string | null): TCombination[] {
    // collect all horizontal combinations
    const horizontalCombinations: TCombination[] = [];

    matrix.forEach((row, y) => {
      horizontalCombinations.push(...findCombination(row, 0, 'x', y, [], this.model.paytable, bet, wheelWild));
    });

    // collect all vertical combinations
    const verticalCombinations: TCombination[] = [];

    const transposedMatrix = transposeMatrix(matrix);

    transposedMatrix.forEach((column, x) => {
      verticalCombinations.push(...findCombination(column, 0, 'y', x, [], this.model.paytable, bet, wheelWild));
    });

    return [...horizontalCombinations, ...verticalCombinations];
  }

  /** get cascades recursively */
  private getCascades(
    acc: TCascade[],
    matrix: string[][],
    bet: number,
    isFreeGame = false,
    wheelWild: string | null = null,
  ): TCascade[] {
    const allCombinations = this.findCombinations(matrix, bet, wheelWild);

    //handle zeus
    allCombinations
      .filter((c) => c.symbol === SYMBOLS.ZEUS)
      .forEach((_) => this.handleZeusCombinations(matrix, allCombinations));

    allCombinations.filter((c) => c.symbol === SYMBOLS.ZEUS);

    const cascade: TCascade = {
      combinations: allCombinations,
      spin_win: 0,
      spin_multi: 0,
      spin_elements: [],
      win_elements: [],
      replacements: [],
    };

    // handle wild features

    const wildHandled = wheelWild === null || this.handleWildFeatures(matrix, cascade, acc, wheelWild, bet);

    // early return if no combinations
    if (cascade.combinations.length === 0) {
      return [];
    }

    // prepare cascade data and explode symbols
    const explodedMatrix = copyMatrix(matrix);

    let spiral: Array<string | null> = spiralPath.matrixToArray(matrix);

    // explode symbols by combinations
    allCombinations.forEach((combination) => {
      combination.items.forEach(({ location: [x, y], symbol }) => {
        explodedMatrix[y][x] = `${symbol}*`;

        spiral[spiralPath.getIndexByPosition(x, y)] = null;
      });
    });

    spiral = spiral.filter((s) => s !== null);

    // fill the rest of the spiral with random symbols
    spiral = [
      ...Array.from({ length: this.spiralLength - spiral.length }, () => this.getRandomSymbol(isFreeGame)),
      ...spiral,
    ];

    const newMatrix = spiralPath.arrayToMatrix(spiral) as string[][];

    const combinationsWin = allCombinations.reduce((acc, combination) => acc + combination.win, 0);

    cascade.combinations = allCombinations;

    cascade.spin_win = combinationsWin;
    cascade.spin_multi = combinationsWin / bet;
    cascade.spin_elements = newMatrix;
    cascade.win_elements = explodedMatrix;

    acc.push(cascade);

    return [cascade, ...this.getCascades(acc, newMatrix, bet, isFreeGame, wildHandled ? null : wheelWild)];
  }

  private getRandomPositions(matrix: string[][], amount) {
    const positions = matrix.flatMap((row, i) => row.map((_, j) => [j, i] as [x: number, y: number]));

    return shuffleArray(positions).slice(0, amount);
  }

  private handleZeusCombinations(matrix: string[][], currentCombos: TCombination[]) {
    const currentCombosPositions = currentCombos.flatMap((c) => c.items.map((i) => i.location));

    const availablePositions = matrix
      .flatMap((row, i) =>
        row
          .map((_, j) => [j, i] as [x: number, y: number])
          .map(([i, j]) =>
            !currentCombosPositions.some(([x, y]) => x === i && y === j) ? ([i, j] as [x: number, y: number]) : null,
          ),
      )
      .filter((s) => s !== null);

    const positions = shuffleArray(availablePositions).slice(0, Math.min(6, availablePositions.length));

    const zeusCombination: TCombination = {
      symbol: '',
      win: 0,
      type: 'zeus',
      wildFeatured: false,

      items: positions.map(([x, y]) => {
        return {
          location: [x, y],
          symbol: matrix[y][x],
          replacedTo: null,
        };
      }),
    };

    currentCombos.push(zeusCombination);
  }

  private handleWildFeatures(
    matrix: string[][],
    currentCascade: TCascade,
    allCascades: TCascade[],
    wheelWild: string | null,
    bet: number,
  ) {
    if (currentCascade.combinations.length !== 0) {
      return false;
    }

    const hasWildFeatured = allCascades.some((c) => c.combinations.some((combo) => combo.wildFeatured));

    if (!hasWildFeatured) {
      return false;
    }

    if (wheelWild === SYMBOLS.WILD_AMPHORA) {
      this.handleWildAmphora(matrix, currentCascade, wheelWild, bet);
    }

    if (wheelWild === SYMBOLS.WILD_TORCH) {
      this.handleWildTorch(matrix, currentCascade);
    }

    if (wheelWild === SYMBOLS.WILD_THUNDER) {
      this.handleWildThunder(matrix, currentCascade);
    }

    return true;
  }

  private handleWildAmphora(matrix: string[][], currentCascade: TCascade, wheelWild: string | null, bet: number) {
    const positions = this.getRandomPositions(matrix, 4);

    positions.forEach(([x, y]) => {
      matrix[y][x] = wheelWild!;
    });

    currentCascade.replacements.push({
      reason: 'wild',

      spin_elements: matrix,

      items: positions.map(([x, y]) => {
        return {
          location: [x, y],
          symbol: matrix[y][x],
        };
      }),
    });

    currentCascade.combinations = [...currentCascade.combinations, ...this.findCombinations(matrix, bet, null)];
  }

  private handleWildTorch(matrix: string[][], currentCascade: TCascade) {
    const positions = matrix
      .flatMap((row, i) =>
        row
          .map((_, j) => [j, i] as [x: number, y: number])
          .map(([i, j]) => (isLowSymbol(matrix[j][i]) ? ([i, j] as [x: number, y: number]) : null)),
      )
      .filter((s) => s !== null);

    const zeusCombination: TCombination = {
      symbol: '',
      win: 0,
      type: 'wild-torch',
      wildFeatured: false,
      items: positions.map(([x, y]) => {
        return {
          replacedTo: null,
          location: [x, y],
          symbol: matrix[y][x],
        };
      }),
    };

    currentCascade.combinations.push(zeusCombination);
  }

  private handleWildThunder(matrix: string[][], currentCascade: TCascade) {
    const verticalLineToDestroy = rand(0, matrix[0].length - 1);

    const positions = matrix
      .flatMap((row, i) =>
        row
          .map((_, j) => [j, i] as [x: number, y: number])
          .map(([x, y]) => (verticalLineToDestroy === x ? ([x, y] as [x: number, y: number]) : null)),
      )
      .filter((s) => s !== null);

    const combination: TCombination = {
      symbol: '',
      win: 0,
      type: 'wild-thunder',
      wildFeatured: false,
      items: positions.map(([x, y]) => {
        return {
          replacedTo: null,
          location: [x, y],
          symbol: matrix[y][x],
        };
      }),
    };

    currentCascade.combinations.push(combination);
  }

  private getRandomSymbol(isFreeGames = false): string {
    const availableSymbols = this.config.symbolsConfiguration.filter((symbol) => {
      if (isFreeGames) {
        return symbol.name !== SYMBOLS.CRONUS;
      }

      return true;
    });

    return weightedRandom(
      availableSymbols.map((s) => s.name),
      availableSymbols.map((s) => s.weight),
    );
  }

  public async getArabianNightBonusData() {
    const bonus = this.arabianNightBonuses['hash-token'] || this.generateArabianBonusData(this.model.bet);

    if (bonus.freespins_win > 0) {
      if (userService.isActiveFreeSpinSession()) {
        userService.reTriggerFreeSpins(bonus.freespins_win);
      } else {
        userService.startFreeSpinSession(bonus.freespins_win, 10);
      }
    }

    return bonus;
  }

  private generateArabianBonusData(bet: number): ArabianNightResponse {
    const result: ArabianNightResponse = {
      status: 'success',
      after_balance: userService.balance,
      before_balance: userService.balance,
      custom_message: '',
      demo: 0,
      freespins_bet_level: bet,
      freespins_hash: 'hash-token-fs',
      freespins_win: 10,
    };

    result.freespins_win = getRandElement([0, 5, 10, 50, 100]);

    return result;
  }

  public getSuperGameData(hash: string): SuperGameResponse {
    const superGame = this.superGames[hash] || this.generateSuperGameData(this.model.bet);

    if (userService.isActiveFreeSpinSession()) {
      userService.reTriggerFreeSpins(superGame.freespins_win);
    } else {
      userService.startFreeSpinSession(superGame.freespins_win, 10);
    }

    return superGame;
  }

  private generateSuperGameData(bet: number): SuperGameResponse {
    const winType = getSuperGameSimulation(getRandElement(['zeus', 'poseidon', 'hades'] as const));

    return {
      status: 'success',
      after_balance: userService.balance,
      before_balance: userService.balance,
      custom_message: '',
      demo: 0,
      freespins_bet_level: bet,
      freespins_hash: 'hash-token-fs',
      freespins_win: 10,
      bet,
      winType: winType,
      freespin_trigger: winType,
    };
  }

  drawFullSlot() {
    // LocalServerApi.drawSlot(this.reels[0].length, this.reels);
  }

  static createSequenceFromWeights(weights: { symbol: string; weight: number }[]) {
    const symbols: string[] = [];
    for (const { symbol, weight } of weights) {
      symbols.push(...Array.from({ length: weight }).map(() => symbol));
    }

    return symbols;
  }

  static getRandomReels(reels: string[][], columns: number, rows: number): string[][] {
    const shifts = Array.from({ length: columns }, () => rand(0, reels[0].length - 1));

    return reels.map((reel, index) => {
      const shift = shifts[index];

      return getArraySlice(reel, shift, rows);
    });
  }

  static drawSlot(rows: number, slotState: string[][] = []) {
    const data: Record<string, string>[] = [];

    for (let i = 0; i < rows; i++) {
      const item: Record<string, string> = {};

      for (let j = 0; j < slotState.length; j++) {
        item[`reel_${j + 1}`] = [...slotState[j]][i];
      }

      data.push(item);
    }

    console.table(data);
  }

  static getFullBigSymbolsInfo(reel: string[], cells = majorCells): { start: number; symbol: string } | null {
    for (const symbol of cells) {
      const start = LocalServerApi.startIndexOfFullyLocatedSymbol(reel, symbol);

      if (start !== -1) {
        return { start, symbol };
      }
    }

    return null;
  }

  static startIndexOfFullyLocatedSymbol(reel: string[], symbol: string): number {
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
}

type SlotSymbolConfig = {
  name: string;
  size: number;
  weight: number;
  paytable?: number[];
};

type ReelConfig = {
  columns: number;
  rows: number;
};

export type SimulationSlotConfig = SlotConfig & {
  symbolsConfiguration: SlotSymbolConfig[];
  reel: ReelConfig;
};

export type UserData = {
  balance: number;
  freeSpins: {
    win: number;
    left: number;
    bet: number;
  };
  keys: {
    keys_amount: number;
    keys_total: number;
  };
  jars: {
    jars_amount: number;
    jars_total: number;
  };
};

type BetData = {
  bet: number;
};
