import { Container, Graphics, Sprite } from 'pixi.js';
import { gsap } from 'gsap';

export class TextEffect extends Container {
  private labelMask: Graphics;

  private bgSprite: Sprite;

  constructor(label: string, bg: string) {
    super();

    // @ts-ignore
    window.testTextEffect = this;

    let bgSprite: Sprite | null = null;
    if (bg) {
      bgSprite = Sprite.from(bg);
      bgSprite.anchor.set(0.5, 0.5);
      this.addChild(bgSprite);
      this.bgSprite = bgSprite;
    }


    const labelSprite = Sprite.from(label);
    labelSprite.anchor.set(0.5);
    this.addChild(labelSprite);


    const maskWidth = Math.max(labelSprite.width, bgSprite?.width || 0);
    const maskHeight = Math.max(labelSprite.height, bgSprite?.height || 0);

    this.labelMask = this.createMask(maskWidth, maskHeight);
    this.addChild(this.labelMask);
    labelSprite.mask = this.labelMask;
  }

  private createMask(width: number, height: number): Graphics {
    const mask = new Graphics()
      .roundRect(0, 0, width, height, 20)
      .fill('#ffffff');

    mask.position.set(-width / 2, -height / 2);

    return mask;
  }


  async appear(delay = 0) {
    this.alpha = 1;

    await gsap.timeline({ delay })
      .fromTo(this.bgSprite, { alpha: 0 }, { alpha: 1, duration: 1, ease: 'power2.in' })
      .fromTo(this.labelMask.scale, { x: 0 }, { x: 1, duration: 1, ease: 'power2.in' }, 0)
      .then();
    // .to(this, { alpha: 1, duration: 0.25, ease: 'power2.out' })
  }

  async flash(delay = 0.8, repeat = 5) {
    await gsap.to(this, { alpha: 0, duration: 0.15, ease: 'power2.in', yoyo: true, repeat, delay }).then();
  }

  async hide(delay = 0) {
    await gsap.to(this, { alpha: 0, duration: 0.4, ease: 'power2.out', delay }).then();
  }

}