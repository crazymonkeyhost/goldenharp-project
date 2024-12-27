import { Assets, Container, Sprite, Texture } from 'pixi.js';
import { toActionArea, toCanvas, toCanvasCenter } from '@/core/services/resize/resize.service';
import { gameConfig } from '@/config/game-config';

// Background component that is used in all gaming scenes
export class Background extends Container {
  private sprite = Sprite.from(Texture.EMPTY);

  public wheelContainer = new Container();

  private wheelDisguise = Sprite.from(Texture.EMPTY);

  constructor() {
    super();

    this.sprite.anchor.set(0.5);
    this.addChild(this.sprite);
    toCanvasCenter(this.sprite);

    this.wheelContainer.visible = false;
    this.addChild(this.wheelContainer);
    toActionArea(this.wheelContainer, { x: 170, y: gameConfig.height / 2 });

    this.wheelDisguise.visible = false;
    this.wheelDisguise.anchor.set(0, 1);
    this.addChild(this.wheelDisguise);
    toCanvas(this.wheelDisguise, (_, lib) => {
      const center = lib.getCanvasCenter();

      return {
        x: center.x - 2500 / 2,
        y: center.y + 1080 / 2,
      };

      // return { x: center.x - 2500 / 2, y: center.y - 1080 / 2 };
    });
  }



  public switchToMain() {
    this.sprite.texture = Assets.get('main-bg');
    this.wheelDisguise.texture = Assets.get('main-wheel-disguise');

    this.showWheel();
    // this.animation.state.setAnimation(0, 'Background_1', true);
  }

  public switchToSuperGame() {
    this.sprite.texture = Assets.get('supergame-bg');

    this.hideWheel();
    // this.animation.state.setAnimation(0, 'Background_2', true);
  }

  public switchToActualSuperGame(type: 'zeus' | 'hades' | 'poseidon') {
    this.sprite.texture = Assets.get(`${type}-supergame-bg`);

    this.wheelDisguise.texture = Assets.get(`${type}-wheel-disguise`);

    this.showWheel();
  }

  public switchToFreespin() {
    // this.animation.state.setAnimation(0, 'Background_3_freespin', true);

    this.showWheel();
  }


  private hideWheel() {
    this.wheelContainer.visible = false;
    this.wheelDisguise.visible = false;
  }

  private showWheel() {
    this.wheelContainer.visible = true;
    this.wheelDisguise.visible = true;
  }
}
