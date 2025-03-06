import { Tooltip, IconButton, Box } from "@radix-ui/themes";
import {  PlayIcon, PauseIcon, StopCircle, Repeat } from "lucide-react";
import playerMachine, { PLAY_STATE } from "../config/state/xstate";
import ControlButton from "./controls/ControlButton";
import SeekBar from "./controls/SeekBar";
import ZoomControl from "./controls/ZoomControl";
import { useMachine } from "@xstate/react";
import { UploadDialog } from "../App";

const MainControl = ({
  handlePlay,
  handlePause,
  handleStop,
  handleSeek,
  handleLoopSwitch,
  handleUploadFile,
  handleSpeedChange,
  handleScaleChange,
  animationFrame,
}: {
  handlePlay: () => void;
  handlePause: () => void;
  handleStop: () => void;
  handleSeek: (frame: number) => void;
  handleLoopSwitch: () => void;
  handleUploadFile: (file: File) => void;
  handleSpeedChange: () => void;
  handleScaleChange: (scale: number) => void;
  animationFrame: number;
}) => {
  const [state] = useMachine(playerMachine);

  return (
    <Box className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 px-8">
      <div className="grid grid-cols-1 md:grid-flow-col md:grid-cols-[auto_1fr_20%] gap-4">
        <div className="flex gap-2 w-full">
          <ControlButton
            label="Play"
            className="bg-blue-500"
            onClick={handlePlay}
            disabled={state.context.playState === PLAY_STATE.PLAYING}
            icon={<PlayIcon size={16} />}
          />
          <ControlButton
            label="Pause"
            className="bg-yellow-500"
            onClick={handlePause}
            disabled={
              state.context.playState === PLAY_STATE.PAUSED ||
              state.context.playState === PLAY_STATE.STOPPED
            }
            icon={<PauseIcon size={16} />}
          />
          <ControlButton
            label="Stop"
            className="bg-red-500"
            onClick={handleStop}
            disabled={state.context.playState === PLAY_STATE.STOPPED}
            icon={<StopCircle size={16} />}
          />
        </div>
        <div className="grid grid-flow-col grid-cols-[80%_auto_auto] gap-2 justify-center items-center w-full">
          <SeekBar
            totalFrames={animationFrame}
            currentFrame={state.context.progress}
            onSeek={handleSeek}
            disabled={animationFrame === 0}
          />
          <Tooltip
            content={state.context.loop ? "Disable Loop" : "Enable Loop"}
          >
            <IconButton
              variant="solid"
              color={state.context.loop ? "blue" : "gray"}
              onClick={handleLoopSwitch}
              className="max-w-18"
            >
              <Repeat size={16} />
            </IconButton>
          </Tooltip>
          <UploadDialog
            onUpload={handleUploadFile}
            disabled={state.context.playState === PLAY_STATE.PLAYING}
          />
          <Tooltip content="Set Speed">
            <IconButton onClick={handleSpeedChange}>
              {state.context.speed}X
            </IconButton>
          </Tooltip>
        </div>

        <ZoomControl
          scale={state.context.scale}
          onScaleChange={handleScaleChange}
          min={state.context.scaleConfig.min}
          max={state.context.scaleConfig.max}
          step={state.context.scaleConfig.step}
        />
      </div>
    </Box>
  );
};

export default MainControl;
