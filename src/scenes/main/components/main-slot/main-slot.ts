import { Container, Graphics, Sprite } from 'pixi.js';
import { JobResult, wait } from '@/core/util/time';
import { MainCell, WinType } from '@/scenes/main/components/main-slot/main-cell';
import { SettingsService } from '@/game/services/settings-service';
import { slotConfig } from '@/config/slot-config';
import { generateTexture } from '@/core/util/render';
import { spiralPath } from '@/api/utils/spiral-path';
import { TCombinationItem, TReplacementItem } from '@/api/response-types';
import { raise } from '@/core/util/functions';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

export class MainSlot extends Container {
  protected cells: MainCell[] = [];

  protected symbols: string[] = [];

  settingService: SettingsService;

  public readonly underlay: Sprite;

  public getSlotWidth() {
    return (this.config.size.width + this.config.gap.x) * this.columns;
  }

  public getSlotHeight() {
    return (this.config.size.height + this.config.gap.y) * this.rows;
  }

  async disappear() {
    return Promise.all(this.cells.map((s, i) => s.disappear(spiralPath.getDirection(i), (i * 15) / 1000)));
  }

  stop(result: string[][]) {
    this.setCells(result);

    return Promise.all(
      [...this.cells].reverse().map((s, i) => {
        return s.appear(spiralPath.getDirection(i), (i * 20) / 1000).then(() => {
          s.playAllTime();
        });
      }),
    );
  }

  constructor(
    settingService: SettingsService,
    readonly rows = slotConfig.reels,
    readonly columns = slotConfig.reelWindow,
    defaultCells?: string[][],
    readonly config: SlotConfig = {
      size: {
        width: 145,
        height: 140,
      },
      gap: { x: 0, y: 0 },
    },
  ) {
    super();

    this.isRenderGroup = false;

    this.loadSymbols();

    this.createCells();

    this.drawMask();

    this.x = -this.getSlotWidth() / 2;
    this.y = -this.getSlotHeight() / 2;

    this.settingService = settingService;

    if (defaultCells) {
      this.setCells(defaultCells);
    }

    this.underlay = new Sprite(generateTexture('#000000', 0.6, 1, 1));
    this.underlay.anchor.set(0);
    this.underlay.x = 0;
    this.underlay.y = 0;
    this.underlay.width = this.getSlotWidth();
    this.underlay.height = this.getSlotHeight();
    this.underlay.visible = false;
    this.addChild(this.underlay);
  }

  private createCells() {
    spiralPath.forEach((x, y, index) => {
      const cell = this.createCell(index);

      cell.position.copyFrom(this.getCellPosition(x, y));

      this.cells.push(cell);

      this.addChild(cell);

      cell.playAllTime();
    });
  }

  public createCell(index) {
    return new MainCell(this.config.size, index);
  }

  public async playShift(explodedPositions: TCombinationItem['location'][], cells: string[][]) {
    const speed = 1000; // 1100
    const flatCells = spiralPath.matrixToArray(cells);

    const explodedCells = [...new Set(explodedPositions.map(([x, y]) => this.getCell(x, y)))];

    const unexplodedCells = this.cells.filter((cell) => !explodedCells.includes(cell));

    const explodedAmount = explodedCells.length;

    const unexplodedShiftMaps: Array<{
      cell: MainCell;
      from: number;
      to: number;
    }> = unexplodedCells.map((cell, index) => {
      return { cell, from: this.cells.indexOf(cell), to: index + explodedAmount };
    });

    const unexplodedPromises = unexplodedShiftMaps.map(({ cell, from, to }) =>
      this.travelCell(cell, from, to, speed).then(),
    );

    const explodedPromises = [...explodedCells].reverse().map((cell, index) => {
      const toIndex = explodedAmount - index - 1;

      cell.setId(flatCells[toIndex]);

      const startPosition = this.getCellPosition(-1, 0);

      cell.position.set(startPosition.x, startPosition.y);

      // time it takes to travel one section (cell width + gap)
      const oneSectionTime = (this.config.size.width + this.config.gap.x) / speed;

      return gsap
        .timeline({ delay: oneSectionTime * index })
        .fromTo(cell, { alpha: 0 }, { alpha: 1, duration: oneSectionTime * 0.5 }, oneSectionTime * 0.5)
        .add(this.travelCell(cell, -1, toIndex, speed), 0)
        .then(() => {
          cell.playAllTime();
        });
    });

    this.cells = [...explodedCells, ...unexplodedCells];

    await Promise.all([...unexplodedPromises, ...explodedPromises]);
  }

  /** Travel cell from one position to another */
  private travelCell(cell: MainCell, from: number, to: number, speed: number) {
    let points: { x: number; y: number }[] = [];

    if (from < 0) {
      points = [this.getCellPosition(from, 0)];

      from = 0;
    }

    points = [...points, ...spiralPath.getPathSlice(from, to).map(([x, y]) => this.getCellPosition(x, y))];

    if (points.length < 2) {
      return gsap.to({}, { duration: 0.1 });
    }

    const distance = MotionPathPlugin.getLength(
      MotionPathPlugin.rawPathToString(MotionPathPlugin.arrayToRawPath(points)),
    );

    // console.log({
    //   cell: cell.id,
    //   from: `${from} : ${spiralPath.getMatrixPosition(from)}`,
    //   to: `${to} : ${spiralPath.getMatrixPosition(to)}`,
    //   pointsIndexes: spiralPath.getPathSlice(from, to),
    //   points,
    //   distance,
    //   duration: distance / speed,
    // });

    return gsap.to(cell, {
      motionPath: points,
      duration: distance / speed,
      ease: 'none',
    });
  }

