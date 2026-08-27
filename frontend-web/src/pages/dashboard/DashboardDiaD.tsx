import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { StatCard } from '../../components/dashboard/StatCard';
import { ProgressBar } from '../../components/dashboard/ProgressBar';
import { ResultadosChart } from '../../components/dashboard/ResultadosChart';
import { AlertasPanel } from '../../components/dashboard/AlertasPanel';
import { MapaParticipacion } from '../../components/dashboard/MapaParticipacion';
import { api } from '../../lib/api';

/**
 * Página: DashboardDiaD
 * 
 * Dashboard principal para el día de las elecciones.
 * Muestra resultados en tiempo real, progreso, alertas y mapa de participación.
 */

interface Resultado {
  candidate_id: number;
  candidate_nombre: string;
  votos: number;
  porcentaje: number;
  es_ganador?: boolean;
}

interface Progreso {
  total_mesas: number;
  reportadas: number;
  validadas: number;
  porcentaje_avance: number;
  actas_ultima_hora: number;
}

interface Alerta {
  id: number;
  tipo: string;
  severidad: 'CRITICAL' | 'WARNING' | 'INFO';
  mensaje: string;
  mesa_id?: number;
  created_at: string;
}

const DashboardDiaD: React.FC = () => {
  const [eleccion, setEleccion] = useState<any>(null);
  const [cargo, setCargo] = useState<any>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [progreso, setProgreso] = useState<Progreso | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [mesas, setMesas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date>(new Date());

  // backend-diad verifica un JWT real (JWT_SECRET compartido), no el token
  // opaco de Sanctum que usa el resto de la API (auth_token) -ese formato
  // hace que jwt.verify() rechace la conexión siempre ("jwt malformed").
  // AuthContext guarda el JWT aparte bajo 'ws_token' (ver AuthController::
  // generarTokenWebSocket en backend-core).
  const token = localStorage.getItem('ws_token');

  // Conectar WebSocket
  const { connected, authenticated, subscribe } = useWebSocket(token, {
    onResultadosActualizados: (data) => {
      console.log('Resultados actualizados:', data);
      cargarResultados();
    },
    onProgresoMesas: (data) => {
      console.log('Progreso actualizado:', data);
      cargarProgreso();
    },
    onNuevaActa: (data) => {
      console.log('Nueva acta:', data);
      cargarDatos();
    },
    onActaValidada: (data) => {
      console.log('Acta validada:', data);
      cargarDatos();
    },
    onAlerta: (data) => {
      console.log('Nueva alerta:', data);
      setAlertas((prev) => [data, ...prev]);
    },
  });

  // Cargar datos iniciales
  const cargarDatos = async () => {
    try {
      await Promise.all([
        cargarEleccion(),
        cargarResultados(),
        cargarProgreso(),
        cargarAlertas(),
        cargarMesas(),
      ]);
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEleccion = async () => {
    const response = await api.get('/preconteo/elecciones');
    if (response.data.success && response.data.data.length > 0) {
      setEleccion(response.data.data[0]);
    }
  };

  const cargarResultados = async () => {
    if (!eleccion) return;
    
    try {
      const response = await api.get('/preconteo/resultados', {
        params: {
          scope_type: 'DEPARTAMENTO',
          scope_id: 1, // TODO: Obtener del contexto
          cargo_id: cargo?.id || 1,
        },
      });

      if (response.data.success) {
        setResultados(response.data.data.resultados || []);
        setCargo(response.data.data.cargo);
      }
    } catch (error) {
      console.error('Error cargando resultados:', error);
    }
  };

  const cargarProgreso = async () => {
    try {
      const response = await api.get('/preconteo/progreso', {
        params: {
          scope_type: 'DEPARTAMENTO',
          scope_id: 1,
          cargo_id: cargo?.id || 1,
        },
      });

      if (response.data.success) {
        setProgreso(response.data.data);
      }
    } catch (error) {
      console.error('Error cargando progreso:', error);
    }
  };

  const cargarAlertas = async () => {
    try {
      const response = await api.get('/preconteo/alertas', {
        params: {
          election_position_id: cargo?.id || 1,
        },
      });

      if (response.data.success) {
        setAlertas(response.data.data || []);
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  const cargarMesas = async () => {
    try {
      const response = await api.get('/internal/preconteo/actas', {
        params: {
          per_page: 100,
        },
      });

      if (response.data.success) {
        setMesas(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error cargando mesas:', error);
    }
  };

  // Suscribirse a actualizaciones
  useEffect(() => {
    if (authenticated) {
      subscribe('DEPARTAMENTO', 1);
    }
  }, [authenticated, subscribe]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();

    // Actualizar cada 30 segundos como fallback
    const interval = setInterval(cargarDatos, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  const totalVotos = resultados.reduce((sum, r) => sum + r.votos, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard Día D - {eleccion?.nombre || 'Elecciones 2027'}
            </h1>
            <p className="text-gray-600 mt-1">
              Resultados en tiempo real • Última actualización:{' '}
              {ultimaActualizacion.toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div
              className={`flex items-center px-3 py-1 rounded-full text-sm ${
                connected
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              {connected ? 'Conectado' : 'Desconectado'}
            </div>
            <button
              onClick={cargarDatos}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Votos"
          value={totalVotos.toLocaleString()}
          subtitle={cargo?.nombre || 'Cargando...'}
          trend="up"
          trendValue="Actualizado"
          icon={<BarChart3 className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Mesas Reportadas"
          value={progreso?.reportadas || 0}
          subtitle={`de ${progreso?.total_mesas || 0} totales`}
          trend="up"
          trendValue={`${progreso?.porcentaje_avance || 0}% avance`}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Actas Última Hora"
          value={progreso?.actas_ultima_hora || 0}
          subtitle="Actividad reciente de testigos"
          icon={<Users className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Alertas"
          value={alertas.filter((a) => a.severidad === 'CRITICAL').length}
          subtitle={`${alertas.length} total`}
          alert={alertas.some((a) => a.severidad === 'CRITICAL')}
          alertMessage="Requiere atención inmediata"
          icon={<AlertTriangle className="w-6 h-6" />}
          color={alertas.some((a) => a.severidad === 'CRITICAL') ? 'red' : 'gray'}
        />
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <ProgressBar
          current={progreso?.reportadas || 0}
          total={progreso?.total_mesas || 0}
          label="Progreso del Preconteo"
          size="lg"
          color="blue"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resultados Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Resultados - {cargo?.nombre || 'Cargando...'}
              </h2>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Filtrar
                </button>
              </div>
            </div>
            <ResultadosChart
              resultados={resultados}
              totalVotos={totalVotos}
              tipo="barras"
            />
          </div>

          {/* Mapa de Participación */}
          <MapaParticipacion
            mesas={mesas.map((m) => ({
              id: m.id,
              numero: m.polling_table?.numero || m.id,
              puesto: m.polling_table?.puesto_votacion?.nombre || 'Puesto',
              municipio: m.polling_table?.puesto_votacion?.municipio?.nombre || 'Municipio',
              estado: m.estado,
              votantes: m.total_sufragantes,
            }))}
            titulo="Participación por Territorio"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Alertas */}
          <AlertasPanel
            alertas={alertas}
            maxAlertas={5}
            onAlertaClick={(alerta) => console.log('Alerta clickeada:', alerta)}
          />

          {/* Resumen Rápido */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Resumen Rápido
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Mesas Validadas</span>
                <span className="font-semibold text-green-600">
                  {progreso?.validadas || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Mesas Observadas</span>
                <span className="font-semibold text-red-600">
                  {mesas.filter((m) => m.estado === 'OBSERVADA').length}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Participación Estimada</span>
                <span className="font-semibold text-blue-600">
                  {Math.round((totalVotos / ((progreso?.total_mesas ?? 0) * 300 || 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Candidatos</span>
                <span className="font-semibold">{resultados.length}</span>
              </div>
            </div>
          </div>

          {/* Ayuda */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">¿Necesitas ayuda?</h3>
            <p className="text-sm text-blue-800 mb-3">
              Si encuentras algún problema o tienes dudas sobre el sistema, contacta al equipo de soporte.
            </p>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Contactar soporte →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDiaD;
