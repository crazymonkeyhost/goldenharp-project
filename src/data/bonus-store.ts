import { Signal } from '@/core/util/signal';

export type Bonus = {
  kind: BonusKind;

  price: number;
}

export type BonusKind = 'FS' | 'BIG_WIN' | 'WILDS' | 'FS_10' | 'FS_20' | 'FS_50';

export const bonusStore: Bonus[] = [
  { kind: 'FS_10', price: 40 },
  { kind: 'FS_20', price: 50 },
  { kind: 'FS_50', price: 60 },
  { kind: 'WILDS', price: 30 },
  { kind: 'BIG_WIN', price: 20 },
  { kind: 'FS', price: 10 },
]

export const boughtBonuses: Bonus[] = [];

export const onBonusBoughtListChanged = new Signal();

export function buyBonus(bonus: Bonus) {
  boughtBonuses.push(bonus);

  onBonusBoughtListChanged.dispatch();
}

export const activeBonuses: Bonus[] = [];

export const onBonusActivationListChanged = new Signal();

export function activateBonus(bonus: Bonus) {
  activeBonuses.push(bonus);

  onBonusActivationListChanged.dispatch();

  boughtBonuses.splice(boughtBonuses.indexOf(bonus), 1);

  onBonusBoughtListChanged.dispatch();
}
