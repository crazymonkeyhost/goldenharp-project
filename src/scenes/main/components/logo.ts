import {Assets, Container, Sprite, Texture} from 'pixi.js';
import {Spine} from '@esotericsoftware/spine-pixi-v8';
import {toActionArea} from '@/core/services/resize/resize.service';
import {gameConfig} from '@/config/game-config';
import {rand} from '@/core/util/math';

export class Logo extends Container {
	private readonly animation: Spine;

	private supeGameLogo: Sprite

	constructor() {
		super();

		this.animation = Spine.from({
			atlas: 'logo.atlas',
			skeleton: 'logo.json',
		});
		this.addChild(this.animation);

		this.supeGameLogo = Sprite.from(Texture.EMPTY);
		this.supeGameLogo.anchor.set(0.5);
		this.addChild(this.supeGameLogo);

		toActionArea(this, {x: gameConfig.width / 2, y: 140});

		this.playAllTime();
		this.switchToNormal();
	}

	private playAllTime() {
		this.animation.state.setAnimation(0, 'animation', false);

		setTimeout(this.playAllTime.bind(this), rand(40000, 50000));
	}

	switchToSuperGame() {
		this.animation.visible = false;

		this.supeGameLogo.texture = Assets.get('supergame-logo');

		this.supeGameLogo.visible = true;
	}

	switchToNormal() {
		this.animation.visible = true;

		this.supeGameLogo.visible = false;
	}


}
