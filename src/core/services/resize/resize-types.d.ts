interface ResizeConfig {
  width: number;
  height: number;
  resizeType?: ResizeType;
  containMaxSize?: number;
}

type Orientation = 'landscape' | 'portrait';

type ResizeData = {
  canvas: WidthHeight;
  actionArea: Rect;
  orientation: Orientation;
  orientationChanged: boolean;
  resolution: number;
};

type Rect = { x: number; y: number; width: number; height: number };

type WidthHeight = {
  width: number;
  height: number;
};

type TopLeft = {
  top: number;
  left: number;
};

interface ResizeStrategy {
  calculateCanvasSize(clientSize: WidthHeight, gameSize: WidthHeight, config: ResizeConfig): WidthHeight;

  calculateGameAreaRect(canvasSize: WidthHeight, gameSize: WidthHeight, config: ResizeConfig): Rect;
}

type ResizeCallback = (data: ResizeData, lib: ResizeCallbackLib) => void;

type ResizeCallbackLib = {
  getCanvasCenter: () => Position;
  getCanvasMiddleX: () => Position;
  getCanvasMiddleY: () => Position;
  getActionAreaCenter: () => Position;
  getActionAreaMiddleX: () => number;
  getActionAreaMiddleY: () => Position;
};

type Position = { x: number; y: number };

type GetPosition = ((data: ResizeData, lib: ResizeCallbackLib) => Position) | Position;

type ResizeType = 'fit' | 'contain';
