import { createMachine, assign } from "xstate";


export enum PLAY_STATE {
    STOPPED = 'STOPPED',
    PLAYING = 'PLAYING',
    PAUSED = 'PAUSED',
    SEEKING = 'SEEKING',
  }

const defaultFilePath = "https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json";

const playerMachine = createMachine({
    schemas: {
        context: {
            playState: PLAY_STATE,
            loop: Boolean,
            filePath: String,
            scale: Number,
            scaleConfig: {
              min: Number,
              max: Number,
              step: Number,
            }
        },
    },
  context: {
    playState: PLAY_STATE.STOPPED,
    loop: false,
    progress: 0,
    filePath: defaultFilePath,
    scale: 1,
    scaleConfig: {
      min: 0.5,
      max: 2,
      step: 0.1,
    }
  },
  on: {
    PLAY: {
      actions: assign({
        playState: PLAY_STATE.PLAYING,
        progress: 0,
      }),
    },
    STOP: {
      actions: assign({
        playState: PLAY_STATE.STOPPED,
        progress: 0,
      }),
    },
    PAUSE: {
        actions: assign({
          playState: PLAY_STATE.PAUSED,
        }),
      },
    LOOP: {
      actions: assign({
        loop: ({context}) => !context.loop,
      }),
    },
    SEEK: {
        actions: assign({
            progress: ({event}) => event.progress,
            playState: PLAY_STATE.SEEKING,
        }),
    },
    UPLOAD: {
        actions: assign({
            filePath: ({event}) => event.filePath,
        }),
    },
    SCALE: {
        actions: assign({
            scale: ({event}) => event.scale,
        }),
    },
  },
});

export default playerMachine;
