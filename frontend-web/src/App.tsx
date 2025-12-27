import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

// Auth Pages - No lazy (needed for initial load)
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard - No lazy (needed for initial load)
import Dashboard from './pages/Dashboard'

// 404 Page - No lazy (needed for error handling)
import NotFound from './pages/NotFound'

// Lazy loaded modules
// Votantes
const VotantesListado = lazy(() => import('./pages/votantes/VotantesListado'))
const VotanteForm = lazy(() => import('./pages/votantes/VotanteForm'))
const VotanteDetalle = lazy(() => import('./pages/votantes/VotanteDetalle'))

// Segmentos
const SegmentosListado = lazy(() => import('./pages/segmentos/SegmentosListado'))
const SegmentoForm = lazy(() => import('./pages/segmentos/SegmentoForm'))
const SegmentoDetalle = lazy(() => import('./pages/segmentos/SegmentoDetalle'))

// Eventos
const EventosListado = lazy(() => import('./pages/eventos/EventosListado'))
const EventoForm = lazy(() => import('./pages/eventos/EventoForm'))
const EventoDetalle = lazy(() => import('./pages/eventos/EventoDetalle'))

// Comunicación
const TemplatesListado = lazy(() => import('./pages/comunicacion/TemplatesListado'))
const TemplateForm = lazy(() => import('./pages/comunicacion/TemplateForm'))
const CampanasListado = lazy(() => import('./pages/comunicacion/CampanasListado'))
const CampanaForm = lazy(() => import('./pages/comunicacion/CampanaForm'))
const MensajesHistorial = lazy(() => import('./pages/comunicacion/MensajesHistorial'))

// Donaciones
const DonacionesListado = lazy(() => import('./pages/donaciones/DonacionesListado'))
const DonacionForm = lazy(() => import('./pages/donaciones/DonacionForm'))
const DonantesListado = lazy(() => import('./pages/donaciones/DonantesListado'))
const DonanteForm = lazy(() => import('./pages/donaciones/DonanteForm'))
const RecibosListado = lazy(() => import('./pages/donaciones/RecibosListado'))

// Gastos
const GastosListado = lazy(() => import('./pages/gastos/GastosListado'))
const GastoForm = lazy(() => import('./pages/gastos/GastoForm'))
const PresupuestoPanel = lazy(() => import('./pages/gastos/PresupuestoPanel'))

// Analytics
const AnalyticsDashboard = lazy(() => import('./pages/analytics/AnalyticsDashboard'))
const AnalyticsVotantes = lazy(() => import('./pages/analytics/AnalyticsVotantes'))
const AnalyticsFinanciero = lazy(() => import('./pages/analytics/AnalyticsFinanciero'))
const ReportesExportables = lazy(() => import('./pages/analytics/ReportesExportables'))

// Settings
const ConfiguracionPage = lazy(() => import('./pages/settings/ConfiguracionPage'))
const PerfilPage = lazy(() => import('./pages/settings/PerfilPage'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes - Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

          {/* Protected routes - Votantes */}
          <Route
            path="/votantes"
            element={
              <ProtectedRoute>
                <VotantesListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/votantes/nuevo"
            element={
              <ProtectedRoute>
                <VotanteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/votantes/:id"
            element={
              <ProtectedRoute>
                <VotanteDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/votantes/:id/editar"
            element={
              <ProtectedRoute>
                <VotanteForm />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Segmentos */}
          <Route
            path="/segmentos"
            element={
              <ProtectedRoute>
                <SegmentosListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/segmentos/nuevo"
            element={
              <ProtectedRoute>
                <SegmentoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/segmentos/:id"
            element={
              <ProtectedRoute>
                <SegmentoDetalle />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Eventos */}
          <Route
            path="/eventos"
            element={
              <ProtectedRoute>
                <EventosListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/nuevo"
            element={
              <ProtectedRoute>
                <EventoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/:id"
            element={
              <ProtectedRoute>
                <EventoDetalle />
              </ProtectedRoute>
            }
          />
          <Route
            path="/eventos/:id/editar"
            element={
              <ProtectedRoute>
                <EventoForm />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Comunicación */}
          <Route
            path="/comunicacion/templates"
            element={
              <ProtectedRoute>
                <TemplatesListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunicacion/templates/nuevo"
            element={
              <ProtectedRoute>
                <TemplateForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunicacion/templates/:id/editar"
            element={
              <ProtectedRoute>
                <TemplateForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunicacion/campanas"
            element={
              <ProtectedRoute>
                <CampanasListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunicacion/campanas/nuevo"
            element={
              <ProtectedRoute>
                <CampanaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunicacion/campanas/:id/editar"
            element={
              <ProtectedRoute>
                <CampanaForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunicacion/mensajes"
            element={
              <ProtectedRoute>
                <MensajesHistorial />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Donaciones */}
          <Route
            path="/donaciones"
            element={
              <ProtectedRoute>
                <DonacionesListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donaciones/nuevo"
            element={
              <ProtectedRoute>
                <DonacionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donaciones/donantes"
            element={
              <ProtectedRoute>
                <DonantesListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donaciones/donantes/nuevo"
            element={
              <ProtectedRoute>
                <DonanteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donaciones/donantes/:id/editar"
            element={
              <ProtectedRoute>
                <DonanteForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donaciones/recibos"
            element={
              <ProtectedRoute>
                <RecibosListado />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Gastos */}
          <Route
            path="/gastos"
            element={
              <ProtectedRoute>
                <GastosListado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gastos/nuevo"
            element={
              <ProtectedRoute>
                <GastoForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gastos/presupuesto"
            element={
              <ProtectedRoute>
                <PresupuestoPanel />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/votantes"
            element={
              <ProtectedRoute>
                <AnalyticsVotantes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/financiero"
            element={
              <ProtectedRoute>
                <AnalyticsFinanciero />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics/reportes"
            element={
              <ProtectedRoute>
                <ReportesExportables />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - Settings */}
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <PerfilPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
                <ConfiguracionPage />
              </ProtectedRoute>
            }
          />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        </ToastProvider>
      </AuthProvider>
    </Router>
    </ErrorBoundary>
  )
}

export default App
