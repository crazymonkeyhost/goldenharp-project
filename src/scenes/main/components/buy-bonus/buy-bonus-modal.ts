import { BookmarkTabPages } from '@/scenes/main/components/settings/bookmark-tab-pages';
import { Container, Sprite } from 'pixi.js';
import { BonusesList } from '@/scenes/main/components/buy-bonus/bonuses-list';
import { Bonus, bonusStore } from '@/data/bonus-store';
import { GameModel } from '@/data/game-model';
import { ActiveBonusesList } from '@/scenes/main/components/buy-bonus/active-bonuses-list';
import { BuyBonusConfirmPopup } from '@/scenes/main/components/buy-bonus/buy-bonus-confirm-popup';

export class BuyBonusModal extends BookmarkTabPages {
  private readonly buyBonusConfirmPopup : BuyBonusConfirmPopup;

  constructor(model: GameModel) {
    super(model);

    const activeBonusesList = new ActiveBonusesList();
    activeBonusesList.y = 700;
    this.root.addChild(activeBonusesList);

    this.buyBonusConfirmPopup = new BuyBonusConfirmPopup();
    this.addChild(this.buyBonusConfirmPopup);
  }

  show(tab?: 'buy'): Promise<void> {
    if (tab === 'buy') {
      this.switchPage(0);
    }

    return super.show(tab);
  }


  private onBonusBought(bonus: Bonus){
    this.buyBonusConfirmPopup.show(bonus);
  }

  protected createBookmarks() {
    const bookmarksContainer = this.root.addChild(new Container());

    const bookmarkStartY = 260;

    ['BUY BONUS', 'ACTIVATE'].forEach((labelTextureName, index) => {
      const isRight = index >= 3;

      const bookmark = this.createBookmark(index);

      bookmarksContainer.addChild(bookmark);

      bookmark.position.set(isRight ? 700 : -700, bookmarkStartY + 200 * (index % 3));

      this.bookmarks.push(bookmark);
    });
  }


  protected createTabPages() {
    this.pageItems.push({
      title: Sprite.from('label-account'),
      content: new BonusesList(bonusStore, true, this.onBonusBought.bind(this)),
    });

    this.pageItems.push({
      title: Sprite.from('label-account'),
      content: new BonusesList(bonusStore, false),
    });

    this.pageItems.forEach((pageItem) => {
      pageItem.title.y = 50;
      pageItem.title.anchor.set(0.5);
      this.root.addChild(pageItem.title);

      pageItem.content.y = 300;
      this.root.addChild(pageItem.content);

      pageItem.title.visible = false;
      pageItem.content.visible = false;
    });
  }
}
