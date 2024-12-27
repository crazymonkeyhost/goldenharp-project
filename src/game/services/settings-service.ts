import { Signal } from '@/core/util/signal';
import { lerp } from '@/core/util/math';

type SettingPayload = {
  musicVolume?: number;
  soundVolume?: number;
  speed?: number;
  winAnimation?: boolean;
  elementAnimation?: boolean;
  target: unknown;
}

export class SettingsService {
  private _spinDuration = [1000, 2000] as const;

  private _reelStartDelay = [100, 100] as const;

  private _reelStopDelay = [100, 100] as const;

  private _reelStopDuration = [300, 10000] as const;

  private _winAnimation = true;

  private _elementAnimation = true;

  private _musicVolume = 30;

  private _soundVolume = 50;

  private _speed = 0;

  public readonly onChanges = new Signal<SettingPayload>();

  getWinAnimation() {
    return this._winAnimation;
  }

  setWinAnimation(value: boolean, target?: unknown) {
    this._winAnimation = value;
    this.onChanges.dispatch({ winAnimation: value, target });
  }

  getElementAnimation() {
    return this._elementAnimation;
  }

  setElementAnimation(value: boolean, target?: unknown) {
    this._elementAnimation = value;
    this.onChanges.dispatch({ elementAnimation: value, target });
  }

  getMusicVolume() {
    return this._musicVolume;
  }

  setMusicVolume(value: number, target?: unknown) {
    this._musicVolume = value;
    this.onChanges.dispatch({ musicVolume: value, target });
  }

  getSoundVolume() {
    return this._soundVolume;
  }

  setSoundVolume(value: number, target: unknown) {
    this._soundVolume = value;
    this.onChanges.dispatch({ soundVolume: value, target });
  }

  getSpeed() {
    return this._speed;
  }

  setSpeed(value: number, target: unknown) {
    this._speed = value;
    this.onChanges.dispatch({ speed: value, target });
  }

  get spinDuration() {
    return lerp(this._spinDuration[0], this._spinDuration[1], 1 - this._speed / 100);
  }

  get reelStartDelay() {
    return lerp(this._reelStartDelay[0], this._reelStartDelay[1], 1 - this._speed / 100);
  }

  get reelStopDelay() {
    return lerp(this._reelStopDelay[0], this._reelStopDelay[1], 1 - this._speed / 100);
  }

  get reelStopDuration() {
    return lerp(this._reelStopDuration[0], this._reelStopDuration[1], 1 - this._speed / 100);
  }
}

export const settingsService = new SettingsService();