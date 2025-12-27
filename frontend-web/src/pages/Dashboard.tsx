import { Users, Calendar, MessageSquare, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  color: string
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Votantes',
      value: '15,234',
      icon: Users,
      trend: { value: 12, isPositive: true },
      color: 'bg-blue-500',
    },
    {
      title: 'Eventos Próximos',
      value: '8',
      icon: Calendar,
      trend: { value: 3, isPositive: true },
      color: 'bg-green-500',
    },
    {
      title: 'Mensajes Enviados',
      value: '45,678',
      icon: MessageSquare,
      trend: { value: 8, isPositive: true },
      color: 'bg-purple-500',
    },
    {
      title: 'Donaciones',
      value: '$128,450',
      icon: DollarSign,
      trend: { value: 5, isPositive: false },
      color: 'bg-yellow-500',
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Bienvenido a la Plataforma Electoral</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              {[
                { action: 'Nuevo votante registrado', time: 'Hace 5 minutos', user: 'María González' },
                { action: 'Evento creado', time: 'Hace 1 hora', user: 'Carlos Ruiz' },
                { action: 'Mensaje enviado', time: 'Hace 2 horas', user: 'Ana López' },
                { action: 'Donación recibida', time: 'Hace 3 horas', user: 'Pedro Martínez' },
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.user} - {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Eventos</h2>
            <div className="space-y-4">
              {[
                { name: 'Reunión Comunitaria', date: '28 Dic 2025', location: 'Plaza Central', attendees: 45 },
                { name: 'Puerta a Puerta', date: '30 Dic 2025', location: 'Barrio Norte', attendees: 12 },
                { name: 'Conferencia de Prensa', date: '2 Ene 2026', location: 'Hotel Imperial', attendees: 80 },
              ].map((event, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">{event.name}</h3>
                  <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                    <span>{event.date}</span>
                    <span>{event.attendees} asistentes</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
