import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-manipulation select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-amber-600 text-white shadow-sm hover:bg-amber-700 active:scale-[0.98] dark:bg-amber-500 dark:text-stone-950 dark:hover:bg-amber-400 font-semibold',
        secondary:
          'bg-stone-100 text-stone-800 hover:bg-stone-200 active:scale-[0.98] dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
        outline:
          'border border-stone-200 bg-white/80 hover:bg-stone-100/80 text-stone-800 active:scale-[0.98] dark:border-stone-800 dark:bg-stone-900/80 dark:text-stone-200 dark:hover:bg-stone-800',
        ghost:
          'hover:bg-stone-100 text-stone-700 active:scale-[0.98] dark:text-stone-300 dark:hover:bg-stone-800/80',
        link: 'text-amber-600 underline-offset-4 hover:underline dark:text-amber-400 p-0 h-auto',
        destructive:
          'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] dark:bg-rose-900 dark:text-rose-100 dark:hover:bg-rose-800',
        amber:
          'bg-amber-500/15 text-amber-900 border border-amber-500/30 hover:bg-amber-500/25 active:scale-[0.98] dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30 dark:hover:bg-amber-500/30 font-medium',
        emerald:
          'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.98] dark:bg-emerald-600 dark:hover:bg-emerald-500 font-semibold',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-11 rounded-xl px-5 text-base font-semibold',
        icon: 'h-9 w-9 p-0 shrink-0',
        'icon-sm': 'h-7 w-7 rounded-lg p-0 shrink-0',
        'icon-lg': 'h-11 w-11 rounded-xl p-0 shrink-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };
