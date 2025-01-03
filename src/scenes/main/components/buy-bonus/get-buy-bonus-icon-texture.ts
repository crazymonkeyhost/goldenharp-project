import { type BonusKind } from '@/data/bonus-store';

export function getTextureByBonusKind(kind: BonusKind) {
  let iconTexture = '';

  switch (kind) {
    case 'FS':
      iconTexture = 'bonus-icon-fs-chance';
      break;

    case 'BIG_WIN':
      iconTexture = 'bonus-icon-big-win';
      break;

    case 'WILDS':
      iconTexture = 'bonus-icon-wilds';
      break;

    case 'FS_10':
      iconTexture = 'bonus-icon-fs';
      break;

    case 'FS_20':
      iconTexture = 'bonus-icon-fs';
      break;

    case 'FS_50':
      iconTexture = 'bonus-icon-fs';
      break;
  }

  return iconTexture;
}
