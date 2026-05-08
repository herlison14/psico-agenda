import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

type KpiVariant = 'default' | 'teal' | 'emerald' | 'indigo' | 'amber' | 'violet' | 'royal' | 'glass'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconBg?: string
  iconColor?: string
  className?: string
  variant?: KpiVariant
}

const variantMap: Record<KpiVariant, { card: string; icon: string; iconWrap: string; label: string; value: string }> = {
  default: {
    card:     'card p-5 flex items-center gap-4',
    icon:     'text-[--color-navy]',
    iconWrap: 'stat-icon bg-[--color-navy-light]',
    label:    'text-xs font-semibold uppercase tracking-wide text-[--color-text-muted] truncate',
    value:    'text-2xl font-bold text-[--color-text-primary] mt-0.5 tabular-nums',
  },
  teal: {
    card:     'kpi-card kpi-teal p-5 flex items-center gap-4',
    icon:     'text-white',
    iconWrap: 'stat-icon bg-white/20',
    label:    'text-xs font-semibold uppercase tracking-wide text-white/70 truncate',
    value:    'text-2xl font-bold text-white mt-0.5 tabular-nums font-display',
  },
  emerald: {
    card:     'kpi-card kpi-emerald p-5 flex items-center gap-4',
    icon:     'text-white',
    iconWrap: 'stat-icon bg-white/20',
    label:    'text-xs font-semibold uppercase tracking-wide text-white/70 truncate',
    value:    'text-2xl font-bold text-white mt-0.5 tabular-nums font-display',
  },
  indigo: {
    card:     'kpi-card kpi-indigo p-5 flex items-center gap-4',
    icon:     'text-white',
    iconWrap: 'stat-icon bg-white/20',
    label:    'text-xs font-semibold uppercase tracking-wide text-white/70 truncate',
    value:    'text-2xl font-bold text-white mt-0.5 tabular-nums font-display',
  },
  amber: {
    card:     'kpi-card kpi-amber p-5 flex items-center gap-4',
    icon:     'text-white',
    iconWrap: 'stat-icon bg-white/20',
    label:    'text-xs font-semibold uppercase tracking-wide text-white/70 truncate',
    value:    'text-2xl font-bold text-white mt-0.5 tabular-nums font-display',
  },
  violet: {
    card:     'kpi-card kpi-violet p-5 flex items-center gap-4',
    icon:     'text-white',
    iconWrap: 'stat-icon bg-white/20',
    label:    'text-xs font-semibold uppercase tracking-wide text-white/70 truncate',
    value:    'text-2xl font-bold text-white mt-0.5 tabular-nums font-display',
  },
  royal: {
    card:     'kpi-card kpi-royal p-5 flex items-center gap-4',
    icon:     'text-white',
    iconWrap: 'stat-icon bg-white/20',
    label:    'text-xs font-semibold uppercase tracking-wide text-white/70 truncate',
    value:    'text-2xl font-bold text-white mt-0.5 tabular-nums font-display',
  },
  glass: {
    card:     'kpi-card kpi-glass p-5 flex items-center gap-4',
    icon:     'text-[--color-navy]',
    iconWrap: 'stat-icon bg-[--color-navy-light]',
    label:    'text-xs font-semibold uppercase tracking-wide text-[--color-text-muted] truncate',
    value:    'text-2xl font-bold text-[--color-text-primary] mt-0.5 tabular-nums',
  },
}

export function StatCard({
  label, value, icon: Icon,
  iconBg,
  iconColor,
  className,
  variant = 'default',
}: StatCardProps) {
  const v = variantMap[variant]

  // legacy overrides (iconBg / iconColor) only apply in default/glass variant
  const iconWrapClass = (variant === 'default' || variant === 'glass') && iconBg ? iconBg : v.iconWrap
  const iconClass = (variant === 'default' || variant === 'glass') && iconColor
    ? cn('w-5 h-5', iconColor)
    : cn('w-5 h-5', v.icon)

  return (
    <div className={cn(v.card, className)}>
      <div className={cn('stat-icon', iconWrapClass)}>
        <Icon className={iconClass} strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <p className={v.label}>{label}</p>
        <p className={v.value}>{value}</p>
      </div>
    </div>
  )
}
