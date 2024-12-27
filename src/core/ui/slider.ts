import { Slider as SliderVendor } from '@pixi/ui';

export class Slider extends SliderVendor {
  protected updateSlider() {
    this.progress = (((this.value ?? this.min) - this.min) / (this.max - this.min)) * 100;

    this._slider1.x = (this.fill?.width * 0.88) * this.progress / 100 - this._slider1.width / 4;
    this._slider1.y = this.fill?.y + this.fill?.height / 2;

    if (this.sliderOptions?.showValue) {
      if (this.value1Text){
        this.value1Text.text = `${Math.round(this.value)}`;
      }

      const sliderPosX = this._slider1.x + this._slider1.width / 2;
      const sliderPosY = this._slider1.y;

      if (this.value1Text){
        this.value1Text.x = sliderPosX + (this.sliderOptions.valueTextOffset?.x ?? 0);
        this.value1Text.y = sliderPosY + (this.sliderOptions.valueTextOffset?.y ?? 0);
      }
    }
  }

  disable(){
    this.interactiveChildren = false;
  }

  enable(){
    this.interactiveChildren = true;
  }

}
