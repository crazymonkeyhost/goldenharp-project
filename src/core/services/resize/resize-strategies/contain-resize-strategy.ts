import { clamp } from '@/core/util/math';

export const ContainResizeStrategy: ResizeStrategy = {
  calculateCanvasSize: function (clientSize, gameSize, { containMaxSize }) {
    const MAX_SIZE = containMaxSize || 2400;

    let width = gameSize.width,
      height = gameSize.height;

    const clientAspectRatio = clientSize.width / clientSize.height;

    // if (clientAspectRatio > gameSize.width / gameSize.height) {
    if (clientAspectRatio > 1) {
      width = Math.floor(clamp(height * clientAspectRatio, gameSize.width, MAX_SIZE));
    } else {
      height = Math.floor(clamp(width / clientAspectRatio, gameSize.height, MAX_SIZE));
    }

    return { width, height };
  },

  calculateGameAreaRect: function (canvasSize, gameSize) {
    return {
      x: (canvasSize.width - gameSize.width) / 2,
      y: (canvasSize.height - gameSize.height) / 2,
      width: gameSize.width,
      height: gameSize.height,
    };
  },
};
