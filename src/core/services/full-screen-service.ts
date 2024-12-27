import { isMobile } from 'pixi.js';

export class FullScreenService {
  private isInFullScreenActive = false;

  init(element: HTMLElement) {
    if (!isMobile.any || isMobile.apple.device) return;

    element.addEventListener('click', () => {
      this.goToFullScreenMode();
    });

    const eventName = this.getFullScreenChangeEventName();
    if (eventName === null) return;

    document.addEventListener(
      eventName,
      () => {
        //we are in full screen
        if (this.isInFullScreen()) {
          this.isInFullScreenActive = true;
        } else {
          this.isInFullScreenActive = false;
        }
      },
      true,
    );
  }


  public goToFullScreenMode() {
    if (this.isInFullScreenActive) return;

    document.documentElement[this.getFullScreenFunctionName()]?.({
      navigationUI: 'hide',
    });
  }

  private getFullScreenFunctionName() {
    if (typeof document.documentElement.mozRequestFullScreen === 'function') {
      return 'mozRequestFullScreen';
    }

    if (typeof document.documentElement.webkitRequestFullscreen === 'function') {
      return 'webkitRequestFullscreen';
    }

    return 'requestFullscreen';
  }

  private isInFullScreen(): boolean {
    return !!(document.fullscreenElement || document.mozFullScreen || document.webkitIsFullScreen);
  }

  private getFullScreenChangeEventName() {
    if (typeof document.documentElement.requestFullscreen === 'function') {
      return 'fullscreenchange';
    }

    if (typeof document.documentElement.mozRequestFullScreen === 'function') {
      return 'mozfullscreenchange';
    }

    if (typeof document.documentElement.webkitRequestFullscreen === 'function') {
      return 'webkitfullscreenchange';
    }

    return null;
  }

  public isFullScreenAvailable(): boolean {
    return !!(
      document.fullscreenEnabled ||
      document.mozFullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.msFullscreenEnabled ||
      document.documentElement.requestFullscreen ||
      document.documentElement.mozRequestFullScreen ||
      document.documentElement.webkitRequestFullscreen
    );
  }
}

