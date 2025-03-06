import { forwardRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

interface LottieWebProps {
  onLoad?: () => void;
  onComplete?: () => void;
  lottieRef?: (ref: Player) => void;
  src: string;
  scale?: number;
}

const ReactLottiePlayer = forwardRef<Player, LottieWebProps>(({ onLoad, onComplete, src, scale = 1 }, ref) => {
  return (
    <div className='p-2 grid place-items-center'>
        <Player
            lottieRef={ref}
            src={src}
            style={{ height: "300px", width: "300px", transform: `scale(${scale})` }}
            onEvent={(event) => {
                if (event === 'load') onLoad?.();
                if (event === 'complete') onComplete?.();
            }}
            />
    </div>
    
  );
});

export default ReactLottiePlayer;