import { type BonusKind } from '@/data/bonus-store';

export function getTextureByBonusKind(kind: BonusKind) {
  let iconTexture = '';

  switch (kind) {
    case 'DJIN':
      iconTexture = 'bonus-icon-djin';
      break;

    case 'DJIN_JACKPOT':
      iconTexture = 'bonus-icon-djin-jackpot';
      break;

    case 'JACKPOT':
      iconTexture = 'bonus-icon-jackpot';
      break;

    case 'FS_10':
      iconTexture = 'bonus-icon-fs-10';
      break;

    case 'FS_20':
      iconTexture = 'bonus-icon-fs-20';
      break;

    case 'FS_50':
      iconTexture = 'bonus-icon-fs-50';
      break;
  }

  return iconTexture;
}