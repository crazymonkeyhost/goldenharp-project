import { Scene } from '@/core/scene/Scene';
import { wait } from '@/core/util/time';
import { Assets, Container } from 'pixi.js';
import { MaybeError, GoldenHarpGame } from '@/game/golden-harp-game';
import { PlayGui } from './components/play-gui/play-gui';
import { ReelsSpot } from './components/reels-spot';
import { MainSlot } from '@/scenes/main/components/main-slot/main-slot';
import { autoplayService, AutoplayService, StartAutoplayData } from '@/game/services/autoplay-service';
import { keyboardService } from '@/core/services/keyboard-service';
import { settingsService, SettingsService } from '@/game/services/settings-service';
import { SpinResultDO } from '@/data/DO/spin-result-do';
import { slotConfig, SYMBOLS } from '@/config/slot-config';
import { roundNumber } from '@/core/util/math';
import { SuperGameResponse, TCascade, TCombination } from '@/api/response-types';
import { InfoPageLayout } from './components/info/info-page-layout';
import { SettingsPageLayout } from './components/settings/settings-page-layout';
import { BuyBonusModal } from '@/scenes/main/components/buy-bonus/buy-bonus-modal';
import { WinLineValueCounter } from '@/scenes/main/components/win-line-value-counter';
import { Spine } from '@esotericsoftware/spine-pixi-v8';
import { toCanvasCenter } from '@/core/services/resize/resize.service';
import { isSpecialSymbol } from '@/api/utils/slot-logic-utils';
import { Logo } from '@/scenes/main/components/logo';
import { MainWheel } from '@/scenes/main/components/main-wheel/main-wheel';

export class MainScene extends Scene<'main', GoldenHarpGame> {
  private heroContainer = new Container();

  private slotSpinningPromise: Promise<void> | null = null;

  private pendingRoundPromise = Promise.resolve();

  private roundPromiseResolver: () => void;

  private bonusResolver: () => void;

  private skip: () => void = () => {};

  private isTerminated = false;

  private canStartRound = true;

  private isRoundActive = false;

  private isAutoFreeSpin = false;

  private logo: Logo;

  private slot: MainSlot;

  private wheel: MainWheel;

  private playGui: PlayGui;

  private autoplayService: AutoplayService;

  private settingsPopupsContainer = new Container();

  private winLineValueCounter: WinLineValueCounter;

  private settingsService: SettingsService;

  private isFirstRun = true;

  constructor() {
    super('main');

    this.autoplayService = autoplayService;

    this.settingsService = settingsService;
  }

  async preload(cb: (progress: number) => void): Promise<void> {
    await Assets.loadBundle(['main'], (progress) => {
      cb?.(progress);
    });
  }

  async create(): Promise<void> {
    this.game.createMainGamesUI();

    this.logo = new Logo();
    this.stage.addChild(this.logo);

    // reels spot
    const spot = new ReelsSpot();
    this.stage.addChild(spot);

    // save spot for future use
    this.stage.addChild(this.heroContainer);

    this.slot = new MainSlot(
      settingsService,
      slotConfig.reels,
      slotConfig.reelWindow,
      this.game.model.initialCells || slotConfig.defaultInitialCells,
    );
    this.slot.winCellsTopContainer = spot.winCellsTopContainer;
    spot.winLinesContainer.x -= this.slot.getSlotWidth() / 2;
    spot.winLinesContainer.y -= this.slot.getSlotHeight() / 2;
    spot.slotSpot.addChild(this.slot);

    this.winLineValueCounter = new WinLineValueCounter();
    this.stage.addChild(this.winLineValueCounter);

    this.wheel = new MainWheel();
    this.game.background.wheelContainer.addChild(this.wheel);

    const infoPage = new InfoPageLayout(this.game.model);
    this.game.layers.overlay.addChild(infoPage);

    const settingsPage = new SettingsPageLayout(this.game.model, {
      startAutoplay: this.startAutoplay.bind(this),
      betSelected: this.onBetChange.bind(this),
    });
    this.game.layers.overlay.addChild(settingsPage);

    const buyBonusModal = new BuyBonusModal(this.game.model);
    this.game.layers.overlay.addChild(buyBonusModal);

    this.playGui = new PlayGui({
      settingsClick: () => settingsPage.show('settings'),
      openAutoplayMenu: () => settingsPage.show('autoplay'),
      betClick: () => settingsPage.show('bet'),
      spinClick: this.spinClicked.bind(this),
      infoClick: () => infoPage.show(),
      homeClick: () => this.goHome(),
      buyBonusClick: () => {} /*buyBonusModal.show('buy')*/,
      profileClick: () => buyBonusModal.show(),
    });
    this.stage.addChild(this.playGui);

    this.resetState();

    const machine = Spine.from({
      skeleton: 'additional_machine.json',
      atlas: 'additional_machine.atlas',
    });

    this.stage.addChild(machine);
    toCanvasCenter(machine);

    //@ts-ignore
    window.machine = machine;
  }

