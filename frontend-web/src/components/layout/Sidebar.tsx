import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  FileText,
  Settings,
  Map,
  BarChart3,
  UserCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
}

interface MenuItem {
  title: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { title: 'Votantes', icon: Users, href: '/votantes' },
  { title: 'Eventos', icon: Calendar, href: '/eventos' },
  { title: 'Comunicación', icon: MessageSquare, href: '/comunicacion', badge: 3 },
  { title: 'Finanzas', icon: DollarSign, href: '/finanzas' },
  { title: 'Reportes', icon: FileText, href: '/reportes' },
  { title: 'Mapa Electoral', icon: Map, href: '/mapa' },
  { title: 'Analytics', icon: BarChart3, href: '/analytics' },
]

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <>
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
                  >
                    <Icon className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                    <span className="ml-3">{item.title}</span>
                    {item.badge && (
                      <span className="inline-flex items-center justify-center w-5 h-5 ml-auto text-xs font-semibold text-primary-800 bg-primary-100 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
          <hr className="my-4" />
          <ul className="space-y-2 font-medium">
            <li>
              <a
                href="/perfil"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
              >
                <UserCircle className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                <span className="ml-3">Perfil</span>
              </a>
            </li>
            <li>
              <a
                href="/configuracion"
                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 group"
              >
                <Settings className="w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900" />
                <span className="ml-3">Configuración</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  )
}
