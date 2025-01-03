import { Container, Sprite, Text } from 'pixi.js';
import { activateBonus, Bonus, BonusKind, boughtBonuses, buyBonus, onBonusBoughtListChanged } from '@/data/bonus-store';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { gameStyles } from '@/game-styles';
import { getTextureByBonusKind } from './get-buy-bonus-icon-texture';
import { currencyFormatter } from '@/core/services/currency-formatter';

export class BonusesList extends Container {
  constructor(list: Bonus[], asStore = false, onBonusBought?: (bonus: Bonus) => void) {
    super();

    const items = list.map((bonus) => this.createBonusItem(bonus, asStore, onBonusBought));
    items.forEach((item, index) => {
      item.position.set(((index % 3) - 1) * 460 - 20, Math.floor(index / 3) * 300 + 150);
      this.addChild(item);
    });
  }

  createBonusItem(bonus: Bonus, asStore = false, onBonusBought?: (bonus: Bonus) => void) {
    const root = new Container();

    const bg = Sprite.from('buy-bonus-bg');
    bg.anchor.set(0.5);
    root.addChild(bg);

    const iconTexture = getTextureByBonusKind(bonus.kind);
    let desctiptionTexture = '';

    switch (bonus.kind) {
      case 'FS':
        desctiptionTexture = 'bonus-desc-fs';
        break;

      case 'BIG_WIN':
        desctiptionTexture = 'bonus-desc-big-win';
        break;

      case 'WILDS':
        desctiptionTexture = 'bonus-desc-wilds';
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
    icon.position.set(-110, -20);
    root.addChild(icon);

    const description = Sprite.from(desctiptionTexture);
    description.anchor.set(0, 1);
    description.position.set(-60, 50);
    description.scale.set(1.1);
    root.addChild(description);

    const price = new Text({
      text: asStore ? currencyFormatter.format(bonus.price) : '0 pcs',
      style: gameStyles.buyBonsPrice,
      anchor: { x: 0, y: 0 },
      position: { x: -25, y: 35 },
    });

    root.addChild(price);

    const button = new SpriteButton({
      textures: getButtonStatesTextures('bonus-card-btn'),
      text: asStore ? 'BUY BONUS' : 'ACTIVATE',
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
    button.view.y = 112;
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
