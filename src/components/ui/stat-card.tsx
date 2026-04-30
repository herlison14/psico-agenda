import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  className?: string
}

export function StatCard({
  label, value, icon: Icon,
  iconBg = 'bg-[--color-navy-light]',
  iconColor = 'text-[--color-navy]',
  className,
}: StatCardProps) {
  return (
    <div className={cn('card p-5 flex items-center gap-4', className)}>
      <div className={cn('stat-icon', iconBg)}>
        <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[--color-text-muted] truncate">
          {label}
        </p>
        <p className="text-2xl font-bold text-[--color-text-primary] mt-0.5 tabular-nums">
          {value}
        </p>
      </div>
    </div>
  )
}
