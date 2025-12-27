import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Dashboard
import Dashboard from './pages/Dashboard'

// Votantes
import VotantesListado from './pages/votantes/VotantesListado'
import VotanteForm from './pages/votantes/VotanteForm'
import VotanteDetalle from './pages/votantes/VotanteDetalle'

function App() {
  return (
    <Router>
      <AuthProvider>
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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
