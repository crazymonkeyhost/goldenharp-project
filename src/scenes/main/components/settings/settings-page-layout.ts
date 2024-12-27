import { SettingsPage } from '@/scenes/main/components/settings/settings-page';
import { GameModel } from '@/data/game-model';
import { type StartAutoplayData } from '@/game/services/autoplay-service';
import { AutoplaySettingsPage } from './autoplay-settings-page';
import { BetsSettingsPage } from './bets-settings-page';
import { BookmarkTabPages } from './bookmark-tab-pages';
import { Sprite } from 'pixi.js';
import { SpriteButton } from '@/core/ui/sprite-button';
import { getButtonStatesTextures } from '@/core/util/textures';

type SettingsPageOptions = {
  startAutoplay: (data: StartAutoplayData) => void;

  betSelected: (bet: number) => void;
};

export class SettingsPageLayout extends BookmarkTabPages {
  private options: SettingsPageOptions;

  private readonly background2: Sprite;

  private closeButton2: SpriteButton;

  constructor(model: GameModel, options: SettingsPageOptions) {
    super(model);

    this.options = options;

    this.background2 = Sprite.from('settings-bg-2');
    this.background2.anchor.set(0.5, 0);
    this.background2.visible = false;
    this.backgroundContainer.addChild(this.background2);


    // close button
    this.closeButton2 = new SpriteButton({
      textures: getButtonStatesTextures('button-close2'),
      action: () => this.hide(),
    });
    this.closeButton2.view.x = 500;
    this.closeButton2.view.y = 220;
    this.closeButton2.view.scale.set(0.6);
    this.root.addChild(this.closeButton2.view);

  }

  protected createTabPages() {
    this.pageItems.push(
      new SettingsPage(),
      new AutoplaySettingsPage((data) => {
        this.hide();

        this.options.startAutoplay(data);
      }),

      new BetsSettingsPage(this.model.betRange, this.model.bet, (bet) => {
        this.hide();

        this.options.betSelected(bet);
      }),
    );

    this.pageItems.forEach((pageItem) => {
      pageItem.title.x -= 30;
      pageItem.title.y += 95;
      pageItem.title.anchor.set(0.5);
      this.root.addChild(pageItem.title);

      pageItem.content.y = 250;
      this.root.addChild(pageItem.content);

      pageItem.title.visible = false;
      pageItem.content.visible = false;
    });
  }

  public show(tab: 'settings' | 'autoplay' | 'bet'): Promise<void> {
    const index = ['settings', 'autoplay', 'bet'].indexOf(tab);

    this.switchPage(index);

    this.background.visible = (tab === 'settings');

    this.background2.visible = (tab === 'bet'|| tab === 'autoplay');

    this.closeButton.view.visible = (tab === 'settings');

    this.closeButton2.view.visible = (tab === 'bet' || tab === 'autoplay');

    return super.show(tab);
  }

  protected createBookmarks() {}
}
