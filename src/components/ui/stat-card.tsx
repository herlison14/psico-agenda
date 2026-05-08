import { cn } from '@/lib/utils'
import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  trend?: { value: number; label?: string }
  className?: string
}

export function StatCard({
  label, value, icon: Icon,
  iconBg = 'bg-[--color-navy-light]',
  iconColor = 'text-[--color-navy]',
  trend,
  className,
}: StatCardProps) {
  const positive = trend && trend.value >= 0
  return (
    <div className={cn('card p-5 flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <div className={cn('stat-icon', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} strokeWidth={1.75} />
        </div>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
              positive
                ? 'bg-[--color-success-bg] text-[--color-success]'
                : 'bg-[--color-danger-bg]  text-[--color-danger]'
            )}
          >
            {positive
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[--color-text-primary] tabular-nums">{value}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-[--color-text-muted] mt-0.5 truncate">
          {label}
        </p>
        {trend?.label && (
          <p className="text-xs text-[--color-text-faint] mt-0.5">{trend.label}</p>
        )}
      </div>
    </div>
  )
}
