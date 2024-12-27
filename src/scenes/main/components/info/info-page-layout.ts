import { Container, Sprite, Text } from 'pixi.js';
import { BookmarkTabPages, TapPageItem } from '@/scenes/main/components/settings/bookmark-tab-pages';
import { PaytablePage } from '@/scenes/main/components/info/paytable-page';
import { gameStyles } from '@/game-styles';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';
import { GameModel } from '@/data/game-model';

export class InfoPageLayout extends BookmarkTabPages {

  constructor(protected readonly model: GameModel) {
    super(model);

    this.createArrow(true);
    this.createArrow(false);
  }

  private get paytablePage() {
    return this.pageItems[0] as PaytablePage;
  }

  protected createTabPages() {
    this.pageItems.push(new PaytablePage(this.model.paytable));
    this.pageItems.push(this.createSimplePage('content-zeus', 0, 60));
    this.pageItems.push(this.createSimplePage('content-fs', 0, 100));
    this.pageItems.push(this.createSimplePage('content-buy-bonus', 0, 100));
    this.pageItems.push(this.createSimplePage('content-wild', -65, 100));

    this.pageItems.forEach((pageItem) => {
      pageItem.title.x = -30;
      pageItem.title.y = 95;
      pageItem.title.anchor.set(0.5);
      this.root.addChild(pageItem.title);

      pageItem.content.y = 150;
      this.root.addChild(pageItem.content);

      pageItem.title.visible = false;
      pageItem.content.visible = false;
    });
  }

  show(tab?: unknown): Promise<void> {
    this.paytablePage.update(this.model.bet);

    return super.show(tab);
  }

  protected createBookmarks() {
    const bookmarksContainer = this.root.addChild(new Container());

    bookmarksContainer.position.set(0, 923);

    for (let i = 0; i < 5; i++) {
      const bookmark = this.createBookmark(i);

      bookmarksContainer.addChild(bookmark);


      bookmark.position.set((i - 2) * 120, 0);

      this.bookmarks.push(bookmark);
    }
  }

  createArrow(isLeft = false) {
    const arrowButton = new SpriteButton({
      textures:getButtonStatesTextures(isLeft? 'arrow-left' : 'arrow-right'),
      action: () => {
        const currentIndex = this.currentIndex;
        let newIndex = isLeft ? currentIndex - 1 : currentIndex + 1;

        if (newIndex === -1){
          newIndex = 4;
        }

        if (newIndex === 5){
          newIndex = 0;
        }

        this.switchPage(newIndex);
      }
    });

    arrowButton.view.position.set(isLeft ? -780 : 720, 923);

    this.root.addChild(arrowButton.view);

  }

  createSimplePage(contentTexture: string, xPad = 0, yPad = 0): TapPageItem {
    const title = new Text({ text: 'PAY TABLE', style: gameStyles.settingsTitle });
    title.anchor.set(0.5);

    const content = new Container();
    const contentImg = Sprite.from(contentTexture);
    contentImg.anchor.set(0.5, 0);
    contentImg.x = xPad;
    contentImg.y = yPad;
    content.addChild(contentImg);

    return {
      title,
      content,
    };
  }
}
