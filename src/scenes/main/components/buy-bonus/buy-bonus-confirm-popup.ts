import { Assets, Container, Sprite, type Texture } from 'pixi.js';
import { generateTexture } from '@/core/util/render';
import { gameConfig } from '@/config/game-config';
import { onResize } from '@/core/services/resize/resize.service';
import { getTextureByBonusKind } from '@/scenes/main/components/buy-bonus/get-buy-bonus-icon-texture';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { gameStyles } from '@/game-styles';
import { activateBonus, Bonus } from '@/data/bonus-store';

export class BuyBonusConfirmPopup extends Container {
  private readonly underlay: Sprite;

  private readonly root: Container;

  private readonly sprite: Sprite;

  private bonus: Bonus;

  private openResolver: () => void;

  constructor() {
    super();
    this.underlay = new Sprite(generateTexture('#000000', 0.8, 1, 1));
    this.underlay.x = gameConfig.width / 2;
    this.underlay.y = gameConfig.height / 2;
    this.underlay.anchor.set(0.5);
    this.underlay.interactive = true;
    this.addChild(this.underlay);

    this.root = new Container();
    this.addChild(this.root);

    const bg = Sprite.from('buy-bonus-confirm');
    bg.anchor.set(0.5);
    this.root.addChild(bg);

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(1.5);
    this.sprite.position.set(0, -35);
    this.root.addChild(this.sprite);

    const button = new SpriteButton({
      textures: getButtonStatesTextures('main-button'),
      text: 'ACTIVATE',
      textStyle: gameStyles.buyBonusButton,
      action: this.onButtonClicked.bind(this),
    });
    button.view.scale.set(1);
    button.view.y = 340;
    this.root.addChild(button.view);

    this.visible = false;

    onResize(this.resize.bind(this));
  }

  public async show(bonus: Bonus) {
    this.bonus = bonus;
    this.sprite.texture = Assets.get<Texture>(getTextureByBonusKind(bonus.kind));
    this.visible = true;

    await new Promise<void>((resolve) => {
      this.openResolver = resolve;
    });

    this.visible = false;
  }

  private onButtonClicked() {
    activateBonus(this.bonus);

    this.openResolver();
  }

  private resize(resizeData: ResizeData): void {
    this.underlay.width = resizeData.canvas.width;
    this.underlay.height = resizeData.canvas.height;

    this.root.x = resizeData.actionArea.width / 2;
    this.root.y = resizeData.actionArea.height / 2 - 100;
  }
}
