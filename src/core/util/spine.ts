import { AnimationStateListener, type Spine } from '@esotericsoftware/spine-pixi-v8';

export function getSpineDuration(animation: Spine, animationName: string) {
  return animation?.skeleton.data.findAnimation(animationName)?.duration || 1;
}

export async function waitSpineEnds(animation: Spine, animationName: string) {
  return new Promise<void>((resolve) => {
    const listener: AnimationStateListener = {
      complete: (entry) => {
        if (entry.animation?.name === animationName) {
          resolve();
          animation.state.removeListener(listener);
        }
      },

      dispose: (entry) => {
        if (entry.animation?.name === animationName) {
          resolve();
          animation.state.removeListener(listener);
        }
      },

      interrupt: (entry) => {
        if (entry.animation?.name === animationName) {
          resolve();
          animation.state.removeListener(listener);
        }
      },
    };

    animation.state.addListener(listener);
  });

  // await gsap
  //   .timeline()
  //   .to({}, { duration: getSpineDuration(animation, animationName) }, 0)
  //   .then();
}
