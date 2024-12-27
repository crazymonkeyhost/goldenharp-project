import { Container, Sprite, Text } from 'pixi.js';
import { gameStyles } from '@/game-styles';

export class PlayGuiField extends Container {
  private readonly field: Text;

  constructor(label: string) {
    super();

    this.addChild(Sprite.from('text-value-spot')).anchor.set(0.5);

    const title = new Text({
      text: label,
      style: gameStyles.mainSceneFieldLabel,
      anchor: { x: 0.5, y: 1 },
      position: { x: 0, y: -8 },
    });
    this.addChild(title);

    this.field = new Text({
      text: '10',
      style: gameStyles.mainSceneFieldValue,
      anchor: { x: 0.5, y: 0.5 },
      position: { x: 0, y: 5 },
    });
    this.addChild(this.field);
  }

  public setValue(value: string) {
    this.field.text = value;
  }
}
