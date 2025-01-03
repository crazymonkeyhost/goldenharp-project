import {Container, Sprite, Text} from 'pixi.js';
import {toActionArea} from '@/core/services/resize/resize.service';
import {SpriteButton} from '@/core/ui/sprite-button';
import {gameStyles} from '@/game-styles';
import {Counter} from '@/core/components/counter';
import {currencyFormatter} from '@/core/services/currency-formatter';
import {getButtonStatesTextures} from '@/core/util/textures';
import {PlayGuiField} from '@/scenes/main/components/play-gui/play-gui-field';
import {BetButton} from '@/scenes/main/components/play-gui/bet-button';
import {SpeedButton} from '@/scenes/main/components/play-gui/speed-button';
import {AutoplayButton} from '@/scenes/main/components/play-gui/autoplay-button';
import {gameConfig} from '@/config/game-config';
import {BonusItemIndicator} from '@/scenes/main/components/play-gui/bonus-item-indicator';
import {Spine} from "@esotericsoftware/spine-pixi-v8";
import {getRandElement, rand} from "@/core/util/math";
import { ActiveBonusItemIndicator } from '@/scenes/main/components/play-gui/active-bonus-item-indicator';

interface MainScreenGuiProps {
	openAutoplayMenu: () => void;
	betClick: () => void;
	spinClick: () => void;
	settingsClick: () => void;
	infoClick: () => void;
	buyBonusClick: () => void;
	homeClick: () => void;
}

export class PlayGui extends Container {
	private winCounter: Counter;

	private readonly freeSpinsField: BonusItemIndicator;

	private readonly activeBonusItem: BonusItemIndicator;

	private readonly balanceField: PlayGuiField;

	private readonly winValueField: PlayGuiField;

	private readonly buttons: Array<SpriteButton | Spine> = [];

	private readonly betButton: BetButton;

	constructor(options: MainScreenGuiProps) {
		super();

		const bottomRowY = gameConfig.height - 120;

		// balance field
		this.balanceField = new PlayGuiField('BALANCE');
		this.addChild(this.balanceField);
		toActionArea(this.balanceField, {x: 1160, y: bottomRowY});

		// win field
		this.winValueField = new PlayGuiField('WIN');
		toActionArea(this.winValueField, {x: 1330, y: bottomRowY});
		this.addChild(this.winValueField);

		// free spins field
		this.freeSpinsField = new BonusItemIndicator('freespin');
		toActionArea(this.freeSpinsField, {x: 505, y: 545});
		this.addChild(this.freeSpinsField);
		this.hideFreeSpinsField();

		this.activeBonusItem = new ActiveBonusItemIndicator();
		toActionArea(this.activeBonusItem, {x: 505, y: 400});
		this.addChild(this.activeBonusItem);
		// this.activeBonusItem.show();



		const buyBonusButton = this.createBuyBonusButton(options.buyBonusClick);

		toActionArea(buyBonusButton, {x: 470, y: bottomRowY});
		this.buttons.push(buyBonusButton);
		this.addChild(buyBonusButton);

		// small button group
		const smallButtonGroup = new Container();
		const smallButtonGroupBg = Sprite.from('text-value-spot');
		smallButtonGroupBg.position.set(0, 0);
		smallButtonGroupBg.anchor.set(0, 0.5);
		smallButtonGroupBg.scale.set(1.7, 1.1);
		smallButtonGroup.addChild(smallButtonGroupBg);
		this.addChild(smallButtonGroup);
		toActionArea(smallButtonGroup, {x: 560, y: bottomRowY});

		const smallButtonStartX = 40;
		const smallButtonElementWidth = 52;
		// sound button
		const soundButton = this.createSoundButton();
		soundButton.view.position.set(smallButtonStartX + smallButtonElementWidth * 0, 0);
		smallButtonGroup.addChild(soundButton.view);

		// info button
		const infoButton = new SpriteButton({
			textures: getButtonStatesTextures('info-button'),
			action: options.infoClick,
		});
		infoButton.view.position.set(smallButtonStartX + smallButtonElementWidth * 1, 0);
		this.buttons.push(infoButton);
		smallButtonGroup.addChild(infoButton.view);

		// clock
		const clock = this.createClock();
		clock.position.set(smallButtonStartX + smallButtonElementWidth * 2 + 4, 0);
		smallButtonGroup.addChild(clock);

		// settings button
		const settingsButton = new SpriteButton({
			textures: getButtonStatesTextures('settings-button'),
			action: options.settingsClick,
		});
		settingsButton.view.position.set(smallButtonStartX + smallButtonElementWidth * 3, 0);
		this.buttons.push(settingsButton);
		smallButtonGroup.addChild(settingsButton.view);

		// home button
		const homeButton = new SpriteButton({
			textures: getButtonStatesTextures('home-button'),
			action: options.homeClick,
		});
		homeButton.view.position.set(smallButtonStartX + smallButtonElementWidth * 4, 0);
		this.buttons.push(homeButton);
		smallButtonGroup.addChild(homeButton.view);

		// BET BUTTON GROUP

		const betButtonGroup = new Container();
		toActionArea(betButtonGroup, {x: gameConfig.width / 2, y: bottomRowY});
		this.addChild(betButtonGroup);

		// spot
		const spinButtonSpot = Sprite.from('spin-button-spot');
		spinButtonSpot.anchor.set(0.5);
		betButtonGroup.addChild(spinButtonSpot);

		// bet button
		this.betButton = new BetButton(options.betClick);
		this.betButton.view.position.set(0, 75);
		this.buttons.push(this.betButton);
		betButtonGroup.addChild(this.betButton.view);

		// speed button
		const speedButton = new SpeedButton();
		speedButton.view.position.set(-85, 0);
		this.buttons.push(speedButton);
		betButtonGroup.addChild(speedButton.view);

		// autoplay button
		const autoplayButton = new AutoplayButton(options.openAutoplayMenu);
		autoplayButton.view.position.set(85, 0);
		this.buttons.push(autoplayButton);
		betButtonGroup.addChild(autoplayButton.view);

		// spin button
		const spinButton = new SpriteButton({
			textures: getButtonStatesTextures('spin-button'),
			action: options.spinClick,
		});
		this.buttons.push(spinButton);
		betButtonGroup.addChild(spinButton.view);

		// decoration leaves
		const leaves1 = Sprite.from('leaves1');
		leaves1.anchor.set(0, 0.5);
		toActionArea(leaves1, {x: 1375, y: bottomRowY});
		this.addChild(leaves1);

		const leaves2 = Sprite.from('leaves2');
		leaves2.anchor.set(0, 0.5);
		toActionArea(leaves2, {x: 357, y: bottomRowY});
		this.addChild(leaves2);

		this.winCounter = new Counter({
			duration: 300,
			callback: (value: number) => {
				this.winValueField.setValue(currencyFormatter.format(value));
			},
		});
	}

