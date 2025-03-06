import { forwardRef } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

interface LottieWebProps {
  onLoad?: () => void;
  onComplete?: () => void;
  lottieRef?: (ref: Player) => void;
  src: string;
}

const ReactLottiePlayer = forwardRef<Player, LottieWebProps>(({ onLoad, onComplete, src }, ref) => {
  return (
    <div className='p-2'>
        <Player
            lottieRef={ref}
            src={src}
            style={{ height: "300px", width: "300px" }}
            onEvent={(event) => {
                if (event === 'load') onLoad?.();
                if (event === 'complete') onComplete?.();
            }}
            />
    </div>
    
  );
});

export default ReactLottiePlayer;