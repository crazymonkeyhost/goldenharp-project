export type SlotConfig = {
  reels: number;

  reelWindow: number;

  symbols: string[];

  paylines: PaylineConfig[];

  defaultInitialCells: string[][];
};

export type PaylineConfig = Array<number | null>;

export const SYMBOLS = {
  LYRE: 'lyre',
  ROSEBUD: 'rosebud',
  SHIELD: 'shield',
  SANDAL: 'sandal',
  APHRODITE: 'aphrodite',
  ATHENA: 'athena',
  HADES: 'hades',
  POSEIDON: 'poseidon',
  CRONUS: 'cronus',
  ZEUS: 'zeus',
  WILD_AMPHORA: 'wild-amphora',
  WILD_THUNDER: 'wild-thunder',
  WILD_TORCH: 'wild-torch',
  WILD_PANDORA: 'wild-pandora',
} as const;

export type TWildSymbol = typeof SYMBOLS.WILD_AMPHORA | typeof SYMBOLS.WILD_THUNDER | typeof SYMBOLS.WILD_TORCH | typeof SYMBOLS.WILD_PANDORA;

export const lowSymbols = [SYMBOLS.LYRE, SYMBOLS.ROSEBUD, SYMBOLS.SHIELD, SYMBOLS.SANDAL] as string[];

export const seniorSymbols = [SYMBOLS.APHRODITE, SYMBOLS.ATHENA, SYMBOLS.HADES, SYMBOLS.POSEIDON] as string[];

export const specialSymbols = [SYMBOLS.CRONUS, SYMBOLS.ZEUS] as string[];

export const wildSymbols = [SYMBOLS.WILD_AMPHORA, SYMBOLS.WILD_THUNDER, SYMBOLS.WILD_TORCH, SYMBOLS.WILD_PANDORA];

export const symbols = [...lowSymbols, ...seniorSymbols, ...specialSymbols, ...wildSymbols];

export const majorCells: string[] = [];

export const slotConfig: SlotConfig = {
  reels: 5,

  reelWindow: 5,

  symbols: [...symbols],

  paylines: [
    [null, 0, 0, 0, 0, 0],
    [null, 1, 1, 1, 1, 1],
    [null, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2],
    [null, 3, 3, 3, 3, 3],
    [null, 0, 1, 0, 1, 0],
    [null, 1, 2, 1, 2, 1],

    [null, 2, 3, 2, 3, 2],
    [1, 2, 1, 2, 1, 2],
    [2, 1, 2, 1, 2, 1],
    [null, 3, 2, 3, 2, 3],
    [null, 2, 1, 2, 1, 2],
    [null, 1, 0, 1, 0, 1],
    [1, 2, 3, 2, 3, 2],
    [2, 1, 0, 1, 0, 1],

    [null, 3, 2, 1, 2, 3],
    [null, 2, 1, 0, 1, 2],
    [null, 0, 0, 3, 0, 0],
    [null, 3, 3, 0, 3, 3],
    [null, 0, 0, 0, 1, 2],
    [null, 1, 1, 1, 2, 3],

    [2, 2, 2, 2, 1, 0],
    [1, 1, 1, 1, 2, 3],
    [1, 2, 3, 2, 1, 0],
    [2, 1, 0, 1, 2, 3],
  ],

  defaultInitialCells: [
    [SYMBOLS.LYRE, SYMBOLS.ROSEBUD, SYMBOLS.SHIELD, SYMBOLS.SANDAL, SYMBOLS.APHRODITE],
    [SYMBOLS.ATHENA, SYMBOLS.HADES, SYMBOLS.POSEIDON, SYMBOLS.CRONUS, SYMBOLS.ZEUS],
    [SYMBOLS.WILD_AMPHORA, SYMBOLS.WILD_THUNDER, SYMBOLS.WILD_TORCH, SYMBOLS.LYRE, SYMBOLS.ROSEBUD],
    [SYMBOLS.SHIELD, SYMBOLS.SANDAL, SYMBOLS.APHRODITE, SYMBOLS.ATHENA, SYMBOLS.HADES],
    [SYMBOLS.POSEIDON, SYMBOLS.CRONUS, SYMBOLS.ZEUS, SYMBOLS.WILD_AMPHORA, SYMBOLS.WILD_THUNDER],
  ],
};

type PayoutConfig = { symbol: string; paytable: number[] };

export class Paytable {
  payouts = new Map<string, number[]>();

  constructor(private readonly config: PayoutConfig[]) {
    config.forEach((payout) => {
      this.payouts.set(payout.symbol, payout.paytable);
    });
  }

  public getPayout(symbol: string, count: number) {
    return this.payouts.get(symbol)?.[count - 1] || 0;
  }
}
