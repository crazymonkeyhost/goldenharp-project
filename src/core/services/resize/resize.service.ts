import { isFunction } from '../../util/functions';
import { getResizeStrategy } from './resize-strategies/get-resize-strategy';
import { Signal } from '@/core/util/signal';
import { clamp, lerp, normalize } from '@/core/util/math';

let instance: ResizeService;

export class ResizeService extends Signal<ResizeData> {
  strategy!: ResizeStrategy;

  config!: ResizeConfig;

  target!: HTMLElement;

  parent!: HTMLElement;

  observer!: ResizeObserver;

  constructor() {
    super();

    instance = this;
  }

  public init(parent: HTMLElement, target: HTMLElement, config: ResizeConfig) {
    this.parent = parent;
    this.target = target;

    this.config = config;

    this.strategy = getResizeStrategy(config.resizeType);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.resize(entry.contentRect);
      }
    });

    this.resize(parent.getBoundingClientRect());

    observer.observe(parent);

    //    window.addEventListener('resize', this.resize.bind(this));
    // this.resize();
  }

  destroy() {
    this.observer?.disconnect();
  }

  invokeListener(cb: ResizeCallback, data: ResizeData) {
    cb(data, {
      getCanvasCenter: () => ({ x: data.canvas.width / 2, y: data.canvas.height / 2 }),
      getCanvasMiddleX: () => ({ x: data.canvas.width / 2, y: 0 }),
      getCanvasMiddleY: () => ({ x: 0, y: data.canvas.height / 2 }),
      getActionAreaCenter: () => ({
        x: data.actionArea.x + data.actionArea.width / 2,
        y: data.actionArea.y + data.actionArea.height / 2,
      }),
      getActionAreaMiddleX: () => data.actionArea.x + data.actionArea.width / 2,
      getActionAreaMiddleY: () => ({ x: data.actionArea.x, y: data.actionArea.y + data.actionArea.height / 2 }),
    });
  }

  public resize(clientSize: WidthHeight) {
    const orientation: Orientation = clientSize.width > clientSize.height ? 'landscape' : 'portrait';

    const gameSize: WidthHeight =
      orientation === 'landscape'
        ? {
          width: this.config.width,
          height: this.config.height,
        }
        : { width: this.config.height, height: this.config.width };

    const canvasSize = this.strategy.calculateCanvasSize(clientSize, gameSize, this.config);

    // canvasSize.width = canvasSize.width * 0.7;
    // canvasSize.height = canvasSize.height * 0.7;

    const scale = this.calculateScale(canvasSize, clientSize);

    const margin = this.calculateMargins(canvasSize, clientSize, scale);

    const targetStyle = this.target.style;
    targetStyle.width = css.px(canvasSize.width);
    targetStyle.height = css.px(canvasSize.height);

    targetStyle.marginLeft = css.px(margin.left);
    targetStyle.marginTop = css.px(margin.top);

    targetStyle.width = css.px(canvasSize.width * scale);
    targetStyle.height = css.px(canvasSize.height * scale);

    const lastOrientation = this.lastPayload?.orientation;

    this.dispatch({
      actionArea: this.strategy.calculateGameAreaRect(canvasSize, gameSize, this.config),
      orientationChanged: lastOrientation !== orientation,
      canvas: canvasSize,
      orientation: orientation,
      resolution: this.calculateResolution(clientSize),
    });
  }

  calculateResolution(clientSize: WidthHeight): number {
    const clientWidth = clientSize.width * window.devicePixelRatio;
    const clientHeight = clientSize.height * window.devicePixelRatio;

    const gameWidth = this.config.width;
    const gameHeight = this.config.height;

    const _scale = clamp(Math.min(clientWidth / gameWidth, clientHeight / gameHeight), 1, 3);

    // return scale;

    return 1.47;
  }

  /** Calculate the margins for the canvas */
  private calculateMargins(gameSize: WidthHeight, clientSize: WidthHeight, scale: number): TopLeft {
    const clientWidth = clientSize.width,
      gameWidth = gameSize.width,
      clientHeight = clientSize.height,
      gameHeight = gameSize.height;

    const left = Math.floor(Math.max(0, (clientWidth - gameWidth * scale) / 2));

    const top = Math.floor(Math.max(0, (clientHeight - gameHeight * scale) / 2));

    return { left, top };
  }

  /** Calculate the scale for the canvas */
  private calculateScale(gameSize: WidthHeight, clientSize: WidthHeight): number {
    return Math.min(clientSize.width / gameSize.width, clientSize.height / gameSize.height);
  }
}


export function removeResizeListener(callback: ResizeCallback) {
  instance.remove(callback as (data: ResizeData) => void);
}

export function onResize(callback: ResizeCallback, invokeImmediately = true) {
  instance.add(callback as (data: ResizeData) => void, invokeImmediately);

  return ()=>removeResizeListener(callback);
}

export function lastResizeData(): ResizeData {
  return instance.lastPayload!;
}

export function Resize() {
  return function(originalMethod: ResizeCallback, context: ClassMethodDecoratorContext) {
    context.addInitializer(function(this: unknown) {
      onResize(originalMethod.bind(this));
    });

    // instance.add(originalMethod.bind(this) as (data: ResizeData) => void);
  };
}

export const toCanvas: (el: Position, pos: GetPosition) => ()=>void = (el, pos) => {
  return onResize((data, lib) => {
    const position = isFunction(pos) ? pos(data, lib) : pos;

    el.x = position.x;
    el.y = position.y;
  });
};

export const toCanvasCenter: (el: Position) => ()=>void = (el) => {
  return onResize((data, { getCanvasCenter }) => {
    const { x, y } = getCanvasCenter();

    el.x = x;
    el.y = y;
  });
};

export const toActionArea: (el: Position, pos: GetPosition) => void = (el, pos) => {
  onResize((data, lib) => {
    const position = isFunction(pos) ? pos(data, lib) : pos;

    el.x = data.actionArea.x + position.x;
    el.y = data.actionArea.y + position.y;
  });
};

export const toActionAreaCenter: (el: Position) => void = (el) => {
  onResize((data, { getActionAreaCenter }) => {
    const { x, y } = getActionAreaCenter();

    el.x = x;
    el.y = y;
  });
};

export function floatingPositionY(
  from: number,
  to: number,
  fromRatio: number,
  toRatio: number,
  resizeData: ResizeData,
) {
  const ratio = resizeData.canvas.height / resizeData.actionArea.height;

  const normalized = clamp(normalize(ratio, fromRatio, toRatio), 0, 1);

  return lerp(from, to, normalized);
}

export const css = {
  px: (value: string | number) => `${value}px`,
};
