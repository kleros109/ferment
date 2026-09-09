import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  'relative w-full rounded-2xl border p-4 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default:
          'bg-stone-50 text-stone-900 border-stone-200 dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800',
        destructive:
          'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-200 [&>svg]:text-rose-600 dark:[&>svg]:text-rose-400',
        amber:
          'border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-100 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
        emerald:
          'border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-100 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400',
        sky:
          'border-sky-200 bg-sky-50/80 text-sky-950 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-100 [&>svg]:text-sky-600 dark:[&>svg]:text-sky-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-xs sm:text-sm [&_p]:leading-relaxed text-stone-600 dark:text-stone-300', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';
