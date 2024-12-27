import { FitScaleStrategy } from './fit-resize-strategy';
import { ContainResizeStrategy } from './contain-resize-strategy';

export function getResizeStrategy(type?: ResizeType): ResizeStrategy {
  if (type === 'fit') {
    return FitScaleStrategy;
  }

  return ContainResizeStrategy;
}
