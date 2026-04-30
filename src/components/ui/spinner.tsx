import { cn } from '@/lib/utils'

interface SpinnerProps { className?: string; size?: 'sm' | 'md' | 'lg' }

const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn('spinner', sizes[size], className)}
    />
  )
}

export function SpinnerPage() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )
}
