import type { Game } from '../game';
import { Container } from 'pixi.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Scene<N extends string = any, G extends Game<any> = Game<any>> {
  name: N;

  game: G;

  stage = new Container();

  public preloaded = false;

  constructor(name: N) {
    this.name = name;

    this.stage.label = name;

    this.hide();
  }

  public init(game: G) {
    this.game = game;
  }

  async preload(_cb?: (progress: number) => void) {}

  async create() {}

  async onEnter(_customData?:unknown) {}

  async onStart(_customData?:unknown) {}

  async onLeave() {}

  hide() {
    this.stage.visible = false;
  }

  async show() {
    this.stage.visible = true;
  }

  destroy() {

  }
}
