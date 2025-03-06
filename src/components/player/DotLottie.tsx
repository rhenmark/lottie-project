import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const DotLottie = (props: {src: string, onLoad: (ref: any) => void}) => {
  return (
    <div className="p-2">
      <DotLottieReact
        src={props.src}
        dotLottieRefCallback={props.onLoad}
        className="w-[300px] h-[300px]"
      />
    </div>
  );
};

export default DotLottie;