  public setCells(cells: string[][]) {
    const flat = spiralPath.matrixToArray(cells);

    this.cells.forEach((cell, i) => cell.setId(flat[i] || ''));
  }

  protected loadSymbols() {
    this.symbols = slotConfig.symbols;
  }

  drawMask() {
    const mask = new Graphics();

    const oneColuemWidth = this.config.size.width + this.config.gap.x;

    mask.rect(oneColuemWidth, 0, this.getSlotWidth() - oneColuemWidth, this.getSlotHeight());

    const oneRowHeight = this.config.size.height + this.config.gap.y;

    mask.rect(0, oneRowHeight + 5, oneColuemWidth, this.getSlotHeight() / 2 + 5);

    mask.fill('#ffffff');
    // mask.stroke({
    //   color: '#ff0000',
    //   width: 2,
    // });
    // this.addChild(mask);
    // this.mask = mask;
  }

  public set winCellsTopContainer(container: Container) {
    this._winCellsTopContainer = container;
    this._winCellsTopContainer.x += this.x;
    this._winCellsTopContainer.y += this.y;
  }

  private _winCellsTopContainer: Container;

  /** play cell win */
  public playCellsWin(cellsPositions: TCombinationItem['location'][], type: WinType = 'normal'): JobResult {
    const allCells = this.moveCellsToTop(cellsPositions);

    // this.underlay.visible = true;

    let doneResolve: () => void;

    const done = new Promise<void>((resolve) => (doneResolve = resolve));

    Promise.all(allCells.map((cell) => cell.playWin(type, this.settingService.getElementAnimation()))).then(() =>
      doneResolve(),
    );

    done.then(() => {
      allCells.forEach((cell) => cell.bringBackToOriginalParent());
      allCells.forEach((cell) => cell.stopWin());
      // this.underlay.visible = false;
    });

    const cancel = () => {
      doneResolve();
    };

    return { done, cancel };
  }

  /** explode cells and replace them with new ones */
  public explode(cellsPositions: TCombinationItem['location'][]): JobResult {
    const allCells = this.moveCellsToTop(cellsPositions);

    let doneResolve: () => void;

    const done = new Promise<void>((resolve) => (doneResolve = resolve));

    Promise.all(allCells.map((cell) => cell.explode())).then(() => doneResolve());

    done.then(() => {
      allCells.forEach((cell) => cell.bringBackToOriginalParent());

      allCells.forEach(cell=>cell.setId(null))

      // allCells.forEach(cell => cell.());
      // allCells.forEach((cell => cell.stopWin());
    });

    const cancel = () => {
      doneResolve();
    };

    return { done, cancel };
  }

  public async crystalExplode(combinations: TCombinationItem[]) {
    const allCells = this.moveCellsToTop(
      combinations.sort((c1, c2) => {
        return c1.location[1] - c2.location[1];
      }).map((item) => item.location),
    );

    await Promise.all(
      allCells.map((cell, i) => {
        return wait(100 * i).done.then(() => {
          return cell.playCrystalAppear();
        });
      }),
    );

    allCells.forEach((cell, i) => cell.setId(combinations[i].replacedTo));

    await Promise.all(
      allCells.map((cell) => {
        return cell.playCrystalExplode();
      }),
    );

    allCells.forEach((cell) => cell.bringBackToOriginalParent());
  }

  public async playLightning(cellsPositions: TCombinationItem['location'][]) {
    const allCells = this.moveCellsToTop(cellsPositions);

    await Promise.all(
      allCells.map((cell) => {
        return cell.playLightning();
      }),
    );

    allCells.forEach((cell) => cell.bringBackToOriginalParent());
  }

  public async playComet(replaced: TReplacementItem[]) {
    const allCells = this.moveCellsToTop(replaced.map((item) => item.location));

    await Promise.all(
      allCells.map((cell, i) => {
        return cell.playCometExplosion(replaced[i].symbol);
      }),
    );
  }

  private moveCellsToTop(cellsPositions: number[][]): MainCell[] {
    const allCells = new Set<MainCell>();

    cellsPositions.forEach(([x, y]) => {
      const cell = this.getCell(x, y) as MainCell;

      this.bringCellsToTop(cell, x, y);
      allCells.add(cell);
    });

    return [...allCells];
  }

  getCell(x: number, y: number) {
    return this.cells[spiralPath.getIndexByPosition(x, y)] ?? raise(`cell in x=${x}, y=${y} not found`);
  }

  protected bringCellsToTop(cell: MainCell, reel: number, row: number, top = false) {
    cell.bringToTop(this._winCellsTopContainer);

    // cell.position.copyFrom(this.getCellPosition(reel, row));

    let startZIndex = 0;

    if (top) {
      startZIndex = this.columns * this.rows;
    }

    cell.zIndex = startZIndex + (this.columns - 1 - reel) * this.rows + row;
  }

  public getCellPosition(column: number, row: number): { x: number; y: number } {
    return {
      x: column * (this.config.size.width + this.config.gap.x) + this.config.size.width / 2,
      y: row * (this.config.size.height + this.config.gap.y) + this.config.size.height / 2,
    };
  }
}

export type SlotConfig = {
  size: WidthHeight;
  gap: { x: number; y: number };
};
