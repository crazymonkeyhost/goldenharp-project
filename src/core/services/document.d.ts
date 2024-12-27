interface Document {
  readonly mozFullScreen: Element | null;
  readonly webkitIsFullScreen: Element | null;
  readonly mozFullscreenEnabled: boolean;
  readonly webkitFullscreenEnabled: boolean;
  readonly msFullscreenEnabled: boolean;

  mozCancelFullScreen(): Promise<void>;

  webkitExitFullscreen(): Promise<void>;
}

interface Element {
  mozRequestFullScreen?(options?: FullscreenOptions): Promise<void>;

  webkitRequestFullscreen?(options?: FullscreenOptions): Promise<void>;
}
