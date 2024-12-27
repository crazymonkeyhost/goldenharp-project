import { Assets, Container, Sprite } from 'pixi.js';
import { onResize } from '@/core/services/resize/resize.service';
import { gsap } from 'gsap';
import { clamp } from '@/core/util/math';

export class RotationAnimation extends Container {
  private bg: Sprite;

  private tween: gsap.core.Timeline;

  private lastOrientation: Orientation | null = null;

  constructor() {
    super();
    this.bg = this.addChild(new Sprite(Assets.get('rotate-bg')));
    this.bg.anchor.set(0.5);
    this.addChild(this.bg);

    const device = new Container();
    device.position.set(0, -15);
    const deviceBg = device.addChild(new Sprite(Assets.get('device')));
    deviceBg.anchor.set(0.5);
    this.addChild(device);

    const hero = this.addChild(Sprite.from('hero-rotation'));
    hero.position.set(60, 140);
    hero.anchor.set(0.5);

    const arrowTop = Sprite.from('arrow-rotation');
    arrowTop.anchor.set(0.5);
    arrowTop.angle = 0;
    arrowTop.x = -200 / 2 - 15;
    arrowTop.y = -380 / 2;
    device.addChild(arrowTop);

    const arrowBottom = Sprite.from('arrow-rotation');
    arrowBottom.anchor.set(0.5);
    arrowBottom.angle = 180;
    arrowBottom.x = 200 / 2 + 15;
    arrowBottom.y = 380 / 2;
    device.addChild(arrowBottom);

    this.tween = gsap
      .timeline({ paused: true })
      .fromTo(
        device,
        { angle: 0 },
        {
          angle: 90,
          duration: 1.5,
          ease: 'none',
        },
      )
      .fromTo(
        [arrowTop, arrowBottom],
        { alpha: 1 },
        {
          alpha: 0,
          duration: 0.5,
          ease: 'none',
        },
        0.4,
      );

    // dont allow click through this component
    this.interactive = true;

    onResize(this.resize.bind(this));
  }

  private resize(resizeData: ResizeData) {
    const orientation = resizeData.orientation;
    const orientationChanged = this.lastOrientation !== orientation;
    const isPortrait = orientation === 'portrait';

    if (!orientationChanged) return;

    if (isPortrait) {
      const w = Assets.get('rotate-bg').width;
      const h = Assets.get('rotate-bg').height;

      const bgScale = clamp(Math.max(resizeData.canvas.width / w, resizeData.canvas.height / h), 1, 2.4);

      console.log('bgScale', bgScale);

      this.scale.set(bgScale * 1.15, bgScale);
      this.x = resizeData.canvas.width / 2;
      this.y = resizeData.canvas.height / 2;

      this.tween.restart(true);
    } else {
      this.tween.pause(0);
    }

    this.visible = isPortrait;
  }
}
