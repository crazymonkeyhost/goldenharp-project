import { Cell } from '@/game/components/shared/slot/cell';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { Assets, Container } from 'pixi.js';
import { gsap } from 'gsap';
import { getSpineDuration, waitSpineEnds } from '@/core/util/spine';
import { SYMBOLS } from '@/config/slot-config';
import { wait } from '@/core/util/time';
import { getRandElement, rand } from '@/core/util/math';

export class MainCell extends Cell {
  private originalParent: Container;

  private originalZIndex = 0;

  private isOnTopLayer = false;

  protected spineAnimation: Spine | null = null;

  private positionBefore = 0;

  private animationDynamicCreation = false;

  private allTimeSchedulerUUID: NodeJS.Timeout | null = null;

  private scaleMult = 1.1;

  constructor(frameSize: WidthHeight, _index: number) {
    super(frameSize);

    if (!this.animationDynamicCreation) {
      this.createsSpineAnimation();
      this.animationsContainer.addChild(this.spineAnimation!);
    }

    this.interactiveChildren = false;
    this.interactive = false;

    this.scale.set(this.scaleMult);

    // this.cursor = 'pointer';

    // this.on('pointerdown', () => {
    //   this.updateToDynamicView();
    //
    //   const track = this.spineAnimation!.state.setAnimation(0, this.mapIdToWinAnimation().win, false);
    //
    //   // Set the animation to the last frame
    //   track.trackTime = track.animationEnd;
    //   this.spineAnimation?.skeleton.setToSetupPose();
    // });
  }

  getSpineAnimation() {
    if (!this.spineAnimation) {
      this.createsSpineAnimation();
    }

    return this.spineAnimation!;
  }

  destroySpineAnimation() {
    if (!this.animationDynamicCreation) return;

    if (this.spineAnimation) {
      this.spineAnimation.destroy({
        texture: true,

        textureSource: true,
      });
      this.spineAnimation = null;
    }
  }

  protected createsSpineAnimation() {
    this.spineAnimation = Spine.from({
      atlas: 'elements.atlas',
      skeleton: 'elements.json',
    });

    // this.spineAnimation =  Spine.from({
    //   skeleton: 'Rabbit.json',
    //   atlas: 'TPT_spine.atlas',
    // });

    this.animationsContainer.addChild(this.spineAnimation);

    this.spineAnimation.visible = false;
  }

  protected updateToStaticView() {
    if (this.spineAnimation) {
      this.spineAnimation.visible = false;
    }

    this.staticSprite.visible = true;
  }

  protected updateToDynamicView() {
    if (this.spineAnimation) {
      this.spineAnimation.visible = true;
    }

    this.staticSprite.visible = false;
  }

  setId(id: string | null) {
    if (this.id === id) return;

    this.id = id;

    if (this.id) {
      this.staticSprite.texture = this.getTextureById();
    }

    // this.updateToStaticView();

    if (this.spineAnimation) {
      this.setIdleAnimation();

      this.updateToDynamicView();
    } else {
      this.updateToStaticView();
    }
  }

  private setIdleAnimation(){
    if (!this.spineAnimation) return;

    const animationName = this.id ? this.mapIdToWinAnimation().standard2 : EMPTY_ANIMATION;

    const track = this.spineAnimation.state.setAnimation(0, animationName, false);
    // track.trackEnd = 0;
    // track.trackTime = 0;

    track.trackTime = track.animationEnd;
    // this.spineAnimation?.skeleton.setToSetupPose();
  }

  public bringToTop(topContainer: Container) {
    if (this.isOnTopLayer || this.parent === topContainer) return;

    if (this.parent) {
      this.originalParent = this.parent;

      this.originalZIndex = this.zIndex;

      this.parent.removeChild(this);
    }

    this.isOnTopLayer = true;

    topContainer.addChild(this);
  }

  public bringBackToOriginalParent() {
    if (!this.isOnTopLayer || this.parent === this.originalParent) return;

    if (this.parent) {
      this.parent.removeChild(this);
    }

    this.isOnTopLayer = false;

    this.originalParent.addChild(this);

    this.zIndex = this.originalZIndex;

    if (this.mask) {
      this.mask = null;
    }

    // this.x = 0;
  }

  override getTextureById(id: string | null = this.id) {
    return Assets.get(`${id!}`);
  }

