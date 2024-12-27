import { TWildSymbol } from '@/config/slot-config';

export type SpinResponse = {
  status: 'success';
  bet: number;
  demo: number;
  bigwin: number;
  jackpot: number;
  ultrawin: number;
  megawin: number;

  before_balance: number;
  after_balance: number;
  spin: {
    spin_elements: string[][];
    spin_multi: number;
    spin_win: number;
  };

  cascades: TCascade[];

  paylines: WinLineData[];

  total_multi: number;
  total_win: number;

  wheelSymbol: TWildSymbol;

  supergame: {
    supergame: number;
    supergame_hash: string | null;
  };

  freespin: {
    freespin: number;
    freespin_total: number;
    freespin_hash: string;
    freespin_bet_level: number;
    freespin_trigger: FreeSpinTrigger;
  };

  custom_message: string;
};

export type TCascade = {
  spin_elements: string[][];
  win_elements: string[][];
  spin_multi: number;
  spin_win: number;
  combinations: TCombination[];
  replacements: TReplacement[];
};

export type TCombinationItem = {
  symbol: string;

  replacedTo: string | null;

  location: [x: number, y: number];
};

export type TCombination = {
  items: TCombinationItem[];
  symbol: string;
  type: 'normal' | 'zeus' | 'wild-torch' | 'wild-thunder';
  wildFeatured: boolean;
  win: number;
};

export type TReplacement = {
  items: TReplacementItem[];

  reason: string;

  // new matrix after replacement
  spin_elements: string[][];
};

export type TReplacementItem = {
  symbol: string;
  location: [x: number, y: number];
};

export type WinLineData = {
  line: number;
  patternDefinition: Array<number | null>;
  pattern: Array<number | null>;
  symbols: string[];
  symbol: string;
  win: number;
  multi: number;
  multiX: boolean;
};

export type FreeSpinResponse = Omit<SpinResponse, 'bet' | 'freespin'> & {
  bet_level: number;
  freespin_amount: number;
  freespin_left: number;
  freespin_total_win: number;
};

export type SuperGameResponse = {
  status: 'success';
  demo: number;
  bet: number;
  before_balance: number;
  after_balance: number;
  freespins_hash: string;
  freespins_bet_level: number;
  freespin_trigger: Exclude<FreeSpinTrigger, 'normal'>;
  freespins_win: number;
  winType: 'zeus' | 'poseidon' | 'hades';
  custom_message: string;
};

export type SuperGameSpinResult = {
  spin_elements: string[][];
  spin_win: number;
  paylines: WinLineData[];
};

export type ArabianNightResponse = {
  status: 'success';
  demo: number;
  before_balance: number;
  after_balance: number;
  freespins_win: number;
  freespins_hash: string | null;
  freespins_bet_level: number;
  custom_message: string;
};

export type PaytableResponse = {
  paytables: Record<string, Record<string | number, number>>;
};

export type PlayerDataResponse = {
  session_uuid: string;

  jars: {
    jars_amount: number;
    jars_total: number;
  };

  keys: {
    keys_amount: number;
    keys_total: number;
  };

  arabian_night: {
    arabian_night: number;
    arabian_night_hash: string | null;
  }[];

  supergame: {
    supergame: number;
    supergame_hash: string | null;
  }[];

  freespin: {
    bet_level: number;
    freespin_left: number;
    freespin_total: number;
    freespin_hash: string | null;
    freespin_trigger: FreeSpinTrigger;
  }[];

  last_spin: string[][] | null;
};

export type FreeSpinTrigger = 'normal' | 'zeus' | 'hades' | 'poseidon';

export type ApiError = {
  status: 'error';
  error: {
    code: number;
    message: string;
    type: string;
  };
};
