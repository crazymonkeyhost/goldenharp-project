import { Container, Point } from 'pixi.js';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { lastResizeData, onResize } from '@/core/services/resize/resize.service';
import { getRandElement, rand } from '@/core/util/math';

export class Hero extends Container {
  private animation: Spine | null;

  private currentPosition = new Point(1650, 1070);

  private currentHero: THeroes | null = null;

  constructor() {
    super();

    onResize(this.resize.bind(this));

    //@ts-ignore
    window.hero = this;
  }

  resize(rd?: ResizeData) {
    rd = rd || lastResizeData();

    const position = this.currentPosition;

    this.position.set(rd.actionArea.x + position.x, rd.actionArea.y + position.y);
  }

  public switchToMinotaur() {
    this.createAnimation('minotaur');

    this.animation?.state.setAnimation(0, 'minotaur2', false); // thumb up animation

    this.playHeroIdle('minotaur1', ['minotaur3']);
  }

  public switchToMedusa() {
    this.createAnimation('medusa_girl');

    this.playHeroIdle('medusa1', ['medusa2', 'medusa3', 'medusa4']);
  }

  public switchToPoseidon() {
    this.createAnimation('poseidon');

    this.playHeroIdle('poseidon1', ['poseidon2', 'poseidon3']);
  }

  public switchToCronus() {
    this.createAnimation('cronus');

    this.animation?.state.addAnimation(0, 'cronus1', true);
  }

  public playCronusAction() {
    this.animation?.state.addAnimation(0, 'cronus2', false);
    this.animation?.state.addAnimation(0, 'cronus1', true);
  }

  public switchToHades() {
    this.createAnimation('hades');

    this.playHeroIdle('hades1', ['hades2', 'hades3']);
  }

  public switchToZeus() {
    this.createAnimation('zeus');

    this.playHeroIdle('zeus1', ['zeus2', 'zeus3']);
  }

  /**
   * Generic function for playing hero idle animation
   *
   * Given a hero main animation that plays most of the time on the loop
   *
   * and there are array of secondary animations that plays randomly after some time
   */
  private playHeroIdle(mainAnimation: string, secondaryAnimations: string[]) {
    let nextAnimationCountdown = 0;

    const playIdle = () => this.animation?.state.addAnimation(0, mainAnimation, true);

    const playRandom = () => this.animation?.state.addAnimation(0, getRandElement(secondaryAnimations), false);

    const setCountdown = () => (nextAnimationCountdown = rand(3, 5));

    setCountdown();
    playIdle();

    this.animation?.state.addListener({
      complete: (entry) => {

        if (entry.animation?.name === mainAnimation && --nextAnimationCountdown === 0) {
          playRandom();
        }

        if (entry.animation?.name !== mainAnimation) {
          setCountdown();
          playIdle();
        }
      },
    });
  }

  /** generic method to create animation for different hero */
  private createAnimation(hero: THeroes) {
    this.currentHero = hero;

    this.animation?.destroy({
      texture: true,
      children: true,
      textureSource: true,
    });

    this.animation = Spine.from({
      skeleton: `${hero}.json`,
      atlas: `${hero}.atlas`,
    });

    this.addChild(this.animation);
  }
}

type THeroes = 'minotaur' | 'medusa_girl' | 'poseidon' | 'cronus' | 'hades' | 'zeus';
