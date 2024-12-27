import { Container,  Text } from 'pixi.js';
import { PressedSpriteButton } from '@/core/ui/pressed-sprite-button';
import { currencyFormatter } from '@/core/services/currency-formatter';
import { gameStyles } from '@/game-styles';
import { TapPageItem } from './bookmark-tab-pages';

/** Bets settings page */
export class BetsSettingsPage implements TapPageItem {
  public readonly title: Text;

  public readonly content: Container;

  constructor(betValues: number[], defaultBetValue: number, onBetSelected: (bet: number) => void) {
    this.title = this.createTitle();

    this.content = this.createContent(betValues, defaultBetValue, onBetSelected);
  }

  protected createTitle() {
    const title = new Text({text : 'BETS', style: gameStyles.settingsTitle2});

    title.x = 40;
    title.y = 80;

    return title;
  }

  protected createContent(betValues: number[], defaultBetValue: number, onBetSelected: (bet: number) => void) {
    const content = new Container();


    let activeButton: PressedSpriteButton | null = null;

    const onBetValueChange = (button: PressedSpriteButton, value: number) => {
      if (activeButton) {
        activeButton.deactivate();
        activeButton.enabled = true;
      }

      activeButton = button;
      activeButton.enabled = false;
      activeButton.activate();

      onBetSelected(value);
    };

    const defaultValueIndex = Math.max(betValues.indexOf(defaultBetValue), 0);

    const buttons = betValues.map((value, index) => {
      const button = new PressedSpriteButton({
        textures: ['bet-select-normal', 'bet-select-pressed', 'bet-select-hover', 'bet-select-pressed'],
        text: currencyFormatter.format(value),
        textStyle: gameStyles.betSettingValue,
        action: () => onBetValueChange(button, value),
      });

      button.textView.y +=3;

      if (index === defaultValueIndex) {
        activeButton = button;
        button.activate();
      }

      return button;
    });

    // add all buttons and arrange
    const columns = 4;

    const wPadding = 7;
    const hPadding = 7;

    buttons.forEach((el, i) => {
      el.view.x = -350 + (i % columns) * 232 + wPadding * (i % columns);
      el.view.y = 85 + Math.floor(i / columns) * 140 + hPadding * Math.floor(i / columns);

      content.addChild(el.view);
    });

    return content;
  }
}
