import { useMachine } from "@xstate/react";
import playerMachine, { PLAY_STATE } from "./config/state/xstate";
import { useState, useCallback, Suspense, lazy } from "react";
import { Theme, Container, Flex, Box, Text, Card } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";

import ControlButton from "./components/ControlButton";
import {
  PauseIcon,
  PlayIcon,
  Repeat,
  StopCircle,
  UploadIcon,
  Loader2,
} from "lucide-react";
import SeekBar from "./components/SeekBar";
import { Dialog, IconButton, Tooltip } from "@radix-ui/themes";
import Dropzone from "react-dropzone";
import ZoomControl from "./components/ZoomControl";
import SkiaCanvasKit from "./components/player/SkiaCanvasKit";

// Lazy load the PlayerCard component
const PlayerCard = lazy(() => import("./components/PlayerCard"));

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
    (file: File) => {
      console.log("upload file", URL.createObjectURL(file));
      send({ type: "UPLOAD", filePath: URL.createObjectURL(file) });
    },
    [send]
  );

  const handleScaleChange = useCallback(
    (scale: number) => {
      send({ type: "SCALE", scale });
    },
    [send]
  );

  return (
    <Theme
      appearance="light"
      accentColor="blue"
      grayColor="slate"
      scaling="95%"
    >
      <Container size="4">
        <Box className="min-h-screen py-8">
          <Flex direction="column" gap="4">
            <Text size="8" weight="bold" align="center">
              Lottie Player Synchronization
            </Text>

            <Flex direction="column" gap="4" className="mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <Suspense fallback={<LoadingCard />}>
                  <PlayerCard
                    src={state.context.filePath}
                    onLoad={handleOnLoad}
                    onComplete={handleComplete}
                    playState={state.context.playState}
                    loop={state.context.loop}
                    progress={state.context.progress}
                    initialPlayer="react-lottie"
                    scale={state.context.scale}
                  />
                </Suspense>
                <Suspense fallback={<LoadingCard />}>
                  <PlayerCard
                    src={state.context.filePath}
                    onLoad={handleOnLoad}
                    onComplete={handleComplete}
                    playState={state.context.playState}
                    loop={state.context.loop}
                    progress={state.context.progress}
                    initialPlayer="dotlottie"
                    scale={state.context.scale}
                  />
                </Suspense>
                <Suspense fallback={<LoadingCard />}>
                  <PlayerCard
                    src={state.context.filePath}
                    onLoad={handleOnLoad}
                    onComplete={handleComplete}
                    playState={state.context.playState}
                    loop={state.context.loop}
                    progress={state.context.progress}
                    initialPlayer="lottie-web"
                    scale={state.context.scale}
                  />
                </Suspense>
                <Suspense fallback={<LoadingCard />}>
                  <SkiaCanvasKit src={state.context.filePath}/>
                </Suspense>
              </div>
            </Flex>

            <Box className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-4 px-8">
              <Flex gap="4" align="center" justify="center">
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
                <Box className="flex-1">
                  <SeekBar
                    totalFrames={animationFrame}
                    currentFrame={state.context.progress}
                    onSeek={handleSeek}
                    disabled={animationFrame === 0}
                  />
                </Box>
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
                <ZoomControl
                  scale={state.context.scale}
                  onScaleChange={handleScaleChange}
                  min={state.context.scaleConfig.min}
                  max={state.context.scaleConfig.max}
                  step={state.context.scaleConfig.step}
                />
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Container>
    </Theme>
  );
}

interface UploadDialogProps {
  onUpload: (file: File) => void | Promise<void>;
  disabled?: boolean;
}

function UploadDialog({ onUpload, disabled }: UploadDialogProps) {
  const [open, setOpen] = useState(false);

  const handleDrop = async (acceptedFiles: File[]) => {
    try {
      await onUpload(acceptedFiles[0]);
      // Close the dialog after successful upload
      setOpen(false);
    } catch (error) {
      console.error("Upload failed:", error);
      // Optionally show an error message to the user
    }
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
        <div className="mt-4 border border-gray-300 rounded-md p-4 min-h-36">
          <Dropzone onDrop={handleDrop}>
            {({ getRootProps, getInputProps }) => (
              <section>
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </section>
            )}
          </Dropzone>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// Loading card component
const LoadingCard = () => (
  <Card size="2">
    <Flex align="center" justify="center" className="min-h-[200px]">
      <Loader2 className="animate-spin" />
    </Flex>
  </Card>
);

export default App;
