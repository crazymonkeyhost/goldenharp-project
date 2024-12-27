import { getButtonStatesTextures } from '@/core/util/textures';
import { PressedSpriteButton } from '@/core/ui/pressed-sprite-button';
import { settingsService } from '@/game/services/settings-service';

export class SpeedButton extends PressedSpriteButton {
  constructor() {
    super({
      textures: getButtonStatesTextures('speed-button'),
      action : ()=>{
        if (!this.isPressed) {
          settingsService.setSpeed(100, this);
        } else {
          settingsService.setSpeed(0, this);
        }
      }
    });

    const onSpeedChange = (value: number) => {
      if (value === 100) {
        this.activate();
      } else {
        this.deactivate();
      }
    };

    onSpeedChange(settingsService.getSpeed());

    settingsService.onChanges.add((payload) => {
      if (payload.speed !== undefined) {
        onSpeedChange(payload.speed);
      }
    });
  }
}