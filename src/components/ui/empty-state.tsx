import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {Icon && (
        <div className="stat-icon bg-[--color-navy-light] mb-4 p-4 rounded-2xl">
          <Icon className="w-8 h-8 text-[--color-navy]" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-base font-semibold text-[--color-text-primary]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[--color-text-muted] max-w-sm">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
