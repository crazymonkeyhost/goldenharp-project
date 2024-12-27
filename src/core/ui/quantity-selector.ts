import { Signal } from '@/core/util/signal';
import { Assets, Container, Sprite, Text, type Texture, TextStyleOptions, type PointData } from 'pixi.js';
import { ButtonTextures, ButtonTexturesConfig, SpriteButton } from '@/core/ui/sprite-button';

export class QuantitySelector extends Container {
  onChange = new Signal<number>();

  _values: number[] = [];

  _index = 0;

  _previousIndex = 0;

  _config: QuantitySelectorConfiguration;

  _background: Sprite | null = null;

  _plusButton: SpriteButton;

  _minusButton: SpriteButton;

  _valueField: Text;

  _labelField: Text | null = null;

  _formatter = (v: string | number) => `${v}`;

  constructor(values: number[], defaultIndex = 0, config: QuantitySelectorConfiguration) {
    super();

    this._config = config;

    this._formatter = this._config.formatter ? this._config.formatter : this._formatter;

    this._values = values;

    this._background = this._createBackground();

    this._plusButton = this._createPlusButton();

    this._minusButton = this._createMinusButton();

    this._valueField = this._createValueField();

    this._labelField = this._createLabelField();

    this.setIndex(defaultIndex, true);
  }

  disable() {
    this._plusButton.enabled = false;
    this._minusButton.enabled = false;
  }

  enable() {
    this._updateButtonsState();
  }

  _createBackground() {
    if (!this._config.background) return null;

    const bg = new Sprite(Assets.get(this._config.background));

    bg.anchor.set(0.5, 0.5);

    this.addChild(bg);

    return bg;
  }

  _createPlusButton() {
    const button = new SpriteButton({
      textures: this._config.plusButton,
      action: () => {
        this.setIndex(this._index + 1);
      },
    });

    const width = this._config.background
      ? Assets.get<Texture>(this._config.background).width
      : this._config.width || 0;

    button.view.x = width / 2 + button.view.width * 0.7;

    this.addChild(button.view);

    return button;
  }

  _createMinusButton() {
    const button = new SpriteButton({
      textures: this._config.minusButton,
      action: () => {
        this.setIndex(this._index - 1);
      },
    });

    const width = this._config.background
      ? Assets.get<Texture>(this._config.background).width
      : this._config.width || 0;

    button.view.x = width / -2 - button.view.width * 0.7;

    this.addChild(button.view);

    return button;
  }

  _createValueField() {
    const text = new Text({
      text: '0',
      style: this._config.styles?.valueField,
    });

    text.anchor.set(0.5);

    if (this._config.valuePosition) {
      text.position.set(this._config.valuePosition.x, this._config.valuePosition.y);
    }

    this.addChild(text);

    return text;
  }

  _createLabelField() {
    if (!this._config.label) return null;

    const text = new Text(this._config.label);


    this.addChild(text);

    return text;
  }

  setIndex(index: number, silent = false) {
    this._index = index;

    if (this._previousIndex !== index) {
      this._previousIndex = index;
      if (!silent) {
        this.onChange.dispatch(this._index);
      }
    }

    this._updateValueField();
    this._updateButtonsState();
  }

  getValue() {
    return this._values[this._index];
  }

  _updateValueField() {
    const value = this.getValue();
    this._valueField.text = `${this._formatter(value)}`;
  }

  _updateButtonsState() {
    this._minusButton.enabled = this._index > 0;
    this._plusButton.enabled = this._index < this._values.length - 1;
  }
}

type QuantitySelectorConfiguration = {
  formatter?: (val: string | number) => string;

  label?: string;

  styles?: {
    labelField?: Partial<TextStyleOptions>;
    valueField: Partial<TextStyleOptions>;
  };

  valuePosition?: PointData;

  plusButton: ButtonTextures | ButtonTexturesConfig;

  minusButton: ButtonTextures | ButtonTexturesConfig;

  background?: string;

  width?: number;
};
