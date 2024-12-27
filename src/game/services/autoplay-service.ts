import { Signal } from '@/core/util/signal';

export class AutoplayService {
  private _numberOfGames = 5;

  private _initialNumberOfGames = 5;

  private _winLimit = 250;

  private _lossLimit = 120;

  private _isActive = false;

  public readonly onStateSwitch = new Signal<{ active: boolean }>();

  public onNumberOfGamesChange = new Signal<{initial:number, current:number}>();

  public isActive() {
    return this._isActive;
  }

  private dispatchNumberOfGamesChange() {
    this.onNumberOfGamesChange.dispatch({ initial: this._initialNumberOfGames, current: this._numberOfGames });
  }

  public start(data: StartAutoplayData) {
    this._numberOfGames = data.numberOfGames;

    this._initialNumberOfGames = data.numberOfGames;

    this.dispatchNumberOfGamesChange();

    this._winLimit = data.winLimit;

    this._lossLimit = data.lossLimit;

    this._isActive = true;

    if (this.next()) {
      this.onStateSwitch.dispatch({ active: this._isActive });
    }
  }

  public stop() {
    this._isActive = false;

    this.onStateSwitch.dispatch({ active: this._isActive });
  }

  public next(data?: { totalBet: number; totalWin: number } | null): boolean {
    // if autoplay is not active, return false
    if (!this._isActive) return this._isActive;

    // handle loss limit
    if (data) {
      this._lossLimit += -1 * data.totalBet + data.totalWin;
    }

    // console.log(`Autoplay: next`, data, `loss limit: ${this._lossLimit}`);

    // otherwise, check if the number of games is greater than 0
    if (this._numberOfGames === 0 || (data?.totalWin || 0) > this._winLimit || this._lossLimit <= 0) {
      if (this._numberOfGames === 0) {
        console.log(`Autoplay stopped: number of games limit reached`);
      }

      if ((data?.totalWin || 0) > this._winLimit) {
        console.log(`Autoplay stopped: win limit reached`);
      }

      if (this._lossLimit <= 0) {
        console.log(`Autoplay stopped: loss limit reached`);
      }

      this.stop();
    } else {
      this._numberOfGames--;
      this.dispatchNumberOfGamesChange();
    }

    console.log(`Autoplay: ${this._numberOfGames} games left`);

    return this._isActive;
  }

  get numberOfGames() {
    return this._numberOfGames;
  }

  get winLimit() {
    return this._winLimit;
  }

  get lossLimit() {
    return this._lossLimit;
  }

  static numberOfGamesRange = Array.from({ length: 100 }, (_, i) => i + 1);

  static winLimitRange = Array.from({ length: 50 }, (_, i) => (i + 1) * 10);

  static lossLimitRange = Array.from({ length: 50 }, (_, i) => (i + 1) * 10);
}

export type StartAutoplayData = {
  numberOfGames: number;
  winLimit: number;
  lossLimit: number;
};


export const autoplayService = new AutoplayService();