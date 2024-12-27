import { Assets, Container, Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { getRandElement, rand } from '@/core/util/math';
import { toActionArea } from '@/core/services/resize/resize.service';
import { gameConfig } from '@/config/game-config';

export type WheelSector = 'zeus' | 'hades' | 'poseidon';

export class Wheel extends Container {
  private readonly wheelSectors: Sprite;

  private readonly wheelEmptySectors: Sprite;

  private spinContainer = new Container();

  public readonly buttonSpot = new Container();

  constructor() {
    super();
    this.addChild(this.spinContainer);

    this.wheelEmptySectors = new Sprite(Assets.get('wheel'));
    this.wheelEmptySectors.anchor.set(0.5);
    this.wheelEmptySectors.position.set(0, 0);
    this.spinContainer.addChild(this.wheelEmptySectors);

    this.wheelSectors = new Sprite(Assets.get('wheel-sectors'));
    this.wheelSectors.anchor.set(0.5);
    this.wheelSectors.position.set(-4, 16);
    this.spinContainer.addChild(this.wheelSectors);

    this.buttonSpot.position.set(0, 0);
    this.addChild(this.buttonSpot);

    const triangle = Sprite.from('wheel-triangle');
    triangle.anchor.set(0.5, 1);
    triangle.position.set(0, 450);
    this.addChild(triangle);

    // wheel columns
    const columns = new Sprite(Assets.get('wheel-columns'));
    columns.anchor.set(0.5);
    columns.position.set(7, 345);
    this.addChild(columns);

    toActionArea(this, { x: gameConfig.width / 2, y: gameConfig.height / 2 });
  }

  public reset() {
    this.angle = 0;
    this.spinContainer.angle = 0;
  }

  public spin(sector: WheelSector): Promise<void> {
    this.spinContainer.angle = 0;

    const sectors: WheelSector[] = ['zeus', 'hades', 'poseidon', 'zeus', 'hades', 'poseidon'];

    const sectorIndexes = sectors.reduce((acc, s, i) => (s === sector ? [...acc, i] : acc), [] as number[]);

    if (sectorIndexes.length === 0) {
      throw new Error(`Invalid sector: ${sector}`);
    }

    const sectorIndex = getRandElement(sectorIndexes);

    const sectorAngleFrom = 360 - (sectorIndex * 360) / sectors.length; /* - 360 / sectors.length / 2 + 2;*/

    const sectorAngleTo = 360 - (sectorIndex * 360) / sectors.length; /*+ 360 / sectors.length / 2 - 2;*/

    const fullSpins = 5;

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          resolve();
        },
      });

      // accelerate
      tl.to(this.spinContainer, {
        angle: 2 * 360,
        duration: 2 * 0.7,
        ease: 'back.in(1)',
      });

      // spin
      tl.to(this.spinContainer, {
        angle: (2 + fullSpins) * 360,
        duration: fullSpins * 0.2,
        ease: 'none',
      });

      // decelerate
      tl.to(this.spinContainer, {
        angle: (4 + fullSpins) * 360 + rand(sectorAngleFrom, sectorAngleTo),
        duration: 2 * 2.2,
        ease: 'back.out(1)',
      });
    });
  }
}
