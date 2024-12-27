import { Application, Assets } from 'pixi.js';
import { Scene } from './scene/Scene';
import { Layers } from '@/core/layers';
import { ResizeService } from '@/core/services/resize/resize.service';

interface _ApplicationConfig {
  background: string;
  width?: number;
  height?: number;
}

type AllScenes<S extends readonly Scene<string>[]> = S[number]['name'];

import styles from './game.module.css';
import { FullScreenService } from '@/core/services/full-screen-service';
import { DebugBounds } from '@/core/services/resize/debug-bounds';
import { gameConfig } from '@/config/game-config';



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Game<S extends readonly Scene<any>[]> {
  public config = {
    width: gameConfig.width,
    height: gameConfig.height,
    containMaxSize: 2500,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static instance: Game<any>;

  public pixiApp: Application;

  public readonly scenes: S;

  public readonly resizeService = new ResizeService();

  public readonly layers = new Layers();

  private currentScene: S[number] | null = null;

  constructor(scenes: S) {
    if (Game.instance) return Game.instance;

    Game.instance = this;
    this.pixiApp = new Application();

    this.scenes = scenes;

  }

  async start() {
    const root = document.querySelector('#game') as HTMLElement;

    root.classList.add(styles.game);

    await this.pixiApp.init({ background: '#000000' , resolution:1});

    // @ts-ignore
    globalThis.__PIXI_APP__ = this.pixiApp;

    await Assets.init({
      manifest:'manifest.json',
      basePath:'assets',
     texturePreference: {
        // format: 'png',
     }
    })

    root.appendChild(this.pixiApp.canvas);

    this.resizeService.add(this.resize.bind(this));

    this.resizeService.init(root, this.pixiApp.canvas, { ...this.config, resizeType: 'contain' });

    this.layers.init(
      this.pixiApp.stage,
      this.scenes.map((scene) => scene.stage),
    );

    const bootScene = await this.launchBootScene();

    await this.preload();

    await this.create();

    const successConnection = await this.connectToServer();

    if (!successConnection) {
      return;
    }

    new FullScreenService().init(root);

    await this.switchScene(this.getInitialScene()?.name);

    if (bootScene) {
      await bootScene.destroy();
    }

    // this.pixiApp.stage.addChild(new DebugBounds(this.pixiApp.canvas))
  }

  protected async connectToServer():Promise<boolean>{
    return  true;
  }

  async launchBootScene() {
    const bootScene = this.getBootScene();

    if (bootScene) {
      await this.switchScene(bootScene.name);
    }

    return bootScene;
  }

  async switchScene(sceneName: AllScenes<S>, options?: {
    progressCallback?: (progress: number) => void,
    transitionComplete?: Promise<void>,
    customData?:unknown
  }) {
    await this.prepareScene(sceneName);

    if (this.currentScene) {
      await this.currentScene.onLeave();
      this.currentScene.hide();
    }

    const scene = this.getSceneByName(sceneName);

    this.currentScene = scene;

    await scene.show();

    await scene.onEnter(options?.customData);

    if (options?.transitionComplete) {
      await options.transitionComplete;
    }

    await scene.onStart(options?.customData);
  }

  async prepareScene(sceneName: AllScenes<S>, progressCallback?: (progress: number) => void) {
    const scene = this.getSceneByName(sceneName);

    if (scene.preloaded) return;

    scene.init(this);

    scene.preloaded = true;

    await scene.preload(progressCallback);

    await scene.create();
  }

  public getSceneByName(name: AllScenes<S>) {
    const scene = this.scenes.find((scene) => scene.name === name);

    if (!scene) {
      throw new Error(`Scene with name ${name} not found`);
    }

    return scene;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getBootScene(): Scene<any, any> | null {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getInitialScene(): Scene<any, any> | null {
    return null;
  }

  protected async preload() {
  }

  protected async create() {
  }

  protected resize(resizeData: ResizeData) {

    const scale = 1;

    this.pixiApp.renderer.resize(resizeData.canvas.width * scale, resizeData.canvas.height * scale);
  }
}
