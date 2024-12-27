import { Assets, Container, Sprite, Text, type Texture } from 'pixi.js';
import { activeBonuses, onBonusActivationListChanged } from '@/data/bonus-store';
import { gameStyles } from '@/game-styles';
import { getTextureByBonusKind } from './get-buy-bonus-icon-texture';

/** Active bonuses list */
export class ActiveBonusesList extends Container {
  private icons: Sprite[] = [];

  constructor() {
    super();

    const title = new Container();
    title.scale.set(0.7);
    title.position.set(-400, 0);
    this.addChild(title);

    const titleBg = Sprite.from('settings-label-bg');
    titleBg.anchor.set(0.5, 0.5);
    title.addChild(titleBg);

    const titleField = new Text({
      text: 'ACTIVE BONUSES',
      style: gameStyles.settingSlider,
      anchor: { x: 0.5, y: 0.5 },
      position: { x: 0, y: 3 },
    });
    title.addChild(titleField);

    for (let i = 0; i < 5; i++) {
      const item = this.createBonusItem();

      item.position.set(i * 150 - 100, 0);

      this.icons.push(item);
      this.addChild(item);
    }

    this.watch();
  }

  private watch(){
    onBonusActivationListChanged.add(()=>{
      this.icons.forEach((icon, index) => {
        const bonus = activeBonuses[index];

        if (!bonus) {
          icon.visible = false;

          return;
        }

        icon.visible = true;

        icon.texture = Assets.get<Texture>(getTextureByBonusKind(bonus.kind));
      });
    }, true)
  }

  private createBonusItem() {
    const icon = new Sprite();
    const scale = 0.7;
    icon.anchor.set(0.5);
    icon.scale.set(scale);
    return icon;
  }

}