  async onEnter(): Promise<void> {
    super.onEnter();

    keyboardService.addSpaceListener(this.spinClicked.bind(this));

    this.bonusResolver?.();

    if (this.heroContainer.children.length === 0) {
      this.heroContainer.addChild(this.game.hero);
    }

    if (!this.isFirstRun) return;

    this.game.background.switchToMain();

    this.game.hero.switchToMedusa();

    // reset state
    this.canStartRound = false;

    this.isFirstRun = false;

    this.updateBalance();

    this.setWin(0);

    // check unplayed bonuses
    if (this.game.model.playerData?.supergame && this.game.model.playerData?.supergame?.length > 0) {
      for (const hash of this.game.model.playerData.supergame) {
        if (!hash.supergame_hash) continue;

        const result = await this.playSuperGame(hash.supergame_hash);

        if (!result) return;

        this.setBalance(result.after_balance);
      }
    }

    if (!this.game.model.currentFreeSpinsSession && this.game.model.nextFreeSpinSession()) {
      await this.triggerFreeSpins();
      this.canStartRound = true;

      this.playNextAutoRound();
    } else {
      this.canStartRound = true;
    }
  }

  async onLeave(): Promise<void> {
    super.onLeave();

    keyboardService.removeSpaceListener(this.spinClicked.bind(this));

    this.settingsPopupsContainer.visible = false;
  }

  private isFreeSpinMode = false;

  // reset game play based on init user data
  resetState() {
    this.updateBet();
  }

  onBetChange(value: number) {
    this.game.model.bet = value;
    this.updateBet();
  }

  private updateBet() {
    this.playGui.updateBet(this.game.model.bet, this.game.model.betRange);
  }

  private updateBalance() {
    this.playGui.updateBalance(this.game.model.balance);
  }

  private updateFreeSpins() {
    this.playGui.updateFreeSpins(this.game.model.freeSpins);
  }

  // flow functions
  setBalance(value: number) {
    this.game.model.balance = value;
    this.updateBalance();
  }

  setWin(value: number, withCounter = false) {
    value = roundNumber(value);

    console.log('set win', value, withCounter);
    const successResponse = this.game.model.currentResponse;

    // control if we not send total win bigger than server response
    if (successResponse) {
      const threshold = this.isFreeSpinMode ? successResponse?.freespin_total_win : successResponse?.total_win;

      if (threshold !== undefined && value > threshold) {
        throw new Error(`Total win is bigger than server response. Total win: ${value}, threshold: ${threshold}`);
      }
    }

    this.game.model.win = value;
    this.playGui.updateWin(value, withCounter);
  }

  setFreeSpins(value: number) {
    this.game.model.freeSpins = value;
    this.updateFreeSpins();
  }

  startAutoplay(data: StartAutoplayData) {
    this.autoplayService.start(data);

    if (!this.isRoundActive) {
      this.startRound();
    } else {
      this.skip();
    }
  }

  async spinClicked(_type: 'autoplay' | 'manual' = 'manual') {
    if (this.autoplayService.isActive() || this.isAutoFreeSpin || !this.canStartRound) {
      this.isAutoFreeSpin = false;
      this.skip();
      return;
    }

    if (this.canStartRound) {
      this.startRound();
    }
  }

