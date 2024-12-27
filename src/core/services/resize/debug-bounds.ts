import { Container, Graphics, Text } from 'pixi.js';
import { onResize } from '@/core/services/resize/resize.service';

export class DebugBounds extends Container {
  gr = new Graphics();

  info = new Text({
    text: 'DebugBounds',
    style: {
      fill: 0xffffff,
      fontSize: 20,
    },
    anchor: { x: 0.5, y: 0 },
  });

  constructor(protected canvas: HTMLCanvasElement) {
    super();

    this.addChild(this.info);
    this.addChild(this.gr);

    onResize(this.resize.bind(this));
  }

  resize(resizeData: ResizeData) {
    const { x, y, width, height } = resizeData.actionArea;

    this.gr.clear();
    this.gr.rect(x, y, width, height);
    this.gr.stroke({ width: 2, color: 0xffbd01 });

    this.info.position.set(resizeData.canvas.width / 2, y);
    this.info.text = `
        resolution: ${resizeData.resolution},
        canvas physical: ${this.canvas.width}x${this.canvas.height},
        canvas logical: ${resizeData.canvas.width}x${resizeData.canvas.height},
        `;
  }
}
