import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useRef } from "react";
import { useEffect } from "react";

const DotLottie = (props: {src: string, onLoad: (ref: any) => void, scale: number}) => {
  const dotRef = useRef<any | null>(null);

  useEffect(() => {
    if (dotRef.current) {
      dotRef.current.canvas.style.transform = `scale(${props.scale})`;
    }
  }, [props.scale]);


  return (
    <div className="p-2 grid place-items-center">
      <DotLottieReact
        src={props.src}
        dotLottieRefCallback={(ref) => {
          props.onLoad(ref);
          dotRef.current = ref;
        }}
        className={`w-[300px] h-[300px]`}
        id="dotlottie-player"
      />
    </div>
  );
};

export default DotLottie;
