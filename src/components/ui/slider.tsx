"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, defaultValue, min = 0, max = 100, step = 1, onValueChange, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(
      value?.[0] ?? defaultValue?.[0] ?? min
    );

    React.useEffect(() => {
      if (value?.[0] !== undefined) {
        setLocalValue(value[0]);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      setLocalValue(newValue);
      if (onValueChange) {
        onValueChange([newValue]);
      }
    };

    // Calculate percentage for the track highlight
    const percentage = ((localValue - Number(min)) / (Number(max) - Number(min))) * 100;

    return (
      <div className={cn("relative flex w-full touch-none items-center select-none py-4", className)}>
        <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute h-full bg-[#00BFA5] transition-all duration-150"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className={cn(
            "absolute inset-0 z-10 h-1.5 w-full cursor-pointer appearance-none bg-transparent",
            // Thumb styling (Webkit)
            "[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-[#00BFA5] [&::-webkit-slider-thumb]:bg-[#030303]",
            "[&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(0,191,165,0.5)]",
            "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-95",
            // Thumb styling (Firefox)
            "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:appearance-none",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2",
            "[&::-moz-range-thumb]:border-[#00BFA5] [&::-moz-range-thumb]:bg-[#030303]",
            "[&::-moz-range-thumb]:shadow-[0_0_12px_rgba(0,191,165,0.5)]",
            "[&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:active:scale-95",
            // Track hiding (it's handled by the div above)
            "[&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-moz-range-track]:bg-transparent"
          )}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
