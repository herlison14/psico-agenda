import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

interface CardSectionProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className, hover }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'transition-shadow duration-200 hover:shadow-[var(--shadow-lg)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-[--color-border]', className)}>
      {children}
    </div>
  )
}

export function CardBody({ children, className }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-5', className)}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-[--color-border] bg-[--color-surface-2] rounded-b-2xl',
        className
      )}
    >
      {children}
    </div>
  )
}
