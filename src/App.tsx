import { useMachine } from "@xstate/react";
import playerMachine, { PLAY_STATE } from "./state/xstate";
import { Player } from "@lottiefiles/react-lottie-player";
import { useRef, useEffect, useState, useCallback } from "react";

import Switch from "./components/Switch";
import ControlButton from "./components/ControlButton";
import { PauseIcon, PlayIcon, StopCircle, UploadIcon } from "lucide-react";
import SeekBar from "./components/SeekBar";
import DotLottie from "./components/player/DotLottie";
import ReactLottiePlayer from "./components/player/ReactLottiePlayer";
import LottieWeb, { LottieWebRef } from "./components/player/LottieWeb";
import { Button, Dialog } from "@radix-ui/themes";
import Dropzone from "react-dropzone";

// Define types for refs
interface LottieRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setLoop: (loop: boolean) => void;
  goToAndStop: (progress: number, x?: boolean) => void;
  setFrame?: (progress: number, x?: boolean) => void;
  totalFrames?: number;
}

function App() {
  const [state, send, actorRef] = useMachine(playerMachine);
  const reactLottiePlayerRef = useRef<Player>(null);
  const dotLottieRef = useRef<LottieRef | null>(null);
  const lottieWebRef = useRef<LottieWebRef>(null);
  const [animationFrame, setAnimationFrame] = useState(0);

  // Memoize handlers
  const handlePlayAndStop = useCallback(
    (playState: PLAY_STATE, loop: boolean, progress: number) => {
      const players = [dotLottieRef, reactLottiePlayerRef, lottieWebRef];

      // Set loop for all players
      players.forEach((ref) => {
        if (ref.current) {
          ref.current.setLoop(loop);
        }
      });


      switch (playState) {
        case PLAY_STATE.PLAYING:
          players.forEach((ref) => {
            if (progress === 0) {
              ref.current?.play();
            } else {
              if (ref === dotLottieRef && ref.current?.setFrame) {
                ref.current.setFrame(0);
              } else {
                ref.current?.goToAndStop(0, true);
              }
              ref.current?.play();
            }
          });
          break;
        case PLAY_STATE.PAUSED:
          players.forEach((ref) => ref.current?.pause());
          break;
        case PLAY_STATE.STOPPED:
          players.forEach((ref) => ref.current?.stop());
          break;
        case PLAY_STATE.SEEKING:
          players.forEach((ref) => {
            if (ref === dotLottieRef && ref.current?.setFrame) {
              ref.current.setFrame(progress);
            } else {
              ref.current?.goToAndStop(progress, true);
            }
          });
          break;
        default:
          players.forEach((ref) => ref.current?.stop());
          break;
      }
    },
    []
  );

  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      handlePlayAndStop(
        snapshot.context.playState,
        snapshot.context.loop,
        snapshot.context.progress
      );
    });

    return () => subscription.unsubscribe();
  }, [actorRef, handlePlayAndStop]);

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

  const handleDotLottieLoad = useCallback((ref: LottieRef) => {
    dotLottieRef.current = ref;
    const frames = ref?.totalFrames;
    setAnimationFrame(frames || 0);

    if (ref) {
      ref.goToAndStop = (progress: number, x?: boolean) => {
        if (ref.setFrame) {
          ref.setFrame(progress, x);
        }
      };
    }
  }, []);

  const handleReactLottieLoad = useCallback(() => {
    if (reactLottiePlayerRef.current?.totalFrames) {
      setAnimationFrame(reactLottiePlayerRef.current?.totalFrames || 0);
    }
  }, []);

  const handleLottieWebLoad = useCallback(() => {
    if (lottieWebRef.current?.totalFrames) {
      setAnimationFrame(lottieWebRef.current?.totalFrames || 0);
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Lottie Player Synchronization
        </h1>
        <div className="grid grid-cols-2 justify-center items-baseline gap-4">
          <div className="border border-gray-300 h-full">
            <DotLottie
              ref={dotLottieRef}
              onLoad={handleDotLottieLoad}
              onComplete={handleComplete}
              src={state.context.filePath}
            />
          </div>
          <div className="border border-gray-300 h-full">
            <ReactLottiePlayer
              ref={(ref) => (reactLottiePlayerRef.current = ref)}
              onLoad={handleReactLottieLoad}
              onComplete={() => {
                if (!state.context.loop) {
                  handleStop();
                }
              }}
              src={state.context.filePath}
            />
          </div>
          <div className="border border-gray-300 h-full">
            <LottieWeb
              ref={lottieWebRef}
              onLoad={handleLottieWebLoad}
              src={state.context.filePath}
            />
          </div>
        </div>
        <div className="flex gap-4 mt-4 justify-center items-baseline">
          <ControlButton
            label="Play"
            className="bg-blue-500"
            onClick={handlePlay}
            disabled={state.context.playState === PLAY_STATE.PLAYING}
            icon={<PlayIcon />}
          />
          <ControlButton
            label="Pause"
            className="bg-yellow-500"
            onClick={handlePause}
            disabled={
              state.context.playState === PLAY_STATE.PAUSED ||
              state.context.playState === PLAY_STATE.STOPPED
            }
            icon={<PauseIcon />}
          />
          <ControlButton
            label="Stop"
            className="bg-red-500"
            onClick={handleStop}
            disabled={state.context.playState === PLAY_STATE.STOPPED}
            icon={<StopCircle />}
          />
          <div className="flex-1">
            <SeekBar
              totalFrames={animationFrame}
              currentFrame={state.context.progress}
              onSeek={handleSeek}
              disabled={animationFrame === 0}
            />
          </div>
          <Switch
            label="Enable Loop"
            onChange={handleLoopSwitch}
            value={state.context.loop}
            disabled={state.context.playState === PLAY_STATE.PLAYING}
          />
        </div>
        <div className="mt-4">
          <UploadDialog onUpload={handleUploadFile} />
        </div>
      </div>
    </div>
  );
}

interface UploadDialogProps {
  onUpload: (file: File) => void | Promise<void>;
}

function UploadDialog({ onUpload }: UploadDialogProps) {
  const [open, setOpen] = useState(false);

  const handleDrop = async (acceptedFiles: File[]) => {
    try {
      await onUpload(acceptedFiles[0]);
      // Close the dialog after successful upload
      setOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild={true}>
        <Button>
          <UploadIcon />
          Upload Lottie File
        </Button>
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

export default App;
