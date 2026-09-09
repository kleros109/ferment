import * as React from 'react';
import { cn } from '../../lib/utils';

export interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange?: (value: number) => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ value, min, max, step = 1, onValueChange, className, disabled, 'aria-label': ariaLabel, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center py-2', className)}>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
          onChange={(e) => onValueChange?.(Number(e.target.value))}
          style={{ '--fill': `${percentage}%` } as React.CSSProperties}
          className="w-full h-2.5 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';
