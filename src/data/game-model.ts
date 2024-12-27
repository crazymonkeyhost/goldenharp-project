import { getSearchParam } from '@/core/util/get-search-param';
import { safeNumberParse } from '@/core/util/math';
import { SpinResultDO } from '@/data/DO/spin-result-do';
import { Paytable } from '@/config/slot-config';
import { SuperGameResponse, ArabianNightResponse, PlayerDataResponse, FreeSpinTrigger } from '@/api/response-types';
import { transformReelsData } from '@/api/utils/slot-logic-utils';

export class GameModel {
  public readonly initData: InitSessionData;


  constructor() {
    this.initData = this.getInitSessionData();

    this._balance = this.initData.balance || 100;
  }

  public init(playerData: PlayerDataResponse) {
    this._playerData = playerData;

    if (this._playerData.freespin) {
      this.freeSpinsBank.push(...this._playerData.freespin);
    }
  }

  public paytable: Paytable;

  private _playerData: PlayerDataResponse | null = null;

  get playerData() {
    return this._playerData;
  }

  public betResponse: SpinResultDO | null = null;

  get currentResponse(): SpinResultDO {
    return this.betResponse!;
  }

  get hasArabianNightBonus(): boolean {
    return this.currentResponse?.arabian_night.arabian_night === 1;
  }

  get hasSuperGame(): boolean {
    return this.currentResponse?.supergame.supergame === 1;
  }

  get hasJackpotWon(){
    return this.currentResponse?.jackpot > 0;
  }

  get jackpotAmount(){
    return this.currentResponse?.jackpot || 0;
  }

  public superGameResponse: SuperGameResponse | null = null;

  public arabianNightResponse: ArabianNightResponse | null = null;

  public betRange = [0.05, 0.25, 0.5, 1, 2, 2.5, 5, 7.5, 10, 25, 50, 100];

  protected _bet: number = 1;

  get maxBet(): number {
    return this.betRange[this.betRange.length - 1];
  }

  get bet(): number {
    return this._bet;
  }

  set bet(value: number) {
    this._bet = value;
  }

  /** current win on the round */
  protected _win: number = 0;

  // current win that displayed on the screen
  get win(): number {
    return this._win;
  }

  set win(value: number) {
    this._win = value;
  }

  protected _balance: number = 0;

  // current balance that displayed on the screen
  get balance(): number {
    return this._balance;
  }

  set balance(value: number) {
    this._balance = value;
  }

  private _lastServerBalance: number = 0;

  set lastServerBalance(value: number) {
    this._lastServerBalance = value;
  }

  get lastServerBalance(): number {
    return this._lastServerBalance;
  }

  /** current free spins count in current free spins session */
  protected _freeSpins: number = 0;

  get freeSpins(): number {
    return this._freeSpins;
  }

  set freeSpins(value: number) {
    this._freeSpins = value;
  }

  public readonly freeSpinsBank: {
    bet_level: number;
    freespin_left: number;
    freespin_total: number;
    freespin_hash: string | null;
    freespin_trigger: FreeSpinTrigger;
  }[] = [];


  public currentFreeSpinsSession: {
    bet_level: number;
    freespin_left: number;
    freespin_total: number;
    freespin_hash: string | null;
    freespin_trigger: FreeSpinTrigger;
  } | null = null;

  public nextFreeSpinSession() {
    if (this.freeSpinsBank.length === 0) {
      this.clearFreeSpinsSession();
    } else {
      this.currentFreeSpinsSession = this.freeSpinsBank.shift()!;
    }

    return this.currentFreeSpinsSession;
  }

  public clearFreeSpinsSession(){
    this.currentFreeSpinsSession = null;

    this._freeSpins = 0;
  }


  get sessionId() {
    return this.initData.session;
  }

  get isDemoMode(){
    return this.initData.demo === 1;
  }

  get initialCells() {
    const lastSpin = this.playerData?.last_spin;

    return lastSpin && lastSpin.length ? transformReelsData(lastSpin) : null;
  }

  private getInitSessionData(): InitSessionData {
    return {
      session: getSearchParam('session') || 'session',
      demo: safeNumberParse(getSearchParam('demo'), 0),
      balance: safeNumberParse(getSearchParam('balance'), 0),
      currency: getSearchParam('currency') || 'USD',
      depositLink: getSearchParam('depositLink') || null,
      homeLink: getSearchParam('homeLink') || null,
    };
  }
}

type InitSessionData = {
  session: string;
  demo: number;
  balance: number;
  homeLink: string | null;
  depositLink: string | null;
  currency: string;
};
