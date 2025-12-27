import { Component, ReactNode, ErrorInfo } from 'react'
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error reporting service
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Algo salió mal!
            </h1>

            <p className="text-gray-600 mb-6">
              Lo sentimos, ha ocurrido un error inesperado. Por favor intenta nuevamente.
            </p>

            {this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
                  Ver detalles técnicos
                </summary>
                <div className="p-4 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <pre className="mt-2 text-xs">{this.state.error.stack}</pre>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RefreshCcw className="w-5 h-5" />
                <span>Intentar de nuevo</span>
              </button>

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Home className="w-5 h-5" />
                <span>Ir al inicio</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
