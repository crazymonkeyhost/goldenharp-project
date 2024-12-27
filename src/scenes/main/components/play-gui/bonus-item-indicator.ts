import { Container } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

export class BonusItemIndicator extends Container {
  private readonly animation: Spine;


  constructor(private readonly type: 'bonus' | 'freespin') {
    super();

    this.animation = Spine.from({
      skeleton: 'bonus.json',
      atlas: 'bonus.atlas',
    });
    this.addChild(this.animation);

    this.animation.state.setAnimation(0, 'bonus1', true);
  }

  setValue(value: number) {
    // this.animation.state.setAnimation(0, 'animation', true
  }

}