  async startRound() {
    if (this.isTerminated) return;

    this.canStartRound = false;

    // if round is pending, skip
    this.skip();

    await this.pendingRoundPromise;

    if (this.isRoundActive) {
      throw new Error('Round already active');
    }

    // reset state from previous round
    this.winLineValueCounter.hide();

    // reset keys and chest if we had respin in prev round

    this.isRoundActive = true;

    this.pendingRoundPromise = new Promise((resolve) => (this.roundPromiseResolver = resolve));

    const isFirstFreeSpin = !this.isFreeSpinMode && this.game.model.freeSpins > 0;

    const balanceBeforeSpin = this.game.model.balance;

    if (isFirstFreeSpin) {
      this.isFreeSpinMode = true;
    }

    // not reset win if free spin mode
    if (!this.isFreeSpinMode || isFirstFreeSpin) {
      this.setWin(0, false);
    }

    // deduct bet from balance right away (adjusting balance then by server response)
    // only if not in free spin mode
    if (!this.isFreeSpinMode) {
      if (this.game.model.balance < this.game.model.bet) {
        if (await this.game.handleInsufficientBalance()) {
          this.canStartRound = true;
          this.isRoundActive = false;
          if (this.autoplayService.isActive()) {
            this.autoplayService.stop();
          }
          this.roundPromiseResolver();
          return;
        } else {
          this.disable();
          this.skip();
          return;
        }
      }

      this.setBalance(this.game.model.balance - this.game.model.bet);
    }

    // decrease free spins if in free spin mode
    // later in playRoundResults() method will be updated from server response to actual value
    if (this.isFreeSpinMode) {
      this.setFreeSpins(this.game.model.freeSpins - 1);
    }

    const dissapearPromise = this.slot.disappear();

    const { done: minSpinTimePromise, cancel: skipSpin } = wait(0);

    this.skip = skipSpin;

    const serverPromise = this.game.getSpinData(this.isFreeSpinMode, balanceBeforeSpin);

    Promise.all([serverPromise, dissapearPromise])
      .then(([response]) => {
        this.onBetResponse(response);
      })
      .catch((e) => {
        dissapearPromise.then(() => {
          this.onError(e, balanceBeforeSpin);
        });
      });
  }

  async onError(e: MaybeError, balanceBeforeSpin: number) {
    console.error(e);
    this.disable();
    this.skip?.();

    this.slot.stop(this.game.model.betResponse?.spin?.spin_elements || slotConfig.defaultInitialCells);

    this.setBalance(balanceBeforeSpin);

    if (this.autoplayService.isActive()) {
      this.autoplayService.stop();
    }

    if (this.isFreeSpinMode) {
      this.isAutoFreeSpin = false;

      // restore free spins
      this.setFreeSpins(
        this.game.model.currentResponse?.freespin_left || this.game.model.currentFreeSpinsSession?.freespin_left || 0,
      );
    }

    const canContinue = await this.game.handleServerError(e);

    if (!canContinue) return;

    this.enable();

    this.roundPromiseResolver?.();

    this.isRoundActive = false;

    this.canStartRound = true;
  }

  disable() {
    this.playGui.disableButtons();
  }

  enable() {
    this.playGui.enableButtons();
  }

  private async onBetResponse(response: SpinResultDO) {
    if (response.freespin.freespin === 1) {
      this.game.model.freeSpinsBank.unshift({
        freespin_total: response.freespin.freespin_total,
        freespin_hash: response.freespin.freespin_hash,
        freespin_left: response.freespin.freespin_total,
        bet_level: response.freespin.free_spin_bet_level,
        freespin_trigger: response.freespin.freespin_trigger,
      });
    }

    console.clear();
    console.log('FIRST DRAW');
    console.table(response.spin.spin_elements);

    response.cascades.forEach((cascade, i) => {
      console.log(`CASCADE #${i + 1}`);

      console.table(cascade.win_elements);

      // console.log('CASCADING COMBOS');
      // cascade.combinations.forEach((combo, i) => {
      //   console.log(`COMBO#${i + 1}`, JSON.stringify(combo));
      // });

      console.table(cascade.spin_elements);
    });

    this.setBalance(response.before_balance);

    await Promise.all([
      this.slot.stop(response.spin.spin_elements),
      this.wheel.spin(response.wheelSymbol),
      await this.slotSpinningPromise,
    ]);

    this.playRoundResults();
  }

