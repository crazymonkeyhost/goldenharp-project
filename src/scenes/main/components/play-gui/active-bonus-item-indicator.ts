import { BonusItemIndicator } from '@/scenes/main/components/play-gui/bonus-item-indicator';
import { activeBonuses, onBonusActivationListChanged } from '@/data/bonus-store';

export class ActiveBonusItemIndicator extends BonusItemIndicator {
  constructor() {
    super('bonus');

    this.watch();
  }


  private watch(){
    onBonusActivationListChanged.add(()=>{
      if (activeBonuses.length > 0) {

        this.show();
        this.field.text = '5x';

      } else {
        this.hide();
      }
    }, true)
  }
}