  public playAllTime() {
    if (this.allTimeSchedulerUUID) return;

    const scheduleNext = (delay: number, [from, to]: [from: number, to: number]) => {
      this.allTimeSchedulerUUID = setTimeout(
        () => {
          const animations = this.mapIdToWinAnimation();

          const animationName = getRandElement([animations.standard1, animations.standard2]);

          this.spineAnimation?.state.setAnimation(0, animationName, false);

          scheduleNext(getSpineDuration(this.spineAnimation!, animationName), [5, 7]);
        },
        (delay + rand(from, to)) * 1000,
      );
    };

    scheduleNext(0, [3, 6]);
  }

  public stopAllTime() {
    if (!this.allTimeSchedulerUUID) return;

    clearInterval(this.allTimeSchedulerUUID);

    this.allTimeSchedulerUUID = null;
  }

  async appear(direction: 'left' | 'right', delay = 0) {
    const directionVector = direction === 'left' ? -1 : 1;

    const moveDistance = 100;

    this.stopAllTime();

    this.x = this.positionBefore - moveDistance * directionVector;

    await gsap
      .timeline({ delay })
      .add(() => {
        this.angle = 0;

        this.scale.set(1 * this.scaleMult);
      }, 0)

      .to(this, { x: this.x + moveDistance * directionVector, duration: 0.3, ease: 'back.out(1.7)' }, 0)
      .fromTo(this, { alpha: 0 }, { alpha: 1, duration: 0.1 }, 0.01)
      .fromTo(this, { angle: 5 * directionVector }, { angle: 0, duration: 0.3, ease: 'back.out(1.4)' }, 0.1)
      .then();
  }

  flushAnimaiton() {
    this.spineAnimation?.state?.clearTracks();
    this.spineAnimation?.skeleton?.setToSetupPose();
  }

  async disappear(direction: 'left' | 'right', delay = 0) {
    const directionVector = direction === 'left' ? -1 : 1;

    this.positionBefore = this.x;

    this.stopAllTime();

    this.updateToStaticView();

    await gsap
      .timeline({ delay })
      .to(this, { x: this.x + 60 * directionVector, duration: 0.4, ease: 'power4.out' })
      .to(this, { angle: -10 * directionVector, duration: 0.2 }, 0)
      .to(this.scale, { x: 0.6 * this.scaleMult, y: 0.6 * this.scaleMult, duration: 0.2 }, 0)
      .to(this, { alpha: 0, duration: 0.1 }, 0.05)
      .then();
  }

  public async explode() {
    // this.flushAnimaiton();
    this.stopAllTime();
    await this.playMainSpineAnimation(0, this.mapIdToWinAnimation().explode);

    // await this.playMainSpineAnimation(1, EXPLOSION_ANIMATION);
  }

  public async playLightning() {
    await this.playMainSpineAnimation(1, LIGHTNING_ANIMATION);
  }

  public async playCometExplosion(replaceTo: string) {
    let explodeResolve: () => void;

    const explodePromise = new Promise<void>((resolve) => {
      explodeResolve = resolve;
    });

    gsap.timeline().call(
      () => {
        // this.setId(replaceTo);
        // console.log('replaceTo', replaceTo);
        this.explode().then(explodeResolve);
      },
      undefined,
      getSpineDuration(this.spineAnimation!, COMET_ANIMATION) * 0.8,
    );

    await this.playMainSpineAnimation(1, COMET_ANIMATION);
    await explodePromise;
    this.setId(replaceTo);
  }

  public async playCrystalAppear() {
    this.stopAllTime();
    await this.playMainSpineAnimation(1, CRYSTAL_ANIMATION);
  }

  public playCrystalExplode() {
    return this.playMainSpineAnimation(1, CRYSTAL_EXPLOSION_ANIMATION);
  }

  private async playMainSpineAnimation(track: number, animationName: string) {
    const spineAnimation = this.getSpineAnimation();

    this.stopAllTime();

    this.updateToDynamicView();

    spineAnimation.state.setAnimation(track, animationName, false);

    await waitSpineEnds(spineAnimation, animationName);

    this.destroySpineAnimation();
  }

