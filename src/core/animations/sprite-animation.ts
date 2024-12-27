import { AnimatedSprite, Texture } from 'pixi.js';

export class SpriteAnimation<N extends string = string> extends AnimatedSprite {
  _animations;

  _currentAnimation: N;

  _animationResolver: () => void = () => {};

  frameRate: number;

  constructor(animations: Record<N, Texture[]>, frameRate = 24) {
    super(animations[Object.keys(animations)[0] as N]);

    this.frameRate = frameRate;

    this._currentAnimation = Object.keys(animations)[0] as N;

    this._animations = animations;

    this.loop = false;

    // this.animationSpeed = 0.6;
  }

  /**
   * animations map object
   * @param animations
   */
  set animations(animations: Record<string, Texture[]>) {
    this._animations = animations;
    this.switchFrames(this._currentAnimation);
  }

  switchFrames(name: N) {
    this._currentAnimation = name;

    const textures = this._animations[name];

    if (!textures) {
      throw new Error(`There is no ${name} animation!`);
    }

    this.textures = textures.map((texture) => {
      return {
        texture,
        time: 1000 / this.frameRate,
      };
    });
  }

  playAnimation(name: N, loop = false) {
    this.loop = loop;
    this.switchFrames(name);

    super.play();

    return new Promise<void>((resolve) => {
      this._animationResolver = resolve;
    });
    /*    .then(()=>{
                if (this.currentFrame !== this._previousFrame){
                    this.updateTexture();
                }
            })*/
  }

  stop() {
    this._onComplete();
    super.stop();
  }

  _onComplete() {
    this._animationResolver && this._animationResolver();
  }
}
