import { gsap } from "gsap";

interface CounterConfig {
  duration: number; // in ms
  callback: (value: number) => void;
}

export class Counter {
  private _value = 0;

  private _isPlaying = false;

  private currentResolve!: () => void;

  public currentTween!: gsap.core.Tween;

  private currentPromise: Promise<void> | null = null;

  private config: CounterConfig;

  constructor(config: CounterConfig) {
    this.config = config;
  }

  public reset() {
    this._value = 0;
  }

  public async setValue(value: number) {
    if (this._isPlaying) {
      this.stop();

      await this.currentPromise;
    }

    this._value = value;

    this.onValueChange();
  }

  public getValue() {
    return this._value;
  }

  get isPlaying() {
    return this._isPlaying;
  }

  async playTo(value: number, duration?: number) {
    duration = duration || this.config.duration;

    if (this._isPlaying) {
      this.stop();
      await this.currentPromise;
    }

    this._isPlaying = true;

    this.currentPromise = new Promise<void>((resolve) => {
      this.currentResolve = resolve;

      this.currentTween = gsap.to(this, {
        _value: value,
        duration: duration / 1000,
        onComplete: resolve,
        onUpdate: this.onValueChange.bind(this)
      });
    });

    await this.currentPromise;

    this._isPlaying = false;

    this.setValue(value);
  }

  async playFromTo(from: number, to: number, duration?: number) {
    this._value = from;

    await this.playTo(to, duration);
  }

  public stop() {
    if (this.currentPromise) {
      this.currentResolve();
      this.currentTween.kill();
    }
  }

  private onValueChange() {
    this.config.callback(this._value);
  }
}