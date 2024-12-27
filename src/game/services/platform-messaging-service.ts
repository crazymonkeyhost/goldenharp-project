export class PlatformMessagingService {
  constructor(private readonly config: PlatformConfig) {}

  goHome() {
    window.parent?.postMessage(`goToHomePage#${this.config.homeLink}`, '*');
  }

  deposit() {
    window.parent?.postMessage(`goToHomePage#${this.config.depositLink}`, '*');
  }
}

type PlatformConfig = {
  homeLink: string;

  depositLink: string;
};
