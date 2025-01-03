import { Assets, Container, Sprite, type Texture } from 'pixi.js';
import { Signal } from '@/core/util/signal';

export class Bookmark extends Container {
  public readonly onClicked = new Signal();

  private isActive = false;

  protected readonly bg: Sprite;

  private originalX: number | null = null;

  public readonly index: number;

  constructor() {
    super();
    this.bg = this.addChild(Sprite.from('navigation-normal'));
    this.bg.anchor.set(0.5);
    this.addChild(this.bg);

    this.interactive = true;

    this.cursor = 'pointer';

    this.on('pointerdown', () => {
      this.onClicked.dispatch();
    });
  }

  public activate() {
    if (this.isActive) return;

    if (this.originalX === null) {
      this.originalX = this.x;
    }

    this.isActive = true;

    this.bg.texture = Assets.get<Texture>('navigation-active');
  }

  public deactivate() {
    if (!this.isActive) return;

    this.isActive = false;

    if (this.originalX !== null) {
      this.x = this.originalX;
    }

    this.bg.texture = Assets.get<Texture>('navigation-normal');
  }
}
