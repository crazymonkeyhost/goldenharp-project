import { UserData } from '@/api/local-api/local-server-api';
import { clamp, rand, safeNumberParse } from '@/core/util/math';
import { wait } from '@/core/util/time';
import { simulation } from '@/api/local-api/simulation';

export class UserService {

  public data: UserData = {
    balance: 0,

    keys: {
      keys_amount: 14,
      keys_total: 15,
    },

    jars: {
      jars_amount: 0,
      jars_total: 5,
    },

    freeSpins: {
      left: 0,
      win: 0,
      bet: 0.5,
    },
  };

  constructor() {
    this.prepareInitUserData();
  }

  public startFreeSpinSession(freeSpins: number, totalBet: number) {
    this.data.freeSpins.left = freeSpins;
    this.data.freeSpins.bet = totalBet;
    this.data.freeSpins.win = 0;
  }

  public reTriggerFreeSpins(freeSpins: number) {
    this.data.freeSpins.left += freeSpins;
  }

  public endFreeSpinSession() {
    this.data.freeSpins.left = 0;
    this.data.freeSpins.bet = 0;
    this.data.freeSpins.win = 0;
  }

  public isActiveFreeSpinSession() {
    return this.data.freeSpins.left > 0;
  }

  async getUserData() {
    await wait(rand(100, 2000)); // artificial delay

    return this.data;
  }

  private prepareInitUserData() {
    this.data.balance = safeNumberParse(simulation.balance) || 100;

    if (simulation.cronus) {
      this.data.jars.jars_amount = 4;
    }
  }

  public get balance() {
    return this.data.balance;
  }

  public set balance(value: number) {
    this.data.balance = value;
  }

  public get freeSpinsLeft() {
    return this.data.freeSpins.left;
  }

  public set freeSpinsLeft(value: number) {
    this.data.freeSpins.left = value;
  }

  public get accumulatedKeys() {
    return this.data.keys.keys_amount;
  }

  public set accumulatedKeys(value: number) {
    this.data.keys.keys_amount = clamp(value, 0, 15);
  }

  public get accumulatedJars() {
    return this.data.jars.jars_amount;
  }

  public set accumulatedJars(value: number) {
    this.data.jars.jars_amount = value;
  }
}

export const userService = new UserService();
