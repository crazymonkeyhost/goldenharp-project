import { Assets, Container, Sprite, Text } from 'pixi.js';
import { CheckBox } from '@pixi/ui';
import { clamp } from '@/core/util/math';
import { Slider } from '@/core/ui/slider';
import { gameStyles } from '@/game-styles';
import { settingsService } from '@/game/services/settings-service';
import { TapPageItem } from './bookmark-tab-pages';

/** Settings page */
export class SettingsPage implements TapPageItem{
  public readonly title: Text;

  public readonly content: Container;

  constructor(){
    this.title = this.createTitle();

    this.content = this.createContent();
  }

  protected createTitle() {
    return new Text({text : 'SETTINGS', style: gameStyles.settingsTitle});
  }

  protected createContent() {
    const content = new Container();
    // sliders
    const slidersY = 180;
    const slidersYPadding = 240;

    // music
    const musicSlier = this.createSettingsSlider(
      'MUSIC VOLUME:',
      settingsService.getMusicVolume(),
      (value) => settingsService.setMusicVolume(value, musicSlier),
    );
    musicSlier.root.x = 0;
    musicSlier.root.y = slidersY + slidersYPadding * 0;
    content.addChild(musicSlier.root);

    // sound
    const soundSlier = this.createSettingsSlider(
      'SOUND VOLUME:',
      settingsService.getSoundVolume(),
      (value) => settingsService.setSoundVolume(value, soundSlier),
    );
    soundSlier.root.x = 0;
    soundSlier.root.y = slidersY + slidersYPadding * 1;
    content.addChild(soundSlier.root);

    // // animations speed
    // const speedSlider = this.createSettingsSlider(
    //   'ANIMATIONS SPEED:',
    //   settingsService.getSpeed(),
    //   (value) => settingsService.setSpeed(value, speedSlider),
    // );
    // speedSlider.root.x = 0;
    // speedSlider.root.y = slidersY + slidersYPadding * 2;
    // content.addChild(speedSlider.root);
    //
    // settingsService.onChanges.add((payload) => {
    //   if (payload.speed !== undefined && payload.target !== speedSlider) {
    //     speedSlider.setValue(payload.speed);
    //   }
    // });

    // // Checkboxes
    // const checkboxesY = 550;
    //
    // // elements checkbox
    // const elementsAnimationCheckbox = this.createSettingsCheckBox(
    //   'ELEMENTS ANIMATION',
    //   settingsService.getElementAnimation(),
    //   (checked) => settingsService.setElementAnimation(checked, elementsAnimationCheckbox),
    // );
    // elementsAnimationCheckbox.x = -560;
    // elementsAnimationCheckbox.y = checkboxesY;
    // content.addChild(elementsAnimationCheckbox);
    //
    // // win animation checkbox
    // const winAnimationCheckbox = this.createSettingsCheckBox(
    //   'WIN ANIMATION',
    //   settingsService.getWinAnimation(),
    //   (checked) => settingsService.setWinAnimation(checked, winAnimationCheckbox),
    // );
    // winAnimationCheckbox.x = 100;
    // winAnimationCheckbox.y = checkboxesY;
    // content.addChild(winAnimationCheckbox);

    return content;
  }

  private createSettingsCheckBox(text: string, checked: boolean, onChange: (checked: boolean) => void): Container {
    const root = new Container();

    const checkBox = new CheckBox({
      checked: checked,
      style: {
        unchecked: `settings-checkbox-off`,
        checked: `settings-checkbox-on`,
        text: gameStyles.settingCheckboxTitle,
      },
      text,
    });

    checkBox.onChange.connect(() => {
      onChange(checkBox.checked);
    });

    checkBox.x = 0;
    checkBox.y = Assets.get('settings-checkbox-off').height / -2;

    root.addChild(checkBox);
    return root;
  }

  private createSettingsSlider(
    text: string,
    defaultValue: number,
    onChange: (val: number) => void,
  ): {
    root: Container;
    setValue: (val: number) => void;
  } {
    const root = new Container();

    const title = new Container();
    title.position.set(-700, 0);
    root.addChild(title);

    // const titleBg = Sprite.from('settings-label-bg');
    // titleBg.anchor.set(0.5, 0.5);
    // title.addChild(titleBg);

    const titleField = new Text({
      text,
      style: gameStyles.settingSlider,
      anchor: { x: 0, y: 0.5 },
    });
    title.addChild(titleField);

    const valueText = new Text({
      text: `${defaultValue}%`,
      style: gameStyles.settingSliderValue,
    });

    valueText.anchor.set(0, 0.5);
    valueText.x = -200;
    root.addChild(valueText);

    const bg_slider = Sprite.from('slider-bg');

    const slider = new Slider({
      bg: 'slider-bg',
      fill: 'slider-fill',
      slider: 'slider-thumb',
      value: defaultValue,
      min: 0,
      max: 100,

      fillPaddings: {
        top: 0,
        left: 0,
      },

      showValue: false,
    });
    slider.x = 0;
    slider.y = bg_slider.height / -2;

    slider.onUpdate.connect((value) => {
      value = clamp(value, 0, 100);

      onChange(value);

      valueText.text = `${Math.round(value)}%`;
    });

    root.addChild(slider);

    return {
      root,
      setValue: (val) => {
        slider.value = val;
      },
    };
  }
}
