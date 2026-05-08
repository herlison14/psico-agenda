import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-navy] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:   'bg-[--color-navy] text-white hover:bg-[--color-navy-mid] active:scale-[0.98]',
        secondary: 'bg-[--color-navy-light] text-[--color-navy] border border-[--color-navy-ring] hover:bg-[--color-border]',
        ghost:     'border border-[--color-border] text-[--color-text-secondary] hover:bg-[--color-surface-2]',
        danger:    'bg-[--color-danger] text-white hover:brightness-90 active:scale-[0.98]',
        link:      'text-[--color-navy] underline-offset-4 hover:underline p-0 h-auto font-normal',
      },
      size: {
        sm:   'text-xs px-3 py-1.5 rounded-lg',
        md:   'text-sm px-5 py-2.5 rounded-xl',
        lg:   'text-base px-8 py-4 rounded-xl',
        icon: 'w-9 h-9 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && <span className="spinner w-4 h-4 shrink-0" aria-hidden />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
