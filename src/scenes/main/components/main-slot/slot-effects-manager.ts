import { Container } from 'pixi.js';
import { MainSlot } from '@/scenes/main/components/main-slot/main-slot';
import { TCombinationItem, TReplacementItem } from '@/api/response-types';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { getSpineDuration, waitSpineEnds } from '@/core/util/spine';
import { gsap } from 'gsap';

export class SlotEffectsManager {
  private slot: MainSlot;

  private animations: Spine[] = [];

  private container: Container;

  constructor(slot: MainSlot, container: Container) {
    this.slot = slot;
    this.container = container;
  }

  async commetReplace(replaced: TReplacementItem[]) {
    await Promise.all(
      replaced.map((item) => {
        const [x, y] = item.location;

        const animation = this.createRockMeteor();

        const timeline = gsap.timeline();

        const totalDuration = getSpineDuration(animation, 'comet');

        const to = this.slot.getCellPosition(x, y);

        const from = { x: to.x - 300, y: to.y - 1000 };

        animation.angle = (Math.atan2(to.y - from.y, to.x - from.x) * 180) / Math.PI - 90;

        timeline.fromTo(animation, { alpha: 0 }, { alpha: 1, duration: 0.2 }).fromTo(
          animation,
          { x: from.x, y: from.y },
          {
            x: to.x,
            y: to.y,
            duration: totalDuration * 0.5,
            ease: 'power1.in',
            onComplete: () => {
              cell.setId(item.symbol);
              cell.playAllTime();
            },
          },
        );

        const cell = this.slot.getCell(x, y);

        cell.stopAllTime();

        animation.state.setAnimation(0, 'comet', false);

        return waitSpineEnds(animation, 'comet');
      }),
    );

    this.destroyAllAnimations();
  }

  async crystalExplode(cellsPositions: TCombinationItem['location'][]) {
    await Promise.all(
      cellsPositions.map(([x, y]) => {
        const animation = this.createRockMeteor();

        animation.position.copyFrom(this.slot.getCellPosition(x, y));

        const cell = this.slot.getCell(x, y);

        cell.stopAllTime();

        animation.state.setAnimation(0, 'crystal', false);
        waitSpineEnds(animation, 'crystal').then(() => {
          cell.alpha = 0;
        });

        animation.state.addAnimation(0, 'crystal_explosion', false);

        return waitSpineEnds(animation, 'crystal_explosion');
      }),
    );

    this.destroyAllAnimations();
  }

  async playLightning(cellsPositions: TCombinationItem['location'][]) {
    await Promise.all(
      cellsPositions.map(([x, y]) => {
        const animation = this.createLightning();

        animation.position.copyFrom(this.slot.getCellPosition(x, y));

        animation.y -= 50;

        const cell = this.slot.getCell(x, y);

        cell.stopAllTime();

        animation.state.setAnimation(0, 'animation', false);

        return waitSpineEnds(animation, 'animation');
      }),
    );

    this.destroyAllAnimations();
  }

  destroyAllAnimations() {
    this.animations.forEach((animation) => {
      animation.destroy();
    });

    this.animations = [];
  }

  createLightning() {
    // animation
    const animation = Spine.from({
      atlas: 'lightning.atlas',
      skeleton: 'lightning.json',
    });

    this.container.addChild(animation);

    this.animations.push(animation);

    return animation;
  }

  createRockMeteor() {
    // comet, crystal, crystal_explosion, glow_circle
    const animation = Spine.from({
      atlas: 'additional_machine.atlas',
      skeleton: 'additional_machine.json',
    });

    this.container.addChild(animation);

    this.animations.push(animation);

    return animation;
  }
}
