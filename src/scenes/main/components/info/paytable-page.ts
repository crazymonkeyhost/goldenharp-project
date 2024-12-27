import { Container, Sprite, Text } from 'pixi.js';
import { TapPageItem } from '../settings/bookmark-tab-pages';
import { lowSymbols, type Paytable, seniorSymbols, SYMBOLS } from '@/config/slot-config';
import { gameStyles } from '@/game-styles';
import { currencyFormatter } from '@/core/services/currency-formatter';

/** Paytable page */
export class PaytablePage implements TapPageItem {
  public readonly title: Text;

  public readonly content: Container;

  private updatePaytable: Array<(bet: number) => void> = [];

  constructor(paytable: Paytable) {
    this.title = this.createTitle();

    this.content = this.createContent(paytable);
  }

  public update(bet: number) {
    this.updatePaytable.forEach((update) => update(bet));
  }

  protected createTitle() {
    return new Text({ text: 'PAY TABLE', style: gameStyles.settingsTitle });
  }

  protected createContent(paytable: Paytable) {
    const content = new Container();

    const allPaytableCells = [...lowSymbols, ...seniorSymbols, SYMBOLS.ZEUS,null, 'WILD', null, ];

    // cells payouts
    for (let i = 0; i < allPaytableCells.length; i++) {
      const cell = allPaytableCells[i];

      if (cell === null) continue;

      const cellContainer = new Container();

      cellContainer.position.set((i % 3) * 340 - 550, Math.floor(i / 3) * 183 + 120);

      const bg = Sprite.from(cell === 'WILD' ? 'paytable-wild-desc' : 'paytable-item-bg');
      bg.anchor.set(0.5, 0.5);
      cellContainer.addChild(bg);

      if (cell !== 'WILD') {
        const icon = Sprite.from(cell);
        icon.anchor.set(1, 0.5);
        cellContainer.addChild(icon);

        const payouts = [paytable.getPayout(cell, 3), paytable.getPayout(cell, 4), paytable.getPayout(cell, 5)];

        payouts.forEach((payout, j) => {
          const multText = new Text({
            text: `X${j + 3} - `,
            style: gameStyles.paytableMult,
            anchor: {
              x: 0.5,
              y: 0.5,
            },
            position: {
              x: 40,
              y: (j - 1) * 31,
            },
          });
          cellContainer.addChild(multText);

          const valueText = new Text({
            text: '',
            style: gameStyles.paytableValue,
            anchor: {
              x: 0,
              y: 0.5,
            },
            position: {
              x: 65,
              y: (j - 1) * 31,
            },
          });

          cellContainer.addChild(valueText);

          this.updatePaytable.push((bet) => {
            valueText.text = currencyFormatter.format(payout * bet);
          });
        });
      }

      content.addChild(cellContainer);
    }


    // creating static zeus
    const zeus = Sprite.from('paytable-zeus');
    zeus.position.set(360, 137);
    content.addChild(zeus);

    return content;
  }
}
