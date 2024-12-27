import { Container } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { toActionArea } from '@/core/services/resize/resize.service';
import { gameConfig } from '@/config/game-config';
import { rand } from '@/core/util/math';

export class Logo extends Container {
  private readonly animation: Spine;

  constructor() {
    super();

    this.animation = Spine.from({
      atlas: 'logo.atlas',
      skeleton: 'logo.json',
    });

    this.addChild(this.animation);

    toActionArea(this, { x: gameConfig.width / 2, y: 140 });

    this.playAllTime();
  }

  private playAllTime(){
    this.animation.state.setAnimation(0, 'logo', false);

    setTimeout(this.playAllTime.bind(this), rand(40000, 50000));
  }

}
