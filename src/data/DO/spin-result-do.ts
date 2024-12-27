import { FreeSpinResponse, FreeSpinTrigger, SpinResponse, TCascade, WinLineData } from '@/api/response-types';
import { roundNumber, safeNumberParse } from '@/core/util/math';
import { PaylineConfig, Paytable, SYMBOLS, TWildSymbol } from '@/config/slot-config';
import { spiralPath } from '@/api/utils/spiral-path';
import { findSymbolPositionsInMatrix } from '@/api/utils/slot-logic-utils';

export class SpinResultDO {
  public status: 'success';

  public bet: number;

  public before_balance: number;

  public after_balance: number;

  public total_win: number;

  public jackpot: number;

  public wheelSymbol: TWildSymbol;

  public bigwin: number;

  public megawin: number;

  public ultrawin: number;

  /** [[reel, row]] */
  public jackpotSymbols: number[][];

  public spin: {
    spin_elements: string[][];
    spin_multi: number;
    spin_win: number;
  };

  public cascades: TCascade[];

  public winLines: RefineWinLineData[];

  // [[reel, row]]
  public genies: number[][];

  // [[reel, row]]
  public keysSymbols: number[][];

  public hasWildInCombinations: boolean;

  public freespin: {
    freespin: number;

    freespin_total: number;

    freespin_hash: string;

    free_spin_bet_level: number;

    freespin_trigger: FreeSpinTrigger;
  };

  public arabian_night: {
    arabian_night: number;
    arabian_night_hash: string | null;
  };

  public supergame: {
    supergame: number;
    supergame_hash: string | null;
  };

  public jars: {
    jars_amount: number;
    jars_total: number;
  };

  public keys: {
    keys_amount: number;
    keys_total: number;
  };

  public freespin_total_win: number;
  public freespin_left: number;

  public custom_message: string;

  static fromResponse(
    response: SpinResponse | FreeSpinResponse,
    _paylines: PaylineConfig[],
    _paytable: Paytable,
    _matrixTransformRequired = true,
  ): SpinResultDO {
    const result = new SpinResultDO();

    result.status = response.status;

    result.before_balance = response.before_balance;

    result.after_balance = response.after_balance;

    result.total_win = roundNumber(safeNumberParse(response.total_win, 0));

    result.spin = {
      spin_elements: response.spin.spin_elements,

      spin_multi: response.spin.spin_multi,

      spin_win: response.spin.spin_win,
    };

    result.cascades = response.cascades;

    if ('bet' in response) {
      result.bet = response.bet;
    }

    if ('bet_level' in response) {
      result.bet = response.bet_level;
    }

    result.freespin = {
      free_spin_bet_level: 0,

      freespin: 0,

      freespin_total: 0,

      freespin_hash: '',

      freespin_trigger: 'normal',
    };

    result.winLines = [];

    if ('freespin' in response) {
      result.freespin = {
        freespin: safeNumberParse(response.freespin.freespin, 0),

        free_spin_bet_level: response.freespin.freespin_bet_level,

        freespin_total: response.freespin.freespin_total,

        freespin_hash: response.freespin.freespin_hash,

        freespin_trigger: response.freespin.freespin_trigger,
      };
    }

    if ('freespin_left' in response && 'freespin_total_win' in response) {
      result.freespin_total_win = roundNumber(safeNumberParse(response.freespin_total_win));

      result.freespin_left = response.freespin_left;
    }


    result.supergame = {
      supergame: safeNumberParse(response.supergame.supergame),

      supergame_hash: response.supergame.supergame_hash,
    };

    result.wheelSymbol = response.wheelSymbol;

    result.jackpot = safeNumberParse(response.jackpot);

    result.bigwin = safeNumberParse(response.bigwin);

    result.megawin = safeNumberParse(response.megawin);

    result.ultrawin = safeNumberParse(response.ultrawin);

    result.custom_message = response.custom_message;

    return result;
  }

  public getLastMatrix(){
    return this.cascades.at(-1)?.spin_elements || this.spin.spin_elements
  }

  get cronusSymbols(): [x: number, y: number][] {
    return findSymbolPositionsInMatrix(this.getLastMatrix(), SYMBOLS.CRONUS);
  }
}

export type RefineWinLineData = WinLineData & {
  multiplierSymbols?: number[][][];
};
