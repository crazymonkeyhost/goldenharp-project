import { Container, Sprite } from 'pixi.js';
import { activateBonus, Bonus, BonusKind, boughtBonuses, buyBonus, onBonusBoughtListChanged } from '@/data/bonus-store';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { gameStyles } from '@/game-styles';
import { currencyFormatter } from '@/core/services/currency-formatter';
import { getTextureByBonusKind } from './get-buy-bonus-icon-texture';

export class BonusesList extends Container {
  constructor(list: Bonus[], asStore = false, onBonusBought?: (bonus: Bonus) => void) {
    super();

    const items = list.map((bonus) => this.createBonusItem(bonus, asStore, onBonusBought));
    items.forEach((item, index) => {
      item.position.set(index * 198 - 500, 0);
      this.addChild(item);
    });
  }

  createBonusItem(bonus: Bonus, asStore = false, onBonusBought?: (bonus: Bonus) => void) {
    const root = new Container();

    const scale = 0.9;

    const bg = Sprite.from('buy-bonus-bg');
    bg.anchor.set(0.5);
    bg.scale.set(scale);
    root.addChild(bg);

    const iconTexture = getTextureByBonusKind(bonus.kind);
    let desctiptionTexture = '';

    switch (bonus.kind) {
      case 'DJIN':
        desctiptionTexture = 'bonus-desc-djin';
        break;

      case 'DJIN_JACKPOT':
        desctiptionTexture = 'bonus-desc-djin-jackpot';
        break;

      case 'JACKPOT':
        desctiptionTexture = 'bonus-desc-jackpot';
        break;

      case 'FS_10':
        desctiptionTexture = 'bonus-desc-fs-10';
        break;

      case 'FS_20':
        desctiptionTexture = 'bonus-desc-fs-20';
        break;

      case 'FS_50':
        desctiptionTexture = 'bonus-desc-fs-50';
        break;
    }

    const icon = Sprite.from(iconTexture);
    icon.anchor.set(0.5);
    icon.scale.set(scale);
    root.addChild(icon);

    const description = Sprite.from(desctiptionTexture);
    description.anchor.set(0.5);
    description.y = 150;
    description.scale.set(1.1);
    root.addChild(description);

    const button = new SpriteButton({
      textures: getButtonStatesTextures('main-button'),
      text: asStore ? currencyFormatter.format(bonus.price) : 'ACTIVATE',
      textStyle: gameStyles.buyBonusButton,
      action: () => {
        if (asStore) {
          buyBonus(bonus);
          onBonusBought?.(bonus);
        } else {
          activateBonus(bonus);
        }
      },
    });
    button.view.scale.set(0.65);
    button.view.y = 240;
    root.addChild(button.view);

    if (!asStore) this.watch(button, bonus.kind);

    return root;
  }

  watch(button: SpriteButton, kind: BonusKind) {
    const onChange = () => {
      button.enabled = boughtBonuses.some((bonus) => bonus.kind === kind);
    };

    onBonusBoughtListChanged.add(onChange, true);
  }
}
