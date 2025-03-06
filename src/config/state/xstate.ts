import { createMachine, assign } from "xstate";
import { PLAYER_VIEW, PLAY_STATE } from "../../utils/constant";


const defaultFilePath =
  "https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json";

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
      },
      speed: Number,
      speedConfig: {
        min: Number,
        max: Number,
        step: Number,
      },
      playerView: PLAYER_VIEW,
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
    },
    speed: 1,
    speedConfig: {
      min: 1,
      max: 3,
      step: 1,
    },
    playerView: PLAYER_VIEW.SINGLE,
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
        loop: ({ context }) => !context.loop,
      }),
    },
    SEEK: {
      actions: assign({
        progress: ({ event }) => event.progress,
        playState: PLAY_STATE.SEEKING,
      }),
    },
    UPLOAD: {
      actions: assign({
        filePath: ({ event }) => event.filePath,
      }),
    },
    SCALE: {
      actions: assign({
        scale: ({ event }) => event.scale,
      }),
    },
    SPEED: {
      actions: assign({
        speed: ({
          context,
        }: {
          context: any;
        }) => {
          const nextSpeed = context.speed + context.speedConfig.step;

          if (nextSpeed > context.speedConfig.max) {
            return context.speedConfig.min;
          } else if (nextSpeed <= context.speedConfig.min) {
            return context.speedConfig.min;
          } else {
            return nextSpeed;
          }
        },
      }),
    },
    PLAYER_VIEW: {
      actions: assign({
        playerView: ({ event }) => event.playerView,
      }),
    },
  },
});

export default playerMachine;
