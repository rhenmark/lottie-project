import { useEffect } from "react";
import CanvasKitInit from "canvaskit-wasm";

/**
 * 
 * @deprecated  
 * // documentation is not well maintained. Unable to complete
 */
const SkiaCanvasKit = ({ src }: { src: string }) => {

  useEffect(() => {
    const WIDTH = 1000;
    const HEIGHT = 1000;
    const MAX_FRAMES = 25;
    const MAX_LOOPS = 25;
    const MAX_SAMPLE_MS = 60 * 1000;

    const loadLottie = fetch(src).then((resp) => {
      return resp.text();
    });

    const loadKit = CanvasKitInit({
      locateFile: (file) => "/node_modules/canvaskit-wasm/bin/" + file,
    });

    Promise.all([loadKit, loadLottie]).then((values) => {
      const [CanvasKit, lottie] = values;

      const animation = CanvasKit?.MakeAnimation(lottie);
      if (!animation) {
          window._error = "Could not process JSON";
          return;
        }

      let surface = null;
      if (window.location.hash.indexOf("gpu") !== -1) {
        surface = CanvasKit.MakeWebGLCanvasSurface("anim");
        if (!surface) {
          window._error = "Could not make GPU surface";
          return;
        }
        let c = document.getElementById("anim");
        // If CanvasKit was unable to instantiate a WebGL context, it will fallback
        // to CPU and add a ck-replaced class to the canvas element.
        if (c.classList.contains("ck-replaced")) {
          window._error = "fell back to CPU";
          return;
        }
      } else {
        surface = CanvasKit.MakeSWCanvasSurface("anim");
        if (!surface) {
          window._error = "Could not make CPU surface";
          return;
        }
      }
      const canvas = surface.getCanvas();

      const t_rate = 1.0 / (MAX_FRAMES - 1);
      let seek = 0;
      let frame = 0;
      let loop = 0;
      const damageRect = Float32Array.of(0, 0, 0, 0);
      const bounds = CanvasKit.LTRBRect(0, 0, WIDTH, HEIGHT);
      const start = performance.now();

      const drawFrame = () => {
        if (performance.now() - start > MAX_SAMPLE_MS) {
          // This global variable signals we are done.
          window._skottieDone = true;
          return;
        }
        if (frame >= MAX_FRAMES) {
          // Reached the end of one loop.
          loop++;
          if (loop == MAX_LOOPS) {
            // This global variable signals we are done.
            window._skottieDone = true;
            return;
          }
          // Reset frame and seek to restart the loop.
          frame = 0;
          seek = 0;
        }

        let damage = animation.seek(seek, damageRect);
        if (damage[2] > damage[0] && damage[3] > damage[1]) {
          animation.render(canvas, bounds);
          surface.flush();
        }
        console.log(`Used seek: ${seek}`);
        seek += t_rate;
        frame++;
        window.requestAnimationFrame(drawFrame);
      };
      window.requestAnimationFrame(drawFrame);
      // const lottieJSON = JSON.parse(lottie);
      // const animation = new CanvasKit.Animation(lottieJSON, 0);
      // const surface = CanvasKit.Surface.MakeCanvas(canvas);
      // const canvasKit = CanvasKit.CanvasKit.Make(surface);
      // const renderer = new CanvasKit.LottieRenderer(canvasKit, animation);
      // renderer.render(0);
    });
  }, []);
  return <canvas id="anim">SkiaCanvasKit</canvas>;
};

export default SkiaCanvasKit;
