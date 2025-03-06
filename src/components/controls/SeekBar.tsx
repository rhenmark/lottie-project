import React, { useState, useRef, useEffect } from "react";

interface SeekBarProps {
  totalFrames: number;
  currentFrame: number;
  fps?: number;
  onSeek: (frame: number) => void;
  disabled?: boolean;
}

const SeekBar: React.FC<SeekBarProps> = ({
  totalFrames,
  currentFrame,
  fps = 30,
  onSeek,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Calculate progress percentage
  const progress = (currentFrame / totalFrames) * 100;

  const handleSeek = (clientX: number) => {
    if (disabled) return;

    if (!progressBarRef.current) return;

    const progressBar = progressBarRef.current;
    const rect = progressBar.getBoundingClientRect();
    const clickPositionInBar = clientX - rect.left;
    const barWidth = rect.width;

    // Calculate percentage
    const seekPercentage = (clickPositionInBar / barWidth) * 100;
    const clampedPercentage = Math.max(0, Math.min(100, seekPercentage));

    // Calculate frame number (whole number)
    const seekFrame = Math.round((clampedPercentage / 100) * totalFrames);

    // Call onSeek callback with new frame
    onSeek(seekFrame);
  };

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleSeek(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (disabled || !isDragging) return;
    handleSeek(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleSeek(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !isDragging) return;
    handleSeek(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging && !disabled) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, disabled]);

  return (
    <div className="flex flex-col space-y-2 mr-2 ">
      <div
        ref={progressBarRef}
        className={`w-full min-w-60 h-2 rounded-full cursor-pointer relative 
          ${
            disabled
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-gray-300 cursor-pointer"
          }`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove as any}
        onTouchEnd={handleTouchEnd}
      >
        {/* Progress Fill */}
        <div
          className={`absolute h-full rounded-full top-0 left-0 
            ${disabled ? "bg-gray-400" : "bg-blue-500"}`}
          style={{ width: `${progress}%` }}
        />

        {/* Seek Handle */}
        <div
          className={`absolute w-4 h-4 rounded-full -top-1 transform -translate-x-1/2
            ${disabled ? "bg-gray-500" : "bg-blue-600"}`}
          style={{ left: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default SeekBar;
