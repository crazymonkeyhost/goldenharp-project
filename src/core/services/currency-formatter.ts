import { roundNumber } from '@/core/util/math';

class CurrencyFormatter {


  private _formatter = new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    trailingZeroDisplay: 'stripIfInteger',

  });

  format(value: number): string {
    return this._formatter.format(roundNumber(value));
  }

}

export const currencyFormatter = new CurrencyFormatter();