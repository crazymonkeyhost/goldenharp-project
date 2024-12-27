import { BitmapText, Container, Sprite } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { onResize, toCanvasCenter } from '@/core/services/resize/resize.service';
import { generateTexture } from '@/core/util/render';
import { gsap } from 'gsap';
import { Counter } from '@/core/components/counter';
import { currencyFormatter } from '@/core/services/currency-formatter';
import { getSpineDuration } from '@/core/util/spine';

const formatNumber = (value: number) => `${value}`;

const formatCurrency = (value: number) => currencyFormatter.format(value);

export class WinPopup extends Container {
  private animation: Spine | null = null;

  private currentSpineType: TPopupSpineType | null = null;

  private readonly animationContainer = new Container();

  private readonly overlay: Sprite;

  private readonly valueFieldContainer = new Container();

  private readonly valueField: BitmapText;

  private counter = new Counter({
    duration: 3000,
    callback: (value) => {
      this.valueField.text = this.formatter(value);
    },
  });

  private formatter: (value: number) => string = formatNumber;

  private content = new Container();

  /**
   *
   * big_win
   * coins
   * jackpot
   * jackpot
   * mega_win
   * ultra_win
   * u_win
   * win
   */

  constructor() {
    super();

    this.isRenderGroup = false;

    this.overlay = new Sprite(generateTexture('#190401', 0.7, 1, 1));
    this.overlay.interactive = true;
    this.addChild(this.overlay);

    this.addChild(this.content);

    this.content.addChild(this.animationContainer);

    this.valueField = new BitmapText({
      text: '',
      style: {
        fontFamily: 'popups-bm-golden',
        fontSize: 90,
      },
    });
    // this.valueField.position.set(0, 190);
    this.valueField.anchor.set(0.5);
    this.valueField.visible = false;
    this.valueFieldContainer.addChild(this.valueField);

    toCanvasCenter(this.content);

    onResize((rd) => {
      this.overlay.width = rd.canvas.width;
      this.overlay.height = rd.canvas.height;
    });

    // @ts-ignore
    window.winPopup = this;

    this.hide();
  }

  public show() {
    this.visible = true;
  }

  public hide() {
    this.visible = false;

    // this.animation?.skeleton.setBonesToSetupPose();
    this.animation?.skeleton.setToSetupPose();
    this.animation?.state.clearTracks();
  }

  public async playFreespinEnter() {
    // todo
  }

  public async playSuperGameEnter(
    animation: 'cronus_game' | 'hades_game' | 'poseidon_game' | 'zeus_game',
    autoHide = true,
  ) {
    this.createAnimation('super_game');

    await this.playAnimation(animation, autoHide);
  }

  public async playSuperGameWin(animation: 'hades_win' | 'poseidon_win' | 'zeus_win' | 'u_win', amount: number, autoHide = false) {
    this.createAnimation('super_game');

    this.valueField.visible = true;
    this.valueField.style.fontSize = 50;

    this.formatter = formatCurrency;

    this.counter.playFromTo(0, amount, this.getAnimationDuration(animation) * 700);

    await this.playAnimation(animation, autoHide);

    this.valueField.visible = false;
  }

  public async playSummaryWin(
    type: 'jackpot' | 'big_win' | 'mega_win' | 'ultra_win' | 'u_win' | 'win',
    amount: number,
  ) {
    this.createAnimation('summary_win');

    // this.valueField.style.fontFamily = type === 'u_win' ? 'popups-bm-golden' : 'popups-bm-brown';
    // this.valueField.style.fontFamily = 'popups-bm-golden';
    this.valueField.style.fontSize = 60;

    this.formatter = formatCurrency;

    this.valueField.visible = true;

    const slotMap: Record<string, string> = {
      jackpot: 'result4',
      big_win: 'result2',
      mega_win: 'result3',
      ultra_win: 'result5',
      u_win: 'result5',
      win: 'result6',
    }

    this.animation?.addSlotObject(slotMap[type], this.valueFieldContainer);

    this.counter.playFromTo(0, amount, this.getAnimationDuration(type) * 700);

    // win animation should not contain coins
    if (type !== 'win') {
      this.animation?.state.setAnimation(2, 'coins', false);
    }

    // run main animation
    await this.playAnimation(type);

    this.valueField.visible = false;
  }

  public async playFreeSpinWin(amount: number) {
    await this.playSummaryWin('u_win', amount);
  }

  private async playAnimation(name: string, autoHide = true) {
    this.show();
    this.animation?.state.setAnimation(0, name, false);

    await gsap
      .timeline()
      .to({}, { duration: this.getAnimationDuration(name) }, 0)
      .then();

    if (autoHide) {
      this.hide();
    }
  }

  private getAnimationDuration(name: string) {
    return getSpineDuration(this.animation!, name);
  }

  /** generic method to create animation for different hero */
  private createAnimation(spineType: TPopupSpineType) {
    if (this.currentSpineType === spineType) return;

    this.destroyAnimation();

    this.currentSpineType = spineType;

    this.animation = Spine.from({
      skeleton: `${spineType}.json`,
      atlas: `${spineType}.atlas`,
    });

    this.animation?.addSlotObject('result', this.valueFieldContainer);

    this.animationContainer.addChild(this.animation);
  }

  private destroyAnimation() {
    this.currentSpineType = null;

    this.animation?.destroy({
      texture: true,
      children: false,
      textureSource: true,
    });
  }
}

type TPopupSpineType = 'summary_win' | 'super_game';
