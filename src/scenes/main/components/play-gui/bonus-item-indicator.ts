import {Container, Text} from 'pixi.js';
import {Spine} from '@esotericsoftware/spine-pixi-v8';
import {gameStyles} from "@/game-styles";

export class BonusItemIndicator extends Container {
	private readonly animation: Spine;

	private readonly field: Text

	private timer: NodeJS.Timeout;

	constructor(private readonly type: 'bonus' | 'freespin') {
		super();

		this.animation = Spine.from({
			skeleton: 'bonus.json',
			atlas: 'bonus.atlas',
		});
		this.addChild(this.animation);


		this.field = new Text({
			text: '10',
			style: gameStyles.mainSceneFieldValue,
			anchor: {x: 0.5, y: 0.5},
		});
		this.field.position.set(22.5, -25.5);

		this.addChild(this.field);
	}

	setValue(value: number) {
		this.field.text = value.toString();
	}

	public show() {
		this.visible = true;

		this.timer = setInterval(() => {
			this.animation.state.setAnimation(0, 'bonus1', false);
		}, 1000);
	}

	public hide() {
		this.visible = false;

		clearInterval(this.timer);
	}

}
