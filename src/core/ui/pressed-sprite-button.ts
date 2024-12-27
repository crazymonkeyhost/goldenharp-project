import { SpriteButton } from '@/core/ui/sprite-button';

export class PressedSpriteButton extends SpriteButton {
  public isPressed = false;

  activate() {
    this.isPressed = true;

    // super.enabled = false;

    this.buttonBg.texture = this.textures[1];
  }

  deactivate() {
    this.isPressed = false;

    // super.enabled = true;

    this.buttonBg.texture = this.textures[0];
  }

  get isDown() {
    return this.isPressed;
  }

  override press() {
    // super.enabled = false;

    super.press();

    // this.activate();
  }
}
