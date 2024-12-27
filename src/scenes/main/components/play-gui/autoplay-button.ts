import { getButtonStatesTextures } from '@/core/util/textures';
import { PressedSpriteButton } from '@/core/ui/pressed-sprite-button';
import { autoplayService } from '@/game/services/autoplay-service';

export class AutoplayButton extends PressedSpriteButton {
  constructor(openAutoplayMenu: () => void) {
    super({
      textures: getButtonStatesTextures('auto-button'),
      action : ()=>{
        if (this.isPressed) {
          autoplayService.stop();
        } else {
          openAutoplayMenu();
        }
      }
    });


    autoplayService.onStateSwitch.add(({ active }) => {
      if (active) {
        this.activate();
      } else {
        this.deactivate();
      }
    });
  }
}
