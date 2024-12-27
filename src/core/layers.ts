import { Container } from 'pixi.js';

export class Layers {
  private _root: Container;

  readonly background = new Container();

  readonly scenes = new Container();

  readonly overlay = new Container();

  readonly winPopup = new Container();

  readonly transitions = new Container();

  readonly modals = new Container();

  readonly rotation = new Container();

  init(root: Container, scenesStages: Container[]) {
    this._root = root;

    this.root.addChild(this.background);

    this.scenes.label = 'SCENES';
    this.root.addChild(this.scenes);

    scenesStages.forEach((sceneStage) => {
      this.scenes.addChild(sceneStage);
    });

    this.root.addChild(this.overlay);

    this.root.addChild(this.winPopup);

    this.root.addChild(this.transitions);

    this.root.addChild(this.modals);

    this.root.addChild(this.rotation);
  }

  get root() {
    return this._root;
  }

  onWrongRotation() {
    this.background.visible = false;
    this.scenes.visible = false;
    this.overlay.visible = false;
    this.transitions.visible = false;
    this.winPopup.visible = false;
    this.modals.visible = false;

    this.rotation.visible = true;
  }

  onRightRotation() {
    this.background.visible = true;
    this.scenes.visible = true;
    this.overlay.visible = true;
    this.transitions.visible = true;
    this.modals.visible = true;
    this.winPopup.visible = true;

    this.rotation.visible = false;
  }
}
