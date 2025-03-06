import { Card, Select, Text } from "@radix-ui/themes";
import { useRef, useState, useEffect, Suspense } from "react";
import { PLAY_STATE } from "../config/state/xstate";
import { Loader2 } from "lucide-react";
import React from "react";
import { LottieWebRef } from "./player/LottieWeb";

// Lazy load the player components
const DotLottie = React.lazy(() => import("./player/DotLottie"));
const LottieWeb = React.lazy(() => import("./player/LottieWeb"));
const ReactLottiePlayer = React.lazy(() => import("./player/ReactLottiePlayer"));

type PlayerType = "react-lottie" | "dotlottie" | "lottie-web";

interface PlayerCardProps {
  src: string;
  onLoad?: (ref: any) => void;
  onComplete?: () => void;
  playState: PLAY_STATE;
  loop: boolean;
  progress: number;
  initialPlayer: PlayerType;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-[200px]">
    <Loader2 className="animate-spin" />
  </div>
);

const PlayerCard = ({
  src,
  onLoad,
  onComplete,
  playState,
  loop,
  progress,
  initialPlayer,
}: PlayerCardProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType>(initialPlayer);
  const playerRef = useRef<any | LottieWebRef>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle player state changes
  useEffect(() => {
    if (!playerRef.current) return;

    try {
      playerRef.current.setLoop(loop);

      switch (playState) {
        case PLAY_STATE.PLAYING: {
          if (selectedPlayer === 'lottie-web') {
            if (progress === 0) {
              playerRef.current.play();
            } else {
              // Convert progress to percentage for LottieWeb
              playerRef.current.goToAndPlay(progress, false);
            }
          } else {
            if (progress === 0) {
              playerRef.current?.play();
            } else {
              if (playerRef.current?.setFrame) {
                playerRef.current.setFrame(0);
              } else {
                playerRef.current?.goToAndStop(0, true);
              }
              playerRef.current?.play();
            }
          }
          break;
        }
        case PLAY_STATE.PAUSED:
          playerRef.current.pause();
          break;
        case PLAY_STATE.STOPPED:
          if (selectedPlayer === 'lottie-web') {
            playerRef.current.stop();
            playerRef.current.goToAndStop(0, true);
          } else {
            playerRef.current.stop();
            if (playerRef.current?.setFrame) {
              playerRef.current.setFrame(0);
            } else {
              playerRef.current?.goToAndStop(0, true);
            }
          }
          break;
        case PLAY_STATE.SEEKING: {
          if (selectedPlayer === 'lottie-web') {
            // Convert progress to percentage for LottieWeb
            playerRef.current.goToAndStop(progress, false);
          } else {
            if (playerRef.current?.setFrame) {
              playerRef.current?.setFrame(progress);
            } else {
              playerRef.current?.goToAndStop(progress, true);
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error('Player action failed:', error);
    }
  }, [playState, loop, progress, selectedPlayer]);

  const handlePlayerLoad = (ref: any) => {
    setIsLoading(false);
    onLoad?.(ref);
  };

  const renderPlayer = () => {
    const commonProps = {
      ref: playerRef,
      src,
      onLoad: handlePlayerLoad,
      onComplete,
    };

    switch (selectedPlayer) {
      case "react-lottie": {
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ReactLottiePlayer
              {...commonProps}
              ref={(ref) => {
                commonProps.ref.current = ref;
                handlePlayerLoad(ref);
              }}
              lottieRef={(ref) => (commonProps.ref.current = ref)}
            />
          </Suspense>
        );
      }
      case "dotlottie": {
        return (
          <Suspense fallback={<LoadingFallback />}>
            <DotLottie
              {...commonProps}
              ref={(ref) => (commonProps.ref.current = ref)}
              onLoad={(ref) => {
                commonProps.ref.current = ref;
                handlePlayerLoad(ref);
              }}
            />
          </Suspense>
        );
      }
      case "lottie-web": {
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LottieWeb
              {...commonProps}
              ref={(ref: LottieWebRef | null) => {
                if (ref) {
                  playerRef.current = ref;
                  handlePlayerLoad(ref);
                  console.log('ref ==>', ref)
                }
              }}
            />
          </Suspense>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Card size="2" className="relative overflow-hidden">
      <div className="mb-4 flex items-center justify-between">
        <Text as="p" size="2" weight="medium">
          Player Type
        </Text>
        <Select.Root
          defaultValue={initialPlayer}
          onValueChange={(value) => {
            setIsLoading(true);
            setSelectedPlayer(value as PlayerType);
          }}
        >
          <Select.Trigger className="w-[180px]" />
          <Select.Content>
            <Select.Group>
              <Select.Item value="react-lottie">
                React Lottie Player
              </Select.Item>
              <Select.Item value="dotlottie">DotLottie Player</Select.Item>
              <Select.Item value="lottie-web">Lottie Web</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </div>

      <div className="min-h-[200px] w-full relative">
        {isLoading && <LoadingFallback />}
        {renderPlayer()}
      </div>
    </Card>
  );
};

PlayerCard.displayName = "PlayerCard";

export default PlayerCard;
