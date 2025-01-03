import { Container, Text } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { gameStyles } from '@/game-styles';

export class BonusItemIndicator extends Container {
  private readonly animation: Spine;

  private readonly fieldContainer: Container;

  protected readonly field: Text;

  private timer: NodeJS.Timeout;

  constructor(private readonly type: 'bonus' | 'freespin') {
    super();

    this.animation = Spine.from({
      skeleton: 'bonus.json',
      atlas: 'bonus.atlas',
    });
    this.addChild(this.animation);

    this.fieldContainer = new Container();

    this.field = new Text({
      text: '10',
      style: gameStyles.mainSceneFieldValue,
      anchor: { x: 0.5, y: 0.5 },
    });

    this.animation.addSlotObject(type === 'freespin'? 'result' : 'result2', this.fieldContainer);

    this.fieldContainer.addChild(this.field);
  }

  setValue(value: number) {
    this.field.text = value.toString();
  }

  public show() {
    this.visible = true;

    const playAnimation = () =>
      this.animation.state.setAnimation(0, this.type === 'freespin' ? 'bonus1' : 'bonus2', false);

    playAnimation();
    this.timer = setInterval(() => {
      playAnimation();
    }, 2000);
  }

  public hide() {
    this.visible = false;

    clearInterval(this.timer);
  }
}
