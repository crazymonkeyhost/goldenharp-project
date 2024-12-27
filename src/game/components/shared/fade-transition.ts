import { generateTexture } from '@/core/util/render.js';
import { Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { onResize } from '@/core/services/resize/resize.service.js';

/**
 * Black fade transition between screens
 */
export class FadeTransition extends Sprite {
  static _instance;

  _duration = 0.5;

  constructor() {
    super(generateTexture(0x000000, 1, 1, 1));

    this.visible = false;

    onResize(({canvas})=>{
      this.width = canvas.width;
      this.height = canvas.height;
    });
  }

  /**
   * fade in
   * @return {Promise<unknown>}
   */
  fadeIn() {
    this.visible = true;
    return new Promise(resolve => {
      gsap.fromTo(this, { alpha: 0 }, { alpha: 1, duration: this._duration, onComplete: resolve });
    });
  }

  /**
   * fade out
   * @return {Promise<unknown>}
   */
  fadeOut() {
    return new Promise<void>(resolve => {
      gsap.fromTo(
        this,
        { alpha: 1 },
        {
          alpha: 0,
          duration: this._duration,
          onComplete: () => {
            this.visible = false;

            resolve();
          },
        },
      );
    });
  }

}
