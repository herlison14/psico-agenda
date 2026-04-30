import { cn } from '@/lib/utils'

type BadgeVariant = 'blue' | 'green' | 'red' | 'amber' | 'neutral'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variants: Record<BadgeVariant, string> = {
  blue:    'badge badge-blue',
  green:   'badge badge-green',
  red:     'badge badge-red',
  amber:   'badge badge-amber',
  neutral: 'badge badge-neutral',
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}