  async playWin(_winType: WinType, _playElementAnimation: boolean) {
    // if (!playElementAnimation) return wait(1000).done;

    this.flushAnimaiton();

    this.stopAllTime();

    this.updateToDynamicView();

    const spineAnimation = this.getSpineAnimation();

    const animationName = this.mapIdToWinAnimation().win;

    spineAnimation.state.setAnimation(0, animationName, false);
    // spineAnimation.state.setAnimation(1, CIRCLE_ANIMATION, false);

    await waitSpineEnds(spineAnimation, animationName);
  }

  public stopWin() {
    this.setIdleAnimation();
  }

  private mapIdToWinAnimation(): {
    standard1: string;
    standard2: string;
    win: string;
    explode: string;
  } {
    //
    // return {
    //   standard1: 'symbol_run',
    //   standard2: 'symbol_idle_loop',
    //   win: 'dance_shuffle'
    // }

    switch (this.id) {
      case SYMBOLS.LYRE:
        return {
          standard1: 'lyre_standart1',
          standard2: 'lyre_standart2',
          win: 'lyre_win',
          explode: 'lyre_explosion',
        };

      case SYMBOLS.ROSEBUD:
        return {
          standard1: 'rosebud_standart1',
          standard2: 'rosebud_standart2',
          win: 'rosebud_win',
          explode: 'rosebud_explosion',
        };

      case SYMBOLS.SHIELD:
        return {
          standard1: 'shield_standart1',
          standard2: 'shield_standart2',
          win: 'shield_win',
          explode: 'shield_explosion',
        };

      case SYMBOLS.SANDAL:
        return {
          standard1: 'sandal_standart1',
          standard2: 'sandal_standart2',
          win: 'sandal_win',
          explode: 'sandal_explosion',
        };

      case SYMBOLS.APHRODITE:
        return {
          standard1: 'Aphrodite_standart1',
          standard2: 'Aphrodite_standart2',
          win: 'Aphrodite_win',
          explode: 'Aphrodite_explosion',
        };

      case SYMBOLS.ATHENA:
        return {
          standard1: 'Athena_standart1',
          standard2: 'Athena_standart2',
          win: 'Athena_win',
          explode: 'Athena_explosion',
        };

      case SYMBOLS.HADES:
        return {
          standard1: 'Hades_standart1',
          standard2: 'Hades_standart2',
          win: 'Hades_win',
          explode: 'Hades_explosion',
        };

      case SYMBOLS.POSEIDON:
        return {
          standard1: 'poseidon_standart1',
          standard2: 'poseidon_standart2',
          win: 'poseidon_win',
          explode: 'poseidon_explosion',
        };

      case SYMBOLS.CRONUS:
        return {
          standard1: 'cronus_standart1',
          standard2: 'cronus_standart2',
          win: 'cronus_win',
          explode: 'cronus_explosion',
        };

      case SYMBOLS.ZEUS:
        return {
          standard1: 'zeus_standart1',
          standard2: 'zeus_standart2',
          win: 'zeus_win',
          explode: 'zeus_explosion',
        };

      case SYMBOLS.WILD_AMPHORA:
        return {
          standard1: 'amphora_standart1',
          standard2: 'amphora_standart2',
          win: 'amphora_win',
          explode: 'amphora_explosion',
        };

      case SYMBOLS.WILD_THUNDER:
        return {
          standard1: 'thunder_standart1',
          standard2: 'thunder_standart2',
          win: 'thunder_win',
          explode: 'thunder_explosion',
        };

      case SYMBOLS.WILD_TORCH:
        return {
          standard1: 'torch_standart1',
          standard2: 'torch_standart2',
          win: 'torch_win',
          explode: 'torch_explosion',
        };

      case SYMBOLS.WILD_PANDORA:
        return {
          standard1: 'pandora_wild_standart1',
          standard2: 'pandora_wild_standart2',
          win: 'pandora_wild_win',
          explode: 'pandora_wild_explosion',
        };
      default:
        throw new Error(`Unexpected symbol ${this.id}`);
    }
  }
}

export type WinType = 'normal' | 'explode';

const EMPTY_ANIMATION = 'empty';
// const CIRCLE_ANIMATION = 'dance_foot_rhythm';
const EXPLOSION_ANIMATION = 'explosion';
const LIGHTNING_ANIMATION = 'lightning';
const COMET_ANIMATION = 'comet';
const CRYSTAL_ANIMATION = 'crystal';
const CRYSTAL_EXPLOSION_ANIMATION = 'crystal_explosion';
// const EXPLOSION_ANIMATION = 'dance_jamming';
