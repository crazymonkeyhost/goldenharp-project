import { PaytableResponse } from '@/api/response-types';
import { Paytable } from '@/config/slot-config';
import { safeNumberParse } from '@/core/util/math';

export class PaytableDO {
  constructor(public readonly response: PaytableResponse) {}


  public toPaytable(): Paytable {
    return new Paytable(
      Object.entries(this.response.paytables).map(([symbol, payouts]) => {
        return {
          symbol,
          paytable: [
            0,
            0,
            safeNumberParse(payouts['3'] || payouts[3], 0),
            safeNumberParse(payouts['4'] || payouts[4], 0),
            safeNumberParse(payouts['5'] || payouts[5], 0),
            safeNumberParse(payouts['6'] || payouts[6], 0),
          ],
        };
      }),
    );
  }
}