  private async playRoundResults() {
    const response = this.game.model.currentResponse;

    const isFreeSpinMode = this.isFreeSpinMode;

    // re-update free spins if we are in free spin mode
    // actually this value is already updated in .startRound() method, so here just
    // to update from server response
    if (isFreeSpinMode) {
      this.setFreeSpins(response.freespin_left);
    }

    // const winBefore = this.game.model.win;

    await this.playCascades(response.cascades);

    // const linesAndCounterCompleted = linesCompleted.then(() => {
    //   if (response.spin.spin_win > 0) {
    //     return this.winLineValueCounter.countWin(response.spin.spin_win).then(() => wait(500).done);
    //   }
    // });

    // await linesCompleted;

    // handle jackpot
    if (this.game.model.hasJackpotWon) {
      this.winLineValueCounter.hide();

      await this.game.winPopup.playSummaryWin('jackpot', this.game.model.jackpotAmount);
    }

    // trigger super game
    if (this.game.model.hasSuperGame) {
      this.winLineValueCounter.hide();

      await this.slot.playCellsWin(response.cronusSymbols).done;

      const res = await this.playSuperGame(response.supergame.supergame_hash || '');

      if (!res) return;
    }

    const isLastFreeSpin = isFreeSpinMode && response.freespin_left === 0;

    await this.playGrandWin();

    // need to update win before free spins completion
    this.setWin(isFreeSpinMode ? response.freespin_total_win : response.total_win);

    // handle free spins completion
    if (isLastFreeSpin) {
      this.winLineValueCounter.hide();

      await this.completeFreeSpins();
    }

    // update balance after all animations
    this.setBalance(this.game.model.lastServerBalance);

    if (!this.isFreeSpinMode && this.game.model.nextFreeSpinSession()) {
      this.winLineValueCounter.hide();

      await this.triggerFreeSpins();
    }

    this.canStartRound = true;

    this.roundCompleted();
  }

  async roundCompleted() {
    this.isRoundActive = false;
    this.roundPromiseResolver();

    this.playNextAutoRound();
  }

  // play next auto round if it is available
  playNextAutoRound() {
    const response = this.game.model.currentResponse;

    const canContinueAP = this.autoplayService.next(
      response
        ? {
            totalWin: response.total_win,
            totalBet: response.bet,
          }
        : null,
    );

    const canContinueFS = this.game.model.freeSpins > 0 && this.isAutoFreeSpin;

    if (canContinueAP || canContinueFS) {
      this.startRound();
    }
  }

  private async playSuperGame(hash: string): Promise<SuperGameResponse | null> {
    let bonusData: SuperGameResponse | null = null;

    try {
      bonusData = await this.game.getSuperGameData(hash || '');
    } catch (e) {
      this.disable();
      await this.game.handleServerError(e);
    }

    if (!bonusData) return null;

    const promise = new Promise<void>((r) => (this.bonusResolver = r));

    await this.game.winPopup.playSuperGameEnter('cronus_game', false);

    await this.game.fadeTransition.fadeIn();

    // hide win popup under fade in transition state
    this.game.winPopup.hide();

    await Assets.loadBundle(['supergame']);

    const transition = this.game.fadeTransition.fadeOut();

    this.game.switchScene('supergame', { transitionComplete: transition, customData: bonusData });

    await promise;

    this.switchToSuperGameHero(bonusData.freespin_trigger);
    this.game.background.switchToActualSuperGame(bonusData.freespin_trigger);
    this.logo.switchToSuperGame();

    if (bonusData.freespins_win && bonusData.freespins_win > 0) {
      this.game.model.freeSpinsBank.push({
        freespin_total: bonusData.freespins_win,
        freespin_left: bonusData.freespins_win,
        bet_level: bonusData.freespins_bet_level,
        freespin_hash: bonusData.freespins_hash,
        freespin_trigger: bonusData.freespin_trigger,
      });
    }

    return bonusData;
  }

  private async triggerFreeSpins() {
    // this.winLineValueCounter.hide();
    const session = this.game.model.currentFreeSpinsSession;

    if (!session) return;

    const total = Math.min(session?.freespin_total || 0, session?.freespin_left || 0);

    if (session?.freespin_trigger === 'normal') {
      await this.game.winPopup.playFreespinEnter();

      await this.game.fadeTransition.fadeIn();

      this.game.background.switchToFreespin();
    }

    this.playGui.showFreeSpinsField();
    this.setFreeSpins(total);
    this.game.winPopup.hide();

    await this.game.fadeTransition.fadeOut();

    this.isAutoFreeSpin = true;
  }

