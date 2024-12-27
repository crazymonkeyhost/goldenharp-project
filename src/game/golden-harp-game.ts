import { Game } from '@/core/game';
import { Assets } from 'pixi.js';
import { BootScene } from '@/scenes/boot/boot-scene';
import { SplashScene } from '@/scenes/splash/splash-scene';
import { MainScene } from '@/scenes/main/main-scene';
import { SuperGameScene } from '@/scenes/super-game/super-game-scene';
import { GameModel } from '@/data/game-model';
import { RotationAnimation } from '@/game/components/rotation-animation';
import { FadeTransition } from '@/game/components/shared/fade-transition';
import { Api } from '@/api/api';
import { PaytableDO } from '@/data/DO/paytable-do';
import { Popup } from '@/game/components/popup/popup';
import { LocalServerApi } from '@/api/local-api/local-server-api';
import { PlatformMessagingService } from '@/game/services/platform-messaging-service';
import { ApiError } from '@/api/response-types';
import { Background } from '@/game/components/shared/background';
import { WinPopup } from '@/game/components/shared/win-popup';
import { Hero } from '@/game/components/shared/hero';
import { gsap } from 'gsap';
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(MotionPathPlugin);

export class GoldenHarpGame extends Game<[BootScene, SplashScene, MainScene, SuperGameScene]> {
  public model = new GameModel();

  public api: Api | LocalServerApi;

  public fadeTransition: FadeTransition;

  public background: Background;

  public winPopup: WinPopup;

  public hero: Hero;

  protected rotationAnimation: RotationAnimation;

  private offLineMode: boolean = true;// hasSearchParam('offline');

  public platformMessaging: PlatformMessagingService;

  public popup: Popup;

  constructor() {
    super([new BootScene(), new SplashScene(), new MainScene(), new SuperGameScene()]);

    this.platformMessaging = new PlatformMessagingService({
      homeLink: this.model.initData.homeLink || '',
      depositLink: this.model.initData.depositLink || '',
    });

    this.api = this.offLineMode ? new LocalServerApi(this.model) : new Api(this.model);
  }


  protected async create(): Promise<void> {
    super.create();

    this.rotationAnimation = new RotationAnimation();
    this.layers.rotation.addChild(this.rotationAnimation);


    this.fadeTransition = new FadeTransition();
    this.layers.transitions.addChild(this.fadeTransition);

    this.popup = new Popup();
    this.layers.modals.addChild(this.popup);

  }

  protected async connectToServer(): Promise<boolean> {
    try {
      this.model.init(await this.api.getPlayerData());

      const paytableResponse = await this.api.getPaytableData();

      this.model.paytable = new PaytableDO(paytableResponse).toPaytable();
    } catch (e) {
      console.error(e);

      await this.handleServerError(e)

      return false;
    }

    return true;
  }

  public async getSpinData(isFreeSpin:boolean, balance:number){
    const result =  isFreeSpin ? await this.api.getFreeSpinData() : await this.api.getSpinData(balance);

    if (result.custom_message && result.custom_message !=='') {
      throw result;
    }

    this.model.superGameResponse = null;

    this.model.arabianNightResponse = null;

    this.model.betResponse = result;

    this.model.lastServerBalance = result.after_balance;

    return result;
  }

  public async getArabianNightBonusData(hash: string){
    const result =  await this.api.getArabianNightBonusData(hash);

    if (result.custom_message && result.custom_message !=='') {
      throw result;
    }

    this.model.arabianNightResponse = result;

    this.model.lastServerBalance = result.after_balance;

    return result;
  }

   public async getSuperGameData(hash: string){
    const result =  await this.api.getSuperGameData(hash);

    if (result.custom_message && result.custom_message !=='') {
      throw result;
    }

    this.model.superGameResponse = result;

    this.model.lastServerBalance = result.after_balance;

    return result;
  }

  public async handleServerError(error:{custom_message:string}|ApiError|ApiError){
    // custom message anyway should return false and not let game to continue
    if ('custom_message' in error) {
      if (error.custom_message !== '-1'){
        await this.popup.show(error.custom_message, true);
        this.platformMessaging.goHome();
      }

      console.log('Game has been stopped due to custom message:', error.custom_message);

      return false
    }

    const popupRes = await this.popup.show('sessionExpired');

    if (popupRes === 'action') {
      this.platformMessaging.goHome();
      return false;
    }

    return true;
  }

  async handleInsufficientBalance(): Promise<boolean> {
    const popupRes = await this.popup.show('insuficientFunds');

    if (popupRes === 'action') {
      this.platformMessaging.deposit();
      return false;
    }

    return true;
  }


  protected async preload(): Promise<void> {
    super.preload();

    await Assets.loadBundle(['default']);
  }

  getBootScene() {
    return this.getSceneByName('boot');
  }

  getInitialScene() {
    return this.getSceneByName('splash');
  }

  protected resize(resizeData: ResizeData) {
    super.resize(resizeData);
    const orientation = resizeData.orientation;

    if (orientation === 'landscape') {
      this.layers.onRightRotation();
    } else {
      this.layers.onWrongRotation();
    }
  }

  // create shared UI for all gaming scenes
  public createMainGamesUI(){
    this.background = new Background();
    this.layers.background.addChild(this.background);

    this.winPopup = new WinPopup();
    this.layers.winPopup.addChild(this.winPopup);

    this.hero = new Hero();
  }
}


export type MaybeError = { custom_message: string } | ApiError | ApiError;
