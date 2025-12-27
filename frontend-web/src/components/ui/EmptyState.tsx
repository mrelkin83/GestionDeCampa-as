import { LucideIcon, Inbox, Search, Lock, AlertCircle, FileQuestion, Sparkles } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type EmptyStateVariant = 'no-data' | 'no-results' | 'no-access' | 'error' | 'coming-soon' | 'custom'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
  className?: string
}

const variantConfig: Record<EmptyStateVariant, { icon: LucideIcon; iconColor: string }> = {
  'no-data': {
    icon: Inbox,
    iconColor: 'text-gray-400'
  },
  'no-results': {
    icon: Search,
    iconColor: 'text-gray-400'
  },
  'no-access': {
    icon: Lock,
    iconColor: 'text-yellow-500'
  },
  'error': {
    icon: AlertCircle,
    iconColor: 'text-red-500'
  },
  'coming-soon': {
    icon: Sparkles,
    iconColor: 'text-primary-500'
  },
  'custom': {
    icon: FileQuestion,
    iconColor: 'text-gray-400'
  }
}

export default function EmptyState({
  variant = 'no-data',
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className
}: EmptyStateProps) {
  const config = variantConfig[variant]
  const Icon = CustomIcon || config.icon

  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      <div className="mb-4">
        <Icon className={cn('w-16 h-16', config.iconColor)} strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Custom Content */}
      {children && (
        <div className="mb-6">
          {children}
        </div>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Convenience components for common scenarios
interface EmptyListProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyVotantesList({ title, description, actionLabel, onAction }: EmptyListProps) {
  return (
    <EmptyState
      variant="no-data"
      title={title || 'No hay votantes registrados'}
      description={description || 'Comienza agregando tu primer votante a la base de datos'}
      action={onAction ? {
        label: actionLabel || 'Agregar Votante',
        onClick: onAction
      } : undefined}
    />
  )
}

export function EmptySegmentosList({ title, description, actionLabel, onAction }: EmptyListProps) {
  return (
    <EmptyState
      variant="no-data"
      title={title || 'No hay segmentos creados'}
      description={description || 'Los segmentos te permiten agrupar votantes con características comunes'}
      action={onAction ? {
        label: actionLabel || 'Crear Segmento',
        onClick: onAction
      } : undefined}
    />
  )
}

export function EmptyEventosList({ title, description, actionLabel, onAction }: EmptyListProps) {
  return (
    <EmptyState
      variant="no-data"
      title={title || 'No hay eventos programados'}
      description={description || 'Organiza reuniones, mítines y actividades para tu campaña'}
      action={onAction ? {
        label: actionLabel || 'Crear Evento',
        onClick: onAction
      } : undefined}
    />
  )
}

export function EmptyDonacionesList({ title, description, actionLabel, onAction }: EmptyListProps) {
  return (
    <EmptyState
      variant="no-data"
      title={title || 'No hay donaciones registradas'}
      description={description || 'Registra las donaciones recibidas para tu campaña'}
      action={onAction ? {
        label: actionLabel || 'Registrar Donación',
        onClick: onAction
      } : undefined}
    />
  )
}

export function EmptyGastosList({ title, description, actionLabel, onAction }: EmptyListProps) {
  return (
    <EmptyState
      variant="no-data"
      title={title || 'No hay gastos registrados'}
      description={description || 'Lleva un control detallado de los gastos de tu campaña'}
      action={onAction ? {
        label: actionLabel || 'Registrar Gasto',
        onClick: onAction
      } : undefined}
    />
  )
}

export function EmptySearchResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      variant="no-results"
      title="No se encontraron resultados"
      description={`No encontramos ningún resultado para "${query}". Intenta con otros términos de búsqueda.`}
      action={{
        label: 'Limpiar Búsqueda',
        onClick: onClear
      }}
    />
  )
}

export function EmptyAccessDenied() {
  return (
    <EmptyState
      variant="no-access"
      title="Acceso Denegado"
      description="No tienes los permisos necesarios para acceder a esta sección. Contacta al administrador si crees que esto es un error."
    />
  )
}

export function EmptyError({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      variant="error"
      title="Ocurrió un Error"
      description={message || 'No pudimos cargar la información. Por favor intenta nuevamente.'}
      action={onRetry ? {
        label: 'Reintentar',
        onClick: onRetry
      } : undefined}
    />
  )
}

export function EmptyComingSoon({ feature }: { feature: string }) {
  return (
    <EmptyState
      variant="coming-soon"
      title="Próximamente"
      description={`La función "${feature}" estará disponible muy pronto. Estamos trabajando para ofrecerte la mejor experiencia.`}
    />
  )
}
