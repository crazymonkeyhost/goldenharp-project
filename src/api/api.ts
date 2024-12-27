import { GameModel } from '@/data/game-model';
import {
  ApiError,
  SuperGameResponse,
  ArabianNightResponse,
  FreeSpinResponse,
  PaytableResponse,
  PlayerDataResponse,
  SpinResponse,
} from '@/api/response-types';
import { request } from '@/core/network/request';
import { SpinResultDO } from '@/data/DO/spin-result-do';
import { slotConfig } from '@/config/slot-config';

export class Api {
  private readonly apiUrl = import.meta.env.VITE_API_URL;

  private model: GameModel;

  constructor(model: GameModel) {
    this.model = model;
  }

  public async getSpinData(balance:number): Promise<SpinResultDO> {
    return SpinResultDO.fromResponse(
      await this.apiCall('spin', {
        session_uuid: this.model.sessionId,
        balance: `${balance}`,
        bet: `${this.model.bet}`,
        demo: this.model.isDemoMode ? '1' : '0',
      }),
      slotConfig.paylines,
      this.model.paytable,
    );
  }

  public async getFreeSpinData(): Promise<SpinResultDO> {
    return SpinResultDO.fromResponse(
      await this.apiCall('freespin', {
        session_uuid: this.model.sessionId,
        balance: `${this.model.balance}`,
        bet: `${this.model.currentFreeSpinsSession?.bet_level}`,
        hash: this.model.currentFreeSpinsSession?.freespin_hash || '',
        demo: this.model.isDemoMode ? '1' : '0',
      }),
      slotConfig.paylines,
      this.model.paytable,
    );
  }

  public getSuperGameData(hash: string): Promise<SuperGameResponse> {
    return this.apiCall('supergame/supergame', {
      session_uuid: this.model.sessionId,
      balance: `${this.model.balance}`,
      hash,
      demo: this.model.isDemoMode ? '1' : '0',
    });
  }

  public getArabianNightBonusData(hash: string): Promise<ArabianNightResponse> {
    return this.apiCall('supergame/arabian-night', {
      session_uuid: this.model.sessionId,
      balance: `${this.model.balance}`,
      hash,
      demo: this.model.isDemoMode ? '1' : '0',
    });
  }

  public async getPlayerData(): Promise<PlayerDataResponse> {
    return this.apiCall('player', { session_uuid: this.model.sessionId });
  }

  public getPaytableData(): Promise<PaytableResponse> {
    return this.apiCall('paytables', { session_uuid: this.model.sessionId, bet: `1` });
  }

  private async apiCall<E extends keyof Endpoints>(
    endpoint: E,
    payload: Endpoints[E]['payload'],
  ): Promise<Endpoints[E]['response']> {
    let result: Endpoints[E]['response'] | ApiError | null = null;

    try {
      const response = await request(`${this.apiUrl}/${endpoint}`, {
        query: payload,
        method: 'GET',
      });

      result = await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error}`);
    }

    if (!result) {
      throw new Error('API response is empty');
    }

    if ('status' in result && result.status === 'error') {
      throw result;
    } else {
      return result as Endpoints[E]['response'];
    }
  }
}

type Endpoints = {
  spin: {
    payload: { session_uuid: string; balance: string; bet: string, demo: string };
    response: SpinResponse;
  };
  freespin: {
    payload: { session_uuid: string; balance: string; bet: string; hash: string; demo: string };
    response: FreeSpinResponse;
  };
  'supergame/supergame': {
    payload: { session_uuid: string; balance: string; hash: string; demo: string };
    response: SuperGameResponse;
  };
  'supergame/arabian-night': {
    payload: { session_uuid: string; balance: string; hash: string; demo: string };
    response: ArabianNightResponse;
  };
  paytables: {
    payload: { session_uuid: string; bet: string };
    response: PaytableResponse;
  };
  player: {
    payload: { session_uuid: string };
    response: PlayerDataResponse;
  };
};
