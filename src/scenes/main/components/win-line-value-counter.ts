import { Container,  BitmapText } from 'pixi.js';
import { currencyFormatter } from '@/core/services/currency-formatter';
import { toActionArea } from '@/core/services/resize/resize.service';
import { gameConfig } from '@/config/game-config';
import { Counter } from '@/core/components/counter';

export class WinLineValueCounter extends Container {
  private readonly valueText: BitmapText;

  private _counter: Counter;

  constructor() {
    super();

    this.valueText = new BitmapText({
      text: 'win-counter',
      style: {
        fontFamily: 'win-counter-bm',
        fontSize: 100,
      },
    });
    this.valueText.anchor.set(0.5);
    this.addChild(this.valueText);

    this._counter = new Counter({
      duration: 500,
      callback: (value) => {
        this.valueText.text = `+${currencyFormatter.format(value)}`;
      },
    });

    toActionArea(this, { x: gameConfig.width / 2, y: gameConfig.height / 2 - 20 });

    this.hide();
  }

  public async countWin(value: number) {
    if (!this.visible) {
      this.show();
    }

    this.valueText.text = currencyFormatter.format(value);

    await this._counter.playFromTo(0, value);
  }

  public show() {
    this.visible = true;
  }

  public hide() {
    this.visible = false;

    if (this._counter.isPlaying) {
      this._counter.stop();
    }
  }
}
