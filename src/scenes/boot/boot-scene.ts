import { Scene } from '@/core/scene/Scene';
import { Assets, Sprite } from 'pixi.js';
import { wait } from '@/core/util/time';
import { toCanvasCenter } from '@/core/services/resize/resize.service';
import { GoldenHarpGame } from '@/game/golden-harp-game';

export class BootScene extends Scene<'boot', GoldenHarpGame> {
  private unsubscribeResize = () => {};

  constructor() {
    super('boot');
  }

  async preload(): Promise<void> {
    await Assets.loadBundle('boot')
  }

  async create(): Promise<void> {
    super.create();

    const logo = new Sprite(Assets.get('boot/creative-gaming-logo'));

    logo.anchor.set(0.5);
    logo.x = this.game.config.width / 2;
    logo.y = this.game.config.height / 2;

    this.unsubscribeResize = toCanvasCenter(logo);

    this.stage.addChild(logo);
  }

  async show() {
    super.show();

    await wait(200).done;
  }

  destroy() {
    super.destroy();

    this.unsubscribeResize();

    Assets.unloadBundle('boot');

    this.stage.destroy({ children: true });
  }
}
