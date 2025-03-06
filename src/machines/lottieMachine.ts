import { createMachine } from 'xstate';

export interface LottieContext {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  speed: number;
  loop: boolean;
  animationData: any | null;
}

export type LottieEvent =
  | { type: 'LOAD_ANIMATION'; data: any }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'SEEK'; time: number }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'TOGGLE_LOOP' }
  | { type: 'UPDATE_TIME'; time: number }
  | { type: 'UPDATE_DURATION'; duration: number };

export const lottieMachine = createMachine({
  id: 'lottie',
  initial: 'idle',
  context: {
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    speed: 1,
    loop: true,
    animationData: null,
  } as LottieContext,
  states: {
    idle: {
      on: {
        LOAD_ANIMATION: {
          target: 'ready',
          actions: 'setAnimationData',
        },
      },
    },
    ready: {
      on: {
        PLAY: {
          target: 'playing',
          actions: 'play',
        },
        SEEK: {
          actions: 'seek',
        },
        SET_SPEED: {
          actions: 'setSpeed',
        },
        TOGGLE_LOOP: {
          actions: 'toggleLoop',
        },
      },
    },
    playing: {
      on: {
        PAUSE: {
          target: 'ready',
          actions: 'pause',
        },
        STOP: {
          target: 'ready',
          actions: 'stop',
        },
        UPDATE_TIME: {
          actions: 'updateTime',
        },
        UPDATE_DURATION: {
          actions: 'updateDuration',
        },
      },
    },
  },
}); 