import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  children?: React.ReactNode   // slot direito (botões, filtros, etc.)
  className?: string
}

export function PageHeader({ title, subtitle, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-6 flex-wrap gap-3', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="page-header-icon">
            <Icon className="w-5 h-5 text-[--color-navy]" strokeWidth={1.75} />
          </div>
        )}
        <div>
          <h1 className="font-display text-2xl text-[--color-text-primary]">{title}</h1>
          {subtitle && (
            <p className="text-sm text-[--color-text-muted] mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-2 flex-wrap">{children}</div>}
    </div>
  )
}
