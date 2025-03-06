import { IconButton, Slider } from "@radix-ui/themes";
import { Minus, Plus } from "lucide-react";

const ZoomControl = ({
  scale,
  onScaleChange,
  min,
  max,
  step,
}: {
  scale: number;
  onScaleChange: (scale: number) => void;
  min: number;
  max: number;
  step: number;
}) => {
  return (
    <div className="min-w-[200px] flex items-center gap-2">
      <IconButton
        size="1"
        variant="ghost"
        disabled={scale <= min}
        onClick={() => onScaleChange(scale - 0.1)}
      >
        <Minus />
      </IconButton>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[scale]}
        onValueChange={(value) => onScaleChange(value[0])}
        size="1"
      />
      <IconButton
        size="1"
        variant="ghost"
        disabled={scale >= 2}
        onClick={() => onScaleChange(scale + 0.1)}
      >
        <Plus />
      </IconButton>
    </div>
  );
};

export default ZoomControl;
