import { Bookmark } from '@/game/components/shared/bookmark';
import { Assets, Texture, Text } from 'pixi.js';
import { gameStyles } from '@/game-styles';

export class BuyBonusBookmark extends Bookmark {

  constructor(text: string) {
    super();

    this.bg.texture = Assets.get<Texture>('main-button-normal');

    const textSprite = new Text({text, style: gameStyles.buyBonusTabButton, anchor: 0.5});

    this.addChild(textSprite);
  }


  public activate() {
    super.activate();

    this.bg.texture = Assets.get<Texture>('main-button-pressed');
  }

  public deactivate() {
    super.deactivate();

    this.bg.texture = Assets.get<Texture>('main-button-normal');
  }
}
