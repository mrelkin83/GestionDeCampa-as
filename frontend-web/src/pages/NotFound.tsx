import { useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-2">404</h1>
          <div className="flex justify-center gap-2">
            <div className="w-16 h-1 bg-primary-600 rounded"></div>
            <div className="w-16 h-1 bg-primary-400 rounded"></div>
            <div className="w-16 h-1 bg-primary-300 rounded"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Página No Encontrada
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver Atrás</span>
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            <span>Ir al Dashboard</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4 text-gray-700">
            <Search className="w-5 h-5" />
            <h3 className="font-semibold">Enlaces Rápidos</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button
              onClick={() => navigate('/votantes')}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
            >
              👥 Votantes
            </button>
            <button
              onClick={() => navigate('/eventos')}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
            >
              📅 Eventos
            </button>
            <button
              onClick={() => navigate('/donaciones')}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
            >
              🎁 Donaciones
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors text-gray-700"
            >
              📊 Analytics
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-500">
          Si crees que esto es un error, contacta al administrador.
        </p>
      </div>
    </div>
  )
}
