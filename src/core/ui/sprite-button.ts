import { Button, ScrollBox } from '@pixi/ui';

import { Texture, Text, Sprite, Container, TextStyle } from 'pixi.js';
import { Signal } from "@/core/util/signal";

export type ButtonTextures = [normal: Texture, pressed: Texture, hover?: Texture, disabled?: Texture];
export type ButtonTexturesConfig = [normal: string, pressed: string, hover?: string, disabled?: string];

export type SpriteButtonProps = {
  textures: ButtonTextures | ButtonTexturesConfig;
  text?: string;
  textStyle?: Partial<TextStyle>;
  disabled?: boolean;
  action?: (event: string) => void;
};

export class SpriteButton extends Button {
  public readonly onChange = new Signal<{state:'down'|'up'|'hover'}>()

  private buttonView = new Container();

  public readonly textView: Text;

  public readonly buttonBg = new Sprite();

  protected action: (event: string) => void;

  protected textures: ButtonTextures;

  constructor(props: SpriteButtonProps) {
    super();

    this.textures = props.textures.map((texture) =>
      typeof texture === 'string' ? Texture.from(texture) : texture,
    ) as ButtonTextures;

    this.view = this.buttonView;

    this.buttonBg.texture = this.textures[0];

    this.buttonBg.anchor.set(0.5);

    this.textView = new Text({
      text: props.text,
      style: props.textStyle || { fill: '#fff' },
      resolution:2
    });
    this.textView.y = 0;
    this.textView.anchor.set(0.5);

    this.buttonView.addChild(this.buttonBg, this.textView);

    this.enabled = !props.disabled;

    this.action = props.action || (() => {});
  }

  override down() {
    this.onChange.dispatch({state:'down'})
    this.buttonBg.texture = this.textures[1];
  }

  override up() {
    this.onChange.dispatch({state:'up'})

    const [normal] = this.textures;

    this.buttonBg.texture = normal;
  }

  override upOut() {
    if (this.isDown) return;

    this.onChange.dispatch({state:'up'})

    this.buttonBg.texture = this.textures[0];
  }

  override out() {
    if (this.isDown) return;

    this.buttonBg.texture = this.textures[0];
  }

  override hover() {
    if (this.isDown) return;

    this.onChange.dispatch({state:'hover'})

    const [, pressed, hover] = this.textures;

    if (!this.isDown) {
      this.buttonBg.texture = hover || pressed;
    }
  }

  override press() {
    this.action('onPress');
  }

  set enabled(enabled: boolean) {
    super.enabled = enabled;

    const [normal, , , disabled] = this.textures;

    this.buttonBg.texture = enabled ? normal : disabled || normal;
  }
}
