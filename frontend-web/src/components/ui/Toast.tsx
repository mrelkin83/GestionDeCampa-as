import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-600'
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-600'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600'
  }
}

export default function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  const config = toastConfig[type]
  const Icon = config.icon

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right-full',
        config.bgColor,
        config.borderColor
      )}
    >
      <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
      <p className={cn('text-sm font-medium flex-1', config.textColor)}>
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className={cn('flex-shrink-0 hover:opacity-70 transition-opacity', config.textColor)}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
