import { Assets, Container, Sprite } from 'pixi.js';
import { Scene } from '@/core/scene/Scene';
import { SpriteButton } from '@/core/ui/sprite-button';
import { onResize } from '@/core/services/resize/resize.service';
import { GoldenHarpGame } from '@/game/golden-harp-game';
import { getButtonStatesTextures } from '@/core/util/textures';
import { gameConfig } from '@/config/game-config';
import { clamp } from '@/core/util/math';
import { ProgressBar } from '@pixi/ui';
import { keyboardService } from '@/core/services/keyboard-service';

/** Loading splash scene */
export class SplashScene extends Scene<'splash', GoldenHarpGame> {
  private content = new Container();

  private progressBar: ProgressBar;

  private continueButton: SpriteButton;

  private unsubscribeResize = () => {};

  private unBindKeyboard: () => void = () => {};

  private background: Sprite;

  constructor() {
    super('splash');
  }

  async preload() {
    await Assets.loadBundle(['splash']);
  }

  async create(): Promise<void> {
    this.background = this.content.addChild(new Sprite(Assets.get('splash-bg')));
    this.background.anchor.set(0.5);
    this.background.x = gameConfig.width / 2;
    this.background.y = gameConfig.height / 2;

    this.continueButton = new SpriteButton({
      textures: getButtonStatesTextures('splash-start'),
      action: this.continue.bind(this),
    });

    this.progressBar = new ProgressBar({
      bg: 'splash-progress-bg',
      fill: 'splash-progress-fill',
      progress: 0,
      fillPaddings: {
        top: 3,
        left: 3,
      },
    });

    this.progressBar.x = gameConfig.width / 2 - this.progressBar.width / 2;
    this.progressBar.y = 1000;
    this.content.addChild(this.progressBar);

    this.continueButton.view.x = this.game.config.width / 2;
    this.continueButton.view.y = 810;
    this.content.addChild(this.continueButton.view);

    this.stage.addChild(this.content);

    this.unsubscribeResize = onResize(this.resize.bind(this));

    this.continueButton.enabled = false;
  }

  async onEnter(): Promise<void> {
    super.onEnter();

    await this.game.prepareScene('main', this.onLoadProgress.bind(this));

    this.onLoadProgress(1);

    this.background.interactive = true;

    this.unBindKeyboard = keyboardService.addSpaceListener(this.continue.bind(this), true);

    this.background.once('pointerdown', this.continue.bind(this));

    this.continueButton.enabled = true;
  }

  onLoadProgress(progress: number) {

    this.progressBar.progress = clamp(progress * 2 * 100, 0, 100);
    console.log('progress', this.progressBar.progress );
  }

  private resize(resizeData: ResizeData) {
    this.content.x = resizeData.actionArea.x;
    this.content.y = resizeData.actionArea.y;
  }

  private async continue() {
    this.background.removeAllListeners();
    this.background.interactive = false;
    this.continueButton.enabled = false;
    this.unBindKeyboard();
    await this.game.fadeTransition.fadeIn();
    this.game.switchScene('main');
    await this.game.fadeTransition.fadeOut();
  }

  async onLeave(): Promise<void> {
    super.onLeave();

    try {
      setTimeout(() => {
        this.destroy();
      }, 1000);

    } catch (e) {
      console.warn(e);
    }
  }

  override destroy() {
    super.destroy();

    this.unsubscribeResize();

    Assets.unloadBundle('splash');

    this.stage.destroy({
      children: true,
    });
  }
}