  private async completeFreeSpins() {
    const session = this.game.model.currentFreeSpinsSession;

    if (!session) throw new Error('No free spins session');

    if (session.freespin_trigger === 'normal') {
      await this.game.winPopup.playFreeSpinWin(this.game.model.currentResponse.freespin_total_win);
    } else {
      await this.game.winPopup.playSuperGameWin(
        `${session.freespin_trigger}_win`,
        this.game.model.currentResponse.freespin_total_win,
      );
    }

    await this.game.fadeTransition.fadeIn();

    this.game.background.switchToMain();
    this.logo.switchToNormal();
    this.game.hero.switchToMedusa();
    this.playGui.hideFreeSpinsField();
    this.game.winPopup.hide();

    await this.game.fadeTransition.fadeOut();

    this.game.model.clearFreeSpinsSession();
    this.isFreeSpinMode = false;
    this.isAutoFreeSpin = false;
  }

  private async playCascades(cascades: TCascade[]) {
    // cascades = cascades.slice(0,1);
    for (let i = 0; i < cascades.length; i++) {
      const cascade = cascades[i];

      // play cascade combos win
      await this.playCascade(cascade);

      const wildCombos = cascade.combinations.filter((combo) => combo.type === 'wild-torch' ||  combo.type === 'wild-thunder');

      // play normal cells explode
      const normalExplode = cascade.combinations
        .filter((combo) => !wildCombos.includes(combo))
        .map((combo) => combo.items.map((item) => item.location))
        .flat();

      await this.slot.explode(normalExplode).done;

      // play wild torch combos explode
      await this.slot.effectsManager.crystalExplode(
        wildCombos.map((combo) => combo.items.map((item) => item.location)).flat(),
      );

      await wait(200).done;

      console.table(cascade.win_elements);

      // do shift

      console.table(cascade.spin_elements);
      await this.slot.playShift(
        cascade.combinations.map((combo) => combo.items.map((item) => item.location)).flat(),
        cascade.spin_elements,
      );
    }

    this.wheel.stopGlow();
  }

  private async playCascade(cascade: TCascade) {
    // handle replacement first
    for (const replacement of cascade.replacements) {
      await this.slot.effectsManager.commetReplace(replacement.items);
    }

    const normalCombinations = cascade.combinations.filter((combo) => combo.type === 'normal');

    // usual symbols normal symbols combos play first
    const normalCombos = normalCombinations.filter((combo) => !isSpecialSymbol(combo.symbol));
    for (const combo of normalCombos) {
      await this.playCombo(combo);
    }

    // zeus combos
    const zeusCombos = normalCombinations.filter((combo) => combo.symbol === SYMBOLS.ZEUS);

    const zeusExploded = zeusCombos.length ? cascade.combinations.filter((combo) => combo.type === 'zeus') : [];

    for (const combo of zeusCombos) {
      await this.playCombo(combo);

      zeusCombos.pop();

      await this.slot.effectsManager.playLightning(zeusExploded.pop()?.items?.map((item) => item.location) ?? []);
    }
  }

  private async playCombo(combo: TCombination) {
    if (combo.win) {
      this.setWin(this.game.model.win + combo.win, true);
    }

    if (combo.wildFeatured) {
      this.wheel.glow(true);
    }

    if (this.settingsService.getWinAnimation()) {
      await this.slot.playCellsWin(
        combo.items.map((item) => item.location),
        'normal',
      ).done;
    }
  }

  private async playGrandWin() {
    const response = this.game.model.currentResponse;

    if (response.bigwin || response.megawin || response.ultrawin) {
      this.winLineValueCounter.hide();
    }

    if (response.ultrawin) {
      await this.game.winPopup.playSummaryWin('ultra_win', response.total_win);
    } else if (response.megawin) {
      await this.game.winPopup.playSummaryWin('mega_win', response.total_win);
    } else if (response.bigwin) {
      await this.game.winPopup.playSummaryWin('big_win', response.total_win);
    }
  }

  private switchToSuperGameHero(superGameType: 'zeus' | 'hades' | 'poseidon') {
    switch (superGameType) {
      case 'zeus':
        this.game.hero.switchToZeus();
        break;
      case 'hades':
        this.game.hero.switchToHades();
        break;
      case 'poseidon':
        this.game.hero.switchToPoseidon();
        break;
    }
  }

  private goHome() {
    this.isTerminated = true;

    if (this.autoplayService.isActive()) {
      this.autoplayService.stop();
    }

    this.disable();

    this.game.platformMessaging.goHome();
  }
}
