import { BookmarkTabPages } from '@/scenes/main/components/settings/bookmark-tab-pages';
import { Container, Sprite, Text } from 'pixi.js';
import { BonusesList } from '@/scenes/main/components/buy-bonus/bonuses-list';
import { Bonus, bonusStore } from '@/data/bonus-store';
import { GameModel } from '@/data/game-model';
import { BuyBonusConfirmPopup } from '@/scenes/main/components/buy-bonus/buy-bonus-confirm-popup';
import { gameStyles } from '@/game-styles';
import { BuyBonusBookmark } from '@/scenes/main/components/buy-bonus/buy-bonus-bookmark';

export class BuyBonusModal extends BookmarkTabPages {
  private readonly buyBonusConfirmPopup: BuyBonusConfirmPopup;

  constructor(model: GameModel) {
    super(model);
    //
    // const activeBonusesList = new ActiveBonusesList();
    // activeBonusesList.y = 700;
    // this.root.addChild(activeBonusesList);

    this.buyBonusConfirmPopup = new BuyBonusConfirmPopup();
    this.addChild(this.buyBonusConfirmPopup);
  }

  show(tab?: string): Promise<void> {
    this.switchPage(0);

    return super.show(tab);
  }

  private onBonusBought(bonus: Bonus) {
    this.buyBonusConfirmPopup.show(bonus);
  }

  protected createBookmarks() {
    const bookmarksContainer = this.root.addChild(new Container());

    const bookmarkStartY = 265;

    ['BONUSES', 'ACTIVATE'].forEach((text, index) => {
      const bookmark = this.createBookmark(index, text);

      bookmarksContainer.addChild(bookmark);

      bookmark.position.set(index === 0 ? -200 : 200, bookmarkStartY);

      this.bookmarks.push(bookmark);
    });
  }

  protected createBookmark(index: number, text?: string) {
    const bookmark = new BuyBonusBookmark(text!);

    bookmark.onClicked.add(() => {
      this.switchPage(index);
    });

    return bookmark;
  }

  protected createTabPages() {
    this.pageItems.push({
      title: new Text({
        text: 'ACCOUNT',
        style: gameStyles.settingsTitle,
      }),
      content: new BonusesList(bonusStore, true, this.onBonusBought.bind(this)),
    });

    this.pageItems.push({
      title: new Text({
        text: 'ACCOUNT',
        style: gameStyles.settingsTitle,
      }),
      content: new BonusesList(bonusStore, false),
    });

    this.pageItems.forEach((pageItem) => {
      pageItem.title.x = -30;
      pageItem.title.y = 95;
      pageItem.title.anchor.set(0.5);
      this.root.addChild(pageItem.title);

      pageItem.content.y = 300;
      this.root.addChild(pageItem.content);

      pageItem.title.visible = false;
      pageItem.content.visible = false;
    });
  }
}
