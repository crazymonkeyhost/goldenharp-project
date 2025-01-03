import { Container, Sprite, Text } from 'pixi.js';
import { onResize } from '@/core/services/resize/resize.service';
import { gameStyles } from '@/game-styles';
import { generateTexture } from '@/core/util/render';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';

type SettleType = 'dismiss' | 'action'

export class Popup extends Container {
  private sessionExpiredText = `YOUR SESSION HAS EXPIRED\nPlease reload the page`;

  private textContent = new Container();

  private insufficientFundsContent: Container | null = null

  private regularContent: Container | null = null;

  private closeButton: SpriteButton;

  private readonly underlay: Sprite;

  private root = new Container();

  private openResolver: (settleType:SettleType) => void;

  private mainButton: SpriteButton;

  private mainText: Text;

  constructor() {
    super();

    this.underlay = new Sprite(generateTexture('#000000', 0.8, 1, 1));
    this.addChild(this.underlay);
    this.underlay.on('pointerdown', () => this.hide('dismiss'));

    this.addChild(this.root);

    const bg = Sprite.from('dialog-bg');
    bg.interactive = true;
    bg.scale.set(1);
    bg.anchor.set(0.5)
    this.root.addChild(bg);

    // close button
    this.closeButton = new SpriteButton({
      textures: getButtonStatesTextures('button-close'),
      action: () => this.hide('dismiss'),
    });
    this.closeButton.view.x = 470;
    this.closeButton.view.y = -295;
    this.root.addChild(this.closeButton.view);

    this.root.addChild(this.textContent);

    this.mainButton = new SpriteButton({
      textures: getButtonStatesTextures('main-button'),
      textStyle:gameStyles.popupMainButton,
      text:'DEPOSIT',
      action: () => this.hide('action'),
    });

    this.mainButton.buttonBg.scale.set(1.2);
    this.mainButton.view.x = 0;
    this.mainButton.view.y = 170;
    this.mainButton.view.visible = false;
    this.root.addChild(this.mainButton.view);

    this.visible = false;

    onResize(this.onResize.bind(this));
  }

  public show(type: 'insuficientFunds' | 'sessionExpired' | (string & NonNullable<unknown>), hasMainButton: boolean = false, canDismiss = false) {
    this.textContent.removeChildren();

    if (type === 'insuficientFunds') {
      this.createInsuficientFundsContent();
      this.textContent.addChild(this.insufficientFundsContent!);
      hasMainButton = true;
      canDismiss = true
    } else  {
      this.createRegularContent();
      this.textContent.addChild(this.regularContent!);

      this.mainText.text = type === 'sessionExpired' ? this.sessionExpiredText : type;

      hasMainButton = type === 'sessionExpired';
    }

    this.mainButton.view.visible = hasMainButton;

    this.mainButton.textView.text = type === 'insuficientFunds' ? 'DEPOSIT' : 'RELOAD';


    return new Promise<SettleType>((resolve) => {
      this.underlay.interactive = canDismiss;
      this.closeButton.enabled = canDismiss;
      this.closeButton.view.visible = canDismiss;

      this.openResolver = resolve;
      this.visible = true;
    });
  }


  public hide(settleType:SettleType): void {
    this.underlay.interactive = false;
    this.closeButton.enabled = false;

    this.openResolver?.(settleType);
    this.visible = false;
  }

  private onResize(rd: ResizeData, rdLib: ResizeCallbackLib) {
    this.root.position.copyFrom(rdLib.getCanvasCenter());

    this.underlay.width = rd.canvas.width;
    this.underlay.height = rd.canvas.height;
  }

  private createInsuficientFundsContent() {
    if (this.insufficientFundsContent) return;

    this.insufficientFundsContent = new Container();
    // this.insufficientFundsContent.y = 85;

    const sack = Sprite.from('sack');
    sack.anchor.set(0.5, 0.5);
    sack.y = -185;
    this.insufficientFundsContent.addChild(sack);

    const text = new Text({
      text: 'NOT ENOUGH FUNDS',
      style: gameStyles.popupText,
    });
    text.anchor.set(0.5, 0.5);
    this.insufficientFundsContent.addChild(text);
  }

  private createRegularContent() {
    if (this.regularContent) return;

    this.regularContent = new Container();

    const icon = Sprite.from('sandclock');
    icon.anchor.set(0.5, 0.5);
    icon.y = -195;
    this.regularContent.addChild(icon);

    this.mainText = new Text({
      text: '',
      style: gameStyles.popupText,
    });
    this.mainText.anchor.set(0.5, 0.5);
    this.mainText.position.set(0, 10);
    this.regularContent.addChild(this.mainText);
  }
}
