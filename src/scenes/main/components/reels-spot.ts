import { Container } from 'pixi.js';
import { toActionArea } from '@/core/services/resize/resize.service';
import { gameConfig } from '@/config/game-config';

export class ReelsSpot extends Container {
  public readonly slotSpot = new Container();

  public readonly winCellsTopContainer = new Container();

  public readonly winLinesContainer = new Container();

  constructor() {
    super();

    const slotX = 0;
    const slotYY = 90;

    this.slotSpot.x = slotX;
    this.slotSpot.y = slotYY;
    this.addChild(this.slotSpot);

    this.winCellsTopContainer.x = slotX;
    this.winCellsTopContainer.y = slotYY;
    this.addChild(this.winCellsTopContainer);

    this.winLinesContainer.x = slotX;
    this.winLinesContainer.y = slotYY;
    this.addChild(this.winLinesContainer);

    // const logo = this.addChild(Sprite.from('game-logo'));
    // logo.anchor.set(0.5);
    // logo.position.set(slotX + 103, slotYY - 440);

    toActionArea(this, { x: gameConfig.width / 2, y: gameConfig.height / 2 - 80 });
  }
}
