import { Scene } from '@/core/scene/Scene';
import { GoldenHarpGame } from '@/game/golden-harp-game';
import { wait } from '@/core/util/time';
import { SuperGameResponse } from '@/api/response-types';
import { toActionArea } from '@/core/services/resize/resize.service';
import { Assets, Container } from 'pixi.js';
import { Wheel } from '@/scenes/super-game/components/wheel';
import { gameConfig } from '@/config/game-config';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { keyboardService } from '@/core/services/keyboard-service';

export class SuperGameScene extends Scene<'supergame', GoldenHarpGame> {
  private response: SuperGameResponse | null = null;

  private wheel: Wheel;

  private heroContainer = new Container();

  private spinButton: SpriteButton;

  private assetsLoadingPromise = Promise.resolve()

  private unBindKeyboard: () => void = () => {};

  constructor() {
    super('supergame');
  }

  async create(): Promise<void> {
    // save spot for future use
    this.stage.addChild(this.heroContainer);

    this.wheel = new Wheel();
    this.stage.addChild(this.wheel);

    this.spinButton = new SpriteButton({
      textures: getButtonStatesTextures('wheel-spin'),
      action: () => this.startRound(),
    });

    this.wheel.buttonSpot.addChild(this.spinButton.view);

    toActionArea(this.wheel, { x: gameConfig.width / 2, y: gameConfig.height / 2 - 80 });
  }

  async onEnter(response: SuperGameResponse): Promise<void> {
    super.onEnter();

    this.response = response;

    if (this.heroContainer.children.length === 0) {
      this.heroContainer.addChild(this.game.hero);
    }

    this.game.hero.switchToCronus();

    this.game.background.switchToSuperGame();

    this.spinButton.enabled = true;
    this.spinButton.view.interactive = false;

    this.wheel.reset();
  }

  async onStart(_customData?: unknown): Promise<void> {
    await super.onStart(_customData);

    // start preload free spin type in advance
    this.assetsLoadingPromise = Assets.loadBundle([`${this.response?.freespin_trigger}-supergame`]);

    this.spinButton.view.interactive = true;

    this.unBindKeyboard = keyboardService.addSpaceListener(this.startRound.bind(this), true);
  }

  private async startRound() {
    this.spinButton.enabled = false;
    this.unBindKeyboard();

    const response = this.response;

    if (!response)  throw new Error('SuperGameScene: response is not defined');

    this.game.hero.playCronusAction();

    await this.wheel.spin(response.winType);

    await wait(900).done;

    await this.game.winPopup.playSuperGameEnter(`${response.freespin_trigger}_game`, false);

    await this.game.fadeTransition.fadeIn();

    this.game.winPopup.hide();

    await this.assetsLoadingPromise;

    const transitionComplete = this.game.fadeTransition.fadeOut();

    this.game
      .switchScene('main', {
        transitionComplete,
      })
      .then(() => {
        this.heroContainer.removeChildren();
      });
  }
}
