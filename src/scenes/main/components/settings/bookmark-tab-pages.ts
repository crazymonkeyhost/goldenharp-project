import { Container, Sprite, Text } from 'pixi.js';
import { Bookmark } from '@/game/components/shared/bookmark';
import { generateTexture } from '@/core/util/render';
import { gameConfig } from '@/config/game-config';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { onResize } from '@/core/services/resize/resize.service';
import { GameModel } from '@/data/game-model';

// Shared bookmark pages used in settings/info/account pages
export class BookmarkTabPages extends Container {
  protected backgroundContainer = new Container();

  protected background: Sprite;

  protected bookmarks: Bookmark[] = [];

  protected pageItems: TapPageItem[] = [];

  protected currentIndex: number;

  private activeBookmark: Bookmark | null = null;

  private switchTimeLine: gsap.core.Timeline | null = null;

  private currentSwitchPromise: Promise<unknown> = Promise.resolve();

  private readonly underlay: Sprite;

  private bgHeight = 970;

  protected root = new Container();

  protected content = new Container();

  protected closeButton: SpriteButton;

  private openResolver: () => void;

  constructor(protected readonly model: GameModel) {
    super();

    // semi girl-black underlay
    this.underlay = new Sprite(generateTexture('#000000', 0.8, 1, 1));
    this.underlay.x = gameConfig.width / 2;
    this.underlay.y = gameConfig.height / 2;
    this.underlay.anchor.set(0.5);
    this.addChild(this.underlay);
    // this.underlay.on('pointerdown', () => this.hide());

    this.addChild(this.root);

    this.root.addChild(this.backgroundContainer);

    // bg image
    this.background = Sprite.from('settings-bg');
    this.background.anchor.set(0.5, 0);
    this.backgroundContainer.addChild(this.background);

    // close button
    this.closeButton = new SpriteButton({
      textures: getButtonStatesTextures('button-close'),
      action: () => this.hide(),
    });
    this.closeButton.view.x = 720;
    this.closeButton.view.y = 130;
    this.root.addChild(this.closeButton.view);

    this.root.interactive = false;

    this.hide();

    onResize(this.resize.bind(this));

    this.createTabPages();

    this.createBookmarks();

    this.switchPage(0);
  }

  public show(_tab?: unknown): Promise<void> {
    return new Promise<void>((resolve) => {
      this.underlay.interactive = true;
      this.closeButton.enabled = true;

      this.openResolver = resolve;
      this.visible = true;
    });
  }

  public hide(): void {
    this.underlay.interactive = false;
    this.closeButton.enabled = false;

    this.openResolver?.();
    this.visible = false;
  }

  protected createTabPages() {
    // override
  }

  protected createBookmarks() {
    // override
  }

  protected createBookmark(index: number) {
    const bookmark = new Bookmark();

    bookmark.onClicked.add(() => {
      this.switchPage(index);
    });

    return bookmark;
  }

  protected async switchPage(index: number) {
    if (this.currentIndex === index) return;

    if (this.switchTimeLine) this.switchTimeLine.progress(1);

    await this.currentSwitchPromise;

    const page = this.pageItems[index];
    page.title.visible = true;
    page.content.visible = true;

    const prevPage = this.pageItems[this.currentIndex];

    this.activateBookmark(index);

    if (prevPage) {
      prevPage.title.visible = false;
      prevPage.content.visible = false;
    }

    this.currentIndex = index;
  }

  private activateBookmark(index: number) {
    if (this.bookmarks.length === 0) return;

    if (this.activeBookmark) {
      this.activeBookmark.deactivate();
    }

    this.activeBookmark = this.bookmarks[index];

    this.activeBookmark.activate();
  }

  private resize(resizeData: ResizeData): void {
    this.x = resizeData.actionArea.x;
    this.y = resizeData.actionArea.y;

    this.underlay.width = resizeData.canvas.width;
    this.underlay.height = resizeData.canvas.height;

    this.root.x = resizeData.actionArea.width / 2;
    this.root.y = resizeData.actionArea.height / 2 - this.bgHeight / 2;
  }
}

export interface TapPageItem {
  title: Text | Sprite;

  content: Container;
}
