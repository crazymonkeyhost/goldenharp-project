import { SimulationSlotConfig } from '@/api/local-api/local-server-api';
import { slotConfig, SYMBOLS } from '@/config/slot-config';

export const simulationSlotConfig: SimulationSlotConfig = {
  ...slotConfig,
  reel: {
    columns: slotConfig.reels,
    rows: slotConfig.reelWindow,
  },

  symbolsConfiguration: [
    { name: SYMBOLS.LYRE, size: 1, weight: 40, paytable: [0, 0, 0.5, 1, 2.5] },
    { name: SYMBOLS.ROSEBUD, size: 1, weight: 40, paytable: [0, 0, 0.5, 1, 2.5] },
    { name: SYMBOLS.SHIELD, size: 1, weight: 40, paytable: [0, 0, 0.5, 1, 2.5] },
    { name: SYMBOLS.SANDAL, size: 1, weight: 40, paytable: [0, 0, 0.5, 1, 2.5] },
    { name: SYMBOLS.APHRODITE, size: 1, weight: 30, paytable: [0, 0, 0.5, 2.5, 10] },
    { name: SYMBOLS.ATHENA, size: 1, weight: 30, paytable: [0, 0, 0.5, 2.5, 10] },
    { name: SYMBOLS.HADES, size: 1, weight: 30, paytable: [0, 0, 0.5, 2.5, 10] },
    { name: SYMBOLS.POSEIDON, size: 1, weight: 30, paytable: [0, 0, 0.5, 2.5, 10] },
    { name: SYMBOLS.CRONUS, size: 1, weight: 1 },
    { name: SYMBOLS.ZEUS, size: 1, weight: 1 },
    { name: SYMBOLS.WILD_PANDORA, size: 1, weight: 5 },
    { name: SYMBOLS.WILD_TORCH, size: 1, weight: 5 },
    { name: SYMBOLS.WILD_AMPHORA, size: 1, weight: 5 },
    { name: SYMBOLS.WILD_THUNDER, size: 1, weight: 5 },
  ],
};
