import {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import lottie, { AnimationItem } from "lottie-web";

interface LottieWebProps {
  src?: string;
  onLoad?: (container?: HTMLDivElement | null) => void;
  onComplete?: () => void;
  loop?: boolean;
  autoplay?: boolean;
  renderer?: "svg" | "canvas" | "html";
}

export interface LottieWebRef {
  play: () => void;
  pause: () => void;
  stop: () => void;
  goToAndStop: (frame: number, isFrame?: boolean) => void;
  getDuration: (inFrames?: boolean) => number;
  setLoop: (loop: boolean) => void;
}

const LottieWeb = forwardRef<LottieWebRef, LottieWebProps>(
  (
    {
      src,
      onLoad,
      onComplete,
      loop = false,
      autoplay = false,
      renderer = "svg",
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<AnimationItem | null>(null);

    useEffect(() => {
      if (!containerRef.current) return;

      // Cleanup previous animation if it exists
      if (animationRef.current) {
        animationRef.current.destroy();
      }

      // Load animation
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        path: src,
        renderer: renderer,
        loop: loop,
        autoplay: autoplay,
        name: "Lottie Animation",
      });

      // Store animation reference
      animationRef.current = anim;

      // Event listeners
      const handleDOMLoaded = () => {
        console.log("LottieWeb Animation DOM Loaded");
        onLoad?.(containerRef.current);
      };

      const handleComplete = () => {
        console.log("LottieWeb Animation Completed");
        onComplete?.();
      };

      anim.addEventListener("DOMLoaded", handleDOMLoaded);
      anim.addEventListener("complete", handleComplete);

      // Cleanup
      return () => {
        anim.removeEventListener("DOMLoaded", handleDOMLoaded);
        anim.removeEventListener("complete", handleComplete);
        anim.destroy();
        animationRef.current = null;
      };
    }, [src, loop, autoplay, renderer, onLoad, onComplete]);

    // Expose animation controls via ref
    useImperativeHandle(ref, () => ({
      play: () => animationRef.current?.play(),
      pause: () => animationRef.current?.pause(),
      stop: () => animationRef.current?.stop(),
      goToAndStop: (frame: number, isFrame?: boolean) => {
        animationRef.current?.goToAndStop(frame, isFrame)
      },
      getDuration: (inFrames?: boolean) =>
        animationRef.current?.getDuration(inFrames) || 0,
      setLoop: (value: boolean) => {
        if (animationRef.current) {
          animationRef.current.setLoop(value);
        }
      },
    }));

    return (
      <div className="p-2">
        <div
          ref={containerRef}
          id="lottieWeb"
          className="w-full h-64"
        />
      </div>
    );
  }
);

export default LottieWeb;