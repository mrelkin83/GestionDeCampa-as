import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  path?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  votantes: 'Votantes',
  segmentos: 'Segmentos',
  eventos: 'Eventos',
  comunicacion: 'Comunicación',
  templates: 'Templates',
  campanas: 'Campañas',
  mensajes: 'Mensajes',
  donaciones: 'Donaciones',
  donantes: 'Donantes',
  recibos: 'Recibos',
  gastos: 'Gastos',
  presupuesto: 'Presupuesto',
  analytics: 'Analytics',
  financiero: 'Financiero',
  reportes: 'Reportes',
  perfil: 'Perfil',
  configuracion: 'Configuración',
  nuevo: 'Nuevo',
  editar: 'Editar'
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation()

  // Si se proporcionan items manualmente, usarlos
  if (items) {
    return (
      <nav className={cn('flex items-center gap-2 text-sm', className)}>
        <Link
          to="/dashboard"
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            {item.path && index < items.length - 1 ? (
              <Link
                to={item.path}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    )
  }

  // Auto-generar breadcrumbs desde la ruta actual
  const pathSegments = location.pathname.split('/').filter(Boolean)

  if (pathSegments.length === 0 || pathSegments[0] === 'dashboard') {
    return null // No mostrar breadcrumbs en el dashboard principal
  }

  const breadcrumbItems: BreadcrumbItem[] = []
  let currentPath = ''

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Si es un ID numérico, usar el label del segmento anterior + "Detalle"
    if (/^\d+$/.test(segment)) {
      const prevLabel = breadcrumbItems[breadcrumbItems.length - 1]?.label || 'Item'
      breadcrumbItems.push({
        label: `${prevLabel} #${segment}`,
        path: currentPath
      })
    } else {
      const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      breadcrumbItems.push({
        label,
        path: index < pathSegments.length - 1 ? currentPath : undefined
      })
    }
  })

  return (
    <nav className={cn('flex items-center gap-2 text-sm mb-4', className)}>
      <Link
        to="/dashboard"
        className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.path ? (
            <Link
              to={item.path}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
