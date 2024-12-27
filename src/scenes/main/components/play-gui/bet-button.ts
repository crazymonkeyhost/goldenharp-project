import { getButtonStatesTextures } from '@/core/util/textures';
import { gameStyles } from '@/game-styles';
import { currencyFormatter } from '@/core/services/currency-formatter';
import { SpriteButton } from '@/core/ui/sprite-button';

export class BetButton extends SpriteButton{

  constructor(action: () => void) {
    super(
      {
        textures: getButtonStatesTextures('bet-button'),
        action,
        textStyle: gameStyles.mainSceneButtonValue,
        text: ``,
      }
    );

    this.textView.position.set(0, 7);
  }

  public setValue(value: number, _percentage: number ) {
    this.textView.text = currencyFormatter.format(value);
  }
}
