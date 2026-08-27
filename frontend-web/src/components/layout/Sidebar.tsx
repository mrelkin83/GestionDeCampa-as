import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingDown,
  BarChart3,
  Settings,
  UserCircle,
  ChevronDown,
  ChevronRight,
  Target,
  Mail,
  Send,
  Gift,
  Receipt,
  Wallet,
  PieChart
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
}

interface SubMenuItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  subItems?: SubMenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard'
  },
  {
    title: 'Votantes',
    icon: Users,
    href: '/votantes',
    subItems: [
      { title: 'Listado', href: '/votantes', icon: Users },
      { title: 'Segmentos', href: '/segmentos', icon: Target },
    ]
  },
  {
    title: 'Eventos',
    icon: Calendar,
    href: '/eventos'
  },
  {
    title: 'Comunicación',
    icon: MessageSquare,
    href: '/comunicacion/templates',
    subItems: [
      { title: 'Templates', href: '/comunicacion/templates', icon: Mail },
      { title: 'Campañas', href: '/comunicacion/campanas', icon: Send },
      { title: 'Mensajes', href: '/comunicacion/mensajes', icon: MessageSquare },
    ]
  },
  {
    title: 'Donaciones',
    icon: Gift,
    href: '/donaciones',
    subItems: [
      { title: 'Donaciones', href: '/donaciones', icon: Gift },
      { title: 'Donantes', href: '/donaciones/donantes', icon: Users },
    ]
  },
  {
    title: 'Gastos',
    icon: TrendingDown,
    href: '/gastos',
    subItems: [
      { title: 'Gastos', href: '/gastos', icon: Wallet },
    ]
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    subItems: [
      { title: 'Dashboard', href: '/analytics', icon: PieChart },
      { title: 'Votantes', href: '/analytics/votantes', icon: Users },
      { title: 'Financiero', href: '/analytics/financiero', icon: DollarSign },
      { title: 'Reportes', href: '/analytics/reportes', icon: Receipt },
    ]
  },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const isParentActive = (item: MenuItem) => {
    if (isActive(item.href)) return true
    if (item.subItems) {
      return item.subItems.some(sub => isActive(sub.href))
    }
    return false
  }

  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-1 font-medium">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hasSubItems = item.subItems && item.subItems.length > 0
              const isExpanded = expandedItems.includes(item.href)
              const isItemActive = isParentActive(item)

              return (
                <li key={item.href}>
                  {hasSubItems ? (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.href)}
                        className={cn(
                          "flex items-center w-full p-2 text-gray-900 rounded-lg hover:bg-gray-100 group",
                          isItemActive && "bg-primary-50 text-primary-700"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900",
                          isItemActive && "text-primary-600"
                        )} />
                        <span className="flex-1 ml-3 text-left">{item.title}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded && item.subItems && (
                        <ul className="mt-1 space-y-1 pl-6">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon
                            return (
                              <li key={subItem.href}>
                                <Link
                                  to={subItem.href}
                                  className={cn(
                                    "flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group text-sm",
                                    isActive(subItem.href) && "bg-primary-100 text-primary-700 font-medium"
                                  )}
                                >
                                  {SubIcon && (
                                    <SubIcon className={cn(
                                      "w-4 h-4 text-gray-500 transition duration-75 group-hover:text-gray-900",
                                      isActive(subItem.href) && "text-primary-600"
                                    )} />
                                  )}
                                  <span className="ml-2">{subItem.title}</span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group",
                        isActive(item.href) && "bg-primary-50 text-primary-700"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900",
                        isActive(item.href) && "text-primary-600"
                      )} />
                      <span className="ml-3">{item.title}</span>
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>

          <hr className="my-4 border-gray-200" />

          <ul className="space-y-1 font-medium">
            <li>
              <Link
                to="/perfil"
                className={cn(
                  "flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group",
                  isActive('/perfil') && "bg-primary-50 text-primary-700"
                )}
              >
                <UserCircle className={cn(
                  "w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900",
                  isActive('/perfil') && "text-primary-600"
                )} />
                <span className="ml-3">Perfil</span>
              </Link>
            </li>
            <li>
              <Link
                to="/configuracion"
                className={cn(
                  "flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group",
                  isActive('/configuracion') && "bg-primary-50 text-primary-700"
                )}
              >
                <Settings className={cn(
                  "w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900",
                  isActive('/configuracion') && "text-primary-600"
                )} />
                <span className="ml-3">Configuración</span>
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}
