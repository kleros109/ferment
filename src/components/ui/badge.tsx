import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-amber-600 text-white shadow-xs dark:bg-amber-500 dark:text-stone-950',
        secondary:
          'bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100',
        destructive:
          'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200 border border-rose-300 dark:border-rose-800',
        outline:
          'text-stone-800 border border-stone-200 dark:text-stone-200 dark:border-stone-800',
        amber:
          'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700/60',
        emerald:
          'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60',
        sky:
          'bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/80 dark:border-sky-700/60',
        orange:
          'bg-orange-100 text-orange-900 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-300/80 dark:border-orange-700/60',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<'div'>,
    VariantProps<typeof badgeVariants> {
  pulseDot?: boolean;
}

export function Badge({ className, variant, pulseDot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {pulseDot && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </div>
  );
}

export { badgeVariants };
