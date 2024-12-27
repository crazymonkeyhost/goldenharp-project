import { Container, Sprite, Text } from 'pixi.js';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { QuantitySelector } from '@/core/ui/quantity-selector';
import { gameStyles } from '@/game-styles';
import { autoplayService, AutoplayService, type StartAutoplayData } from '@/game/services/autoplay-service';
import { TapPageItem } from './bookmark-tab-pages';
import { currencyFormatter } from '@/core/services/currency-formatter';

/** Autoplay settings page */
export class AutoplaySettingsPage implements TapPageItem {
  public readonly title: Text;

  public readonly content: Container;

  constructor(onStartClicked: (data: StartAutoplayData) => void) {
    this.title = this.createTitle();

    this.content = this.createContent(onStartClicked);
  }

  protected createTitle() {
    const title = new Text({text : 'AUTOPLAY SETTINGS', style: gameStyles.settingsTitle2});

    title.x = 40;
    title.y = 80;

    return title;
  }

  protected createContent(onStartClicked: (data: StartAutoplayData) => void) {
    const numberOfGamesRange = AutoplayService.numberOfGamesRange;
    const winLimitRange = AutoplayService.winLimitRange;
    const lossLimitRange = AutoplayService.lossLimitRange;
    const defaultLossLimit = autoplayService.lossLimit;
    const defaultNumberOfGames = autoplayService.numberOfGames;
    const defaultWinLimit = autoplayService.winLimit;

    let numberOfGames = defaultNumberOfGames;
    let winLimit = defaultWinLimit;
    let lossLimit = defaultLossLimit;

    const content = new Container();

    // sliders
    const slidersY = 100;
    const slidersYPadding = 150;

    // number of games
    const numberOfGamesSelector = this.createAutoplaySection(
      'ap-icons-helmet',
      'NUMBER OF GAMES:',
      numberOfGamesRange,
      Math.max(0, numberOfGamesRange.indexOf(defaultNumberOfGames)),
      (index) => (numberOfGames = numberOfGamesRange[index]),
    );
    numberOfGamesSelector.x = 0;
    numberOfGamesSelector.y = slidersY + slidersYPadding * 0;
    content.addChild(numberOfGamesSelector);

    // win limit
    const winLimitSelector = this.createAutoplaySection(
      'ap-icons-up',
      'WIN LIMIT:',
      winLimitRange,
      Math.max(0, winLimitRange.indexOf(defaultWinLimit)),
      (index) => (winLimit = winLimitRange[index]),
      (v)=>currencyFormatter.format(v)
    );
    winLimitSelector.x = 0;
    winLimitSelector.y = slidersY + slidersYPadding * 1;
    content.addChild(winLimitSelector);

    //
    // loss limit
    const lossLimitSelector = this.createAutoplaySection(
      'ap-icons-down',
      'LOSS LIMIT:',
      lossLimitRange,
      Math.max(0, lossLimitRange.indexOf(defaultLossLimit)),
      (index) => (lossLimit = lossLimitRange[index]),
      (v)=>currencyFormatter.format(v)
    );
    lossLimitSelector.x = 0;
    lossLimitSelector.y = slidersY + slidersYPadding * 2;
    content.addChild(lossLimitSelector);

    // start button
    const startButton = new SpriteButton({
      textures: getButtonStatesTextures('main-button'),
      textStyle: gameStyles.apStartButton,
      text: 'START',
      action: () => {
        onStartClicked({ numberOfGames, winLimit, lossLimit });
      },
    });
    startButton.view.x = 0;
    startButton.view.y = 590;

    content.addChild(startButton.view);

    return content;
  }

  private createAutoplaySection(
    iconTextureName:string,
    text: string,
    values: number[],
    defaultIndex: number,
    cb: (n: number) => void,
    formatter: (v: number) => string = (v) => `${v}`,
  ): Container {
    const root = new Container();

    const title = new Container();
    title.position.set(-430, 0);
    root.addChild(title);

    const tittleIcon = Sprite.from(iconTextureName);
    tittleIcon.anchor.set(0.5);
    title.addChild(tittleIcon);

    const titleField = new Text({
      text,
      style: gameStyles.settingSlider,
      anchor: { x: 0, y: 0.5 },
      position: { x: 70, y: 0 },
    });
    title.addChild(titleField);

    const quantitySelector = new QuantitySelector(values, defaultIndex, {
      plusButton: getButtonStatesTextures('plus-button'),
      minusButton: getButtonStatesTextures('minus-button'),
      styles: {
        valueField: gameStyles.apSelectorValue,
      },
      valuePosition : {
        x: -230,
        y: 0,
      },
      width: 0,
      formatter
    });
    quantitySelector.onChange.add(cb);
    quantitySelector.x = 350;
    root.addChild(quantitySelector);

    return root;
  }
};