	public hideFreeSpinsField() {
		this.freeSpinsField.hide()
	}

	public showFreeSpinsField() {
		this.freeSpinsField.show();
	}

	public updateFreeSpins(value: number) {
		this.freeSpinsField.setValue(value);
	}

	public updateBet(value: number, betRange: number[]) {
		const index = Math.max(betRange.indexOf(value), 0);

		const percentage = ((index + 1) / betRange.length) * 100;

		this.betButton.setValue(value, percentage);
	}

	public updateBalance(value: number) {
		this.balanceField.setValue(currencyFormatter.format(value));
	}

	async updateWin(value: number, withCounter = false) {
		if (withCounter) {
			await this.winCounter.playTo(value);
		} else {
			this.winCounter.setValue(value);
		}
	}

	public enableButtons() {
		this.buttons.forEach((button) => {
			if (button instanceof SpriteButton) {
				button.enabled = true;
			} else {
				button.interactive = true;
			}


		});
	}

	public disableButtons() {
		this.buttons.forEach((button) => {
			if (button instanceof SpriteButton) {
				button.enabled = false;
			} else {
				button.interactive = false;
			}
		});
	}

	private createClock() {
		const clocksField = new Text({text: '', style: gameStyles.clocks, anchor: {x: 0.5, y: 0.5}});

		function setTime() {
			clocksField.text = new Date().toLocaleTimeString(undefined, {
				timeStyle: 'short',
				hourCycle: 'h24',
			});
		}

		setTime();

		setInterval(() => {
			setTime();
		}, 1000);

		return clocksField;
	}

	private createSoundButton() {
		return new SpriteButton({
			textures: getButtonStatesTextures('sound-button'),
		});
	}


	private createBuyBonusButton(openBonus: () => void) {
		const button = Spine.from({
			skeleton: 'buy_bonus2.json',
			atlas: 'buy_bonus2.atlas',
		});

		button.interactive = true;

		button.cursor = 'pointer'

		button.on('pointerdown', openBonus)

		button.state.setAnimation(0, 'buy_bonus1', true);

		function playAllTime() {
			setTimeout(()=>{
				button.state.setAnimation(1, getRandElement([/*'buy_bonus1',*/ 'buy_bonus2']), false);

				playAllTime()
			}, rand(50000, 60000));
		}

		playAllTime();

		return button;
	}
}
