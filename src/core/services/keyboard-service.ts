import { Signal } from '@/core/util/signal';

class KeyboardService {
  private onSpacePressed: Signal = new Signal();

  constructor() {
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ') {
        this.onSpacePressed.dispatch();
      }
    });
  }

  addSpaceListener(callback: () => void, once: boolean = false) {
    if (once){
      this.onSpacePressed.once(callback);
    } else {
      this.onSpacePressed.add(callback);
    }

    return ()=>{
      this.onSpacePressed.remove(callback);
    }
  }

  removeSpaceListener(callback: () => void) {
    this.onSpacePressed.remove(callback);
  };
}

export const keyboardService = new KeyboardService();
