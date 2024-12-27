export const FitScaleStrategy: ResizeStrategy = {
  calculateCanvasSize: function (_clientSize, gameSize) {
    return {
      width: gameSize.width,
      height: gameSize.height,
    };
  },

  calculateGameAreaRect: function (_canvasSize, gameSize) {
    return {
      x: 0,
      y: 0,
      width: gameSize.width,
      height: gameSize.height,
    };
  },
};
