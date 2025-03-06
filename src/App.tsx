import { useMachine } from "@xstate/react";
import playerMachine from "./config/state/xstate";
import { useState, useCallback, Suspense, lazy } from "react";
import {
  Theme,
  Container,
  Flex,
  Box,
  Text,
  SegmentedControl,
  TextField,
} from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import ControlButton from "./components/controls/ControlButton";
import {
  ChevronRight,
  PauseIcon,
  PlayIcon,
  Repeat,
  StopCircle,
  UploadIcon,
} from "lucide-react";
import SeekBar from "./components/controls/SeekBar";
import { Dialog, IconButton, Tooltip } from "@radix-ui/themes";
import Dropzone from "react-dropzone";
import ZoomControl from "./components/controls/ZoomControl";
import LoadingCard from "./components/LoadingCard";
import { PLAY_STATE, PLAYER_VIEW, players, PlayerType } from "./utils/constant";

// Lazy load the PlayerCard component
const PlayerCard = lazy(() => import("./components/controls/PlayerCard"));

// Define types for refs
function App() {
  const [state, send] = useMachine(playerMachine);
  const [animationFrame, setAnimationFrame] = useState(0);

  const handlePlay = useCallback(() => {
    send({ type: "PLAY" });
  }, [send]);

  const handleStop = useCallback(() => {
    send({ type: "STOP" });
  }, [send]);

  const handlePause = useCallback(() => {
    send({ type: "PAUSE" });
  }, [send]);

  const handleLoopSwitch = useCallback(() => {
    send({ type: "LOOP" });
  }, [send]);

  const handleSeek = useCallback(
    (progress: number) => {
      send({ type: "SEEK", progress });
    },
    [send]
  );

  const handleOnLoad = useCallback(
    (ref: any) => {
      const frames = ref?.current?.totalFrames || ref?.totalFrames;
      if (frames || frames > 0) {
        setAnimationFrame(frames || 0);
      }
      send({ type: "LOADED" });
    },
    [send]
  );

  const handleComplete = useCallback(() => {
    if (!state.context.loop) {
      handleStop();
    }
  }, [state.context.loop, handleStop]);

  const handleUploadFile = useCallback(
    (filePath: string) => {
      send({ type: "UPLOAD", filePath });
    },
    [send]
  );

  const handleScaleChange = useCallback(
    (scale: number) => {
      send({ type: "SCALE", scale });
    },
    [send]
  );

  const handleSpeedChange = useCallback(() => {
    send({ type: "SPEED" });
  }, [send]);

  const handlePlayerViewChange = useCallback(
    (value: PLAYER_VIEW) => {
      send({ type: "PLAYER_VIEW", playerView: value });
    },
    [send]
  );

  const playerView =
    state.context.playerView === PLAYER_VIEW.SINGLE
      ? players.slice(0, 1)
      : players;
  const playerViewClass =
    state.context.playerView === PLAYER_VIEW.SINGLE
      ? "grid-cols-1"
      : "grid-cols-2 lg:grid-cols-2";

  return (
    <Theme
      appearance="light"
      accentColor="blue"
      grayColor="slate"
      scaling="95%"
    >
      <Container size="4" className="relative">
        <Box className="min-h-screen py-8">
          <Flex direction="column" gap="4">
            <Text size="8" weight="bold" align="center">
              Lottie Player Synchronization
            </Text>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded-md px-4 md:px-2">
                <span className="font-bold">Current File:</span>{" "}
                {state.context.filePath}
              </div>
              <SegmentedControl.Root
                defaultValue={state.context.playerView}
                onValueChange={handlePlayerViewChange}
              >
                <SegmentedControl.Item value={PLAYER_VIEW.SINGLE}>
                  Single
                </SegmentedControl.Item>
                <SegmentedControl.Item value={PLAYER_VIEW.MULTIPLE}>
                  Multiple
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </div>

            <Flex direction="column" gap="4" className="md:mb-20 mb-40">
              <div className={`grid ${playerViewClass} gap-4`}>
                {playerView.map((player) => {
                  return (
                    <Suspense fallback={<LoadingCard />} key={player.id}>
                      <PlayerCard
                        src={state.context.filePath}
                        onLoad={handleOnLoad}
                        onComplete={handleComplete}
                        playState={state.context.playState}
                        loop={state.context.loop}
                        progress={state.context.progress}
                        initialPlayer={player.id as PlayerType}
                        scale={state.context.scale}
                        speed={state.context.speed}
                      />
                    </Suspense>
                  );
                })}
              </div>
            </Flex>

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
                <div className="grid grid-flow-col grid-cols-[80%_auto_auto_auto] gap-2 justify-center items-center w-full">
                  <SeekBar
                    totalFrames={animationFrame}
                    currentFrame={state.context.progress}
                    onSeek={handleSeek}
                    disabled={animationFrame === 0}
                  />
                  <Tooltip
                    content={
                      state.context.loop ? "Disable Loop" : "Enable Loop"
                    }
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
          </Flex>
        </Box>
      </Container>
    </Theme>
  );
}

interface UploadDialogProps {
  onUpload: (file: string) => void | Promise<void>;
  disabled?: boolean;
}

export function UploadDialog({ onUpload, disabled }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [uploadType] = useState<'file' | 'url'>('file');
  const [text, setText] = useState('');

  const handleDrop = async (acceptedFiles: File[]) => {
    try {
      const filePath = URL.createObjectURL(acceptedFiles[0]);
      await onUpload(filePath);
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleUpload = () => {
      onUpload(text);
      setOpen(false);
      
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild={true}>
        <IconButton title="Upload Lottie File" disabled={disabled}>
          <Tooltip content="Upload Lottie File">
            <UploadIcon size={16} />
          </Tooltip>
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content maxWidth="450px">
        <Dialog.Title>Upload Lottie File</Dialog.Title>
        <div className="mt-4 border border-gray-300 rounded-md p-4 min-h-[200px]">
          <SegmentedControl.Root defaultValue={uploadType}>
            <SegmentedControl.Item value={'file'}>File</SegmentedControl.Item>
            <SegmentedControl.Item value={'url'}>URL</SegmentedControl.Item>
          </SegmentedControl.Root>
          {uploadType === 'file' && (
            <Dropzone
              onDrop={handleDrop}
            accept={{
              "application/json": [".json"],
            }}
           maxFiles={1}
          >
            {({ getRootProps, getInputProps }) => (
              <section  className="mt-4 h-full min-h-[200px]  " >
                <div {...getRootProps()}  className="mt-4 h-full min-h-[200px] grid place-items-center" >
                  <input {...getInputProps()} />
                  <p>Drag 'n' lottie file</p>
                </div>
              </section>
            )}
          </Dropzone>
          )}
          {uploadType === 'url' && (
            <div className="mt-10 flex">
            <TextField.Root placeholder="Enter Lottie URL"  size="2" className="w-full" onChange={handleTextChange}>
              <TextField.Slot></TextField.Slot>
              <TextField.Slot className="!p-0">
                <IconButton onClick={handleUpload}>
                <ChevronRight size={16} />
              </IconButton>
              </TextField.Slot>
            </TextField.Root>
            </div>
          )}
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default App;
