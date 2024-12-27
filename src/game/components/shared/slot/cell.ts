import { Sprite, Assets, BlurFilter, Container, Graphics } from 'pixi.js';

export class Cell extends Container {
  public id: string;

  protected frameSize: WidthHeight;

  protected animationsContainer = new Container();

  protected staticSprite = new Sprite();

  protected blured = false;

  public debug: Graphics;

  constructor(frameSize: WidthHeight) {
    super();

    this.frameSize = frameSize;

    this.addChild(this.animationsContainer);

    this.staticSprite.anchor.set(0.5);
    this.addChild(this.staticSprite);

    this.drawDebug();
    this.debug.visible = false;
  }


  private drawDebug() {
    const graphics = new Graphics();
    graphics.rect(this.frameSize.width / -2, this.frameSize.height / -2, this.frameSize.width, this.frameSize.height);

    graphics.fill({
      color : '#e00202',
      alpha : 0.3,
    });

    graphics.stroke({
      color: '#ff0000',
      width: 2,
      alpha: 1,
    });

    this.debug = graphics;

    this.addChild(graphics);
  }

  setId(id: string) {
    this.id = id;

    this.staticSprite.texture = this.getTextureById();
  }

  blur() {
    if (this.blured) return;

    this.blured = true;

    this.makeBlur();
  }


  unblur() {
    if (!this.blured) return;

    this.blured = false;

    this.makeUnblur();
  }

  protected makeBlur() {
    this.staticSprite.filters = [
      new BlurFilter({
        strength: 10,
      }),
    ];
  }

  protected makeUnblur() {
    this.staticSprite.filters = [];
  }

  getTextureById(id: string = this.id) {
    return Assets.get(id);
  }

  async playWin(..._args: unknown[]) {
    // override
  }

  stopWin() {
    // override
  }
}
