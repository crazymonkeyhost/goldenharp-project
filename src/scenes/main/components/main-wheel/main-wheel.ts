import { Assets, Container, Point, Sprite } from 'pixi.js';
import { gsap } from 'gsap';
import { TWildSymbol } from '@/config/slot-config';
import { Spine } from '@esotericsoftware/spine-pixi-v8';

type MainWheelSector = TWildSymbol;

export class MainWheel extends Container {
  private readonly wheelEmptySectors: Sprite;

  private spinContainer = new Container();

  private glowAnimation: Spine;

  private readonly sectors: MainWheelSector[] = [
    'wild-amphora',
    'wild-torch',
    'wild-thunder',
    'wild-pandora',
    'wild-amphora',
    'wild-torch',
    'wild-thunder',
    'wild-pandora',
  ];

  private currentSector = 0;

  constructor() {
    super();
    this.addChild(this.spinContainer);

    this.wheelEmptySectors = new Sprite(Assets.get('main-wheel'));
    this.wheelEmptySectors.angle = -(360 / this.sectors.length) / 2;    // shift the wheel angle to one sector
    this.wheelEmptySectors.anchor.set(0.5);
    this.wheelEmptySectors.position.set(0, 0);
    this.spinContainer.addChild(this.wheelEmptySectors);

    this.glowAnimation = Spine.from({
      atlas: 'additional_machine.atlas',
      skeleton: 'additional_machine.json',
    });

    this.spinContainer.addChild(this.glowAnimation);
    this.glowAnimation.visible = false;

    this.createSectors();

    const arrow = Sprite.from('main-wheel-arrow');
    arrow.position.set(165, 0);
    arrow.anchor.set(0, 0.5);
    this.addChild(arrow);
  }

  private createSectors() {
    this.sectors.forEach((sector, i) => {
      const sprite = new Sprite(Assets.get(`wheel-${sector}`));
      sprite.anchor.set(0.5);

      const sectorAngle = this.getSectorAngle(i);

      sprite.angle = sectorAngle + 90;

      sprite.position.copyFrom(this.getSectorPosition(i));

      this.spinContainer.addChild(sprite);
    });
  }

  private getSectorPosition(i: number) {
    const R = 152;

    const sectorAngle = this.getSectorAngle(i);

    return new Point(R * Math.cos((sectorAngle * Math.PI) / 180), R * Math.sin((sectorAngle * Math.PI) / 180));
  }

  private getSectorAngle(i: number) {
    return (360 / this.sectors.length) * i;
  }

  public spin(sector: MainWheelSector): Promise<void> {
    this.glowAnimation.visible = false;

    const sectors = this.sectors;

    const availableSectors: Array<MainWheelSector | null> = [...this.sectors];

    const half = Math.floor(sectors.length / 2);

    for (let i = this.currentSector - half / 2; i < this.currentSector + half / 2; i++) {
      let index = i % sectors.length;

      if (index < 0) {
        index = sectors.length + index;
      }

      availableSectors[index] = null;
    }

    const sectorIndexes = availableSectors.reduce((acc, s, i) => (s === sector ? [...acc, i] : acc), [] as number[]);

    if (sectorIndexes.length > 1) {
      throw new Error(`Invalid sector: ${sector}`);
    }

    const sectorIndex = sectorIndexes[0];

    console.log('sectorIndex', sectorIndex);

    this.currentSector = sectorIndex;

    const sectorAngleTo = 360 - this.getSectorAngle(sectorIndex);

    const angleTo = this.spinContainer.angle < sectorAngleTo ? sectorAngleTo : sectorAngleTo + 360;

    const duration = Math.abs(angleTo - this.spinContainer.angle) / 250;

    return new Promise((resolve) => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (this.spinContainer.angle >= 360) {
            this.spinContainer.angle -= 360 * Math.floor(this.spinContainer.angle / 360);
          }

          resolve();
        },
      });

      tl.to(this.spinContainer, {
        angle: angleTo,
        duration,
        // ease: 'power1.out',
        ease: 'none',
      });
    });
  }


  public glow(loop = true) {
    this.glowAnimation.position.copyFrom(this.getSectorPosition(this.currentSector));
    this.glowAnimation.visible = true;
    this.glowAnimation.state.setAnimation(0, 'glow_circle', loop);
  }

  public stopGlow() {
    this.glowAnimation.visible = false;
    this.glowAnimation.state.clearTracks();
    this.glowAnimation.skeleton.setToSetupPose();
  }
}
