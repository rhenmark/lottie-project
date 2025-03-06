export type PlayerType = "react-lottie" | "dotlottie" | "lottie-web";

export enum PLAY_STATE {
  STOPPED = "STOPPED",
  PLAYING = "PLAYING",
  PAUSED = "PAUSED",
  SEEKING = "SEEKING",
}

export enum PLAYER_VIEW {
  SINGLE = "SINGLE",
  MULTIPLE = "MULTIPLE",
}

export const players = [
  {
    id: "react-lottie",
    name: "React Lottie",
  },
  {
    id: "dotlottie",
    name: "DotLottie",
  },
  {
    id: "lottie-web",
    name: "Lottie Web",
  },
];
