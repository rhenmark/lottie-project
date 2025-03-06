import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const DotLottie = (props: {src: string, onLoad: (ref: any) => void}) => {
  return (
    <div className="p-2">
      <h4>DotLottie</h4>
      <DotLottieReact
        src={props.src}
        dotLottieRefCallback={props.onLoad}
      />
    </div>
  );
};

export default DotLottie;
