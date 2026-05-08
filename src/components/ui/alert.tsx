import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

const config: Record<AlertVariant, { icon: React.ElementType; classes: string }> = {
  info:    { icon: Info,          classes: 'bg-[--color-info-bg]    border-[--color-info]    text-[--color-info]' },
  success: { icon: CheckCircle2,  classes: 'bg-[--color-success-bg] border-[--color-success] text-[--color-success]' },
  warning: { icon: AlertTriangle, classes: 'bg-[--color-warning-bg] border-[--color-warning] text-[--color-warning]' },
  danger:  { icon: AlertCircle,   classes: 'bg-[--color-danger-bg]  border-[--color-danger]  text-[--color-danger]' },
}

export function Alert({ variant = 'info', title, children, onClose, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant]
  return (
    <div role="alert" className={cn('flex gap-3 p-4 rounded-xl border', classes, className)}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold leading-tight mb-0.5">{title}</p>}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>
      )}
    </div>
  )
}
