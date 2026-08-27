import React from 'react';
import { MapPin, CheckCircle, Clock, XCircle } from 'lucide-react';

/**
 * Componente: MapaParticipacion
 * 
 * Visualización simplificada de participación por territorio.
 * Muestra una lista de mesas/puestos con indicadores de estado.
 * 
 * Nota: Para un mapa geográfico real, se necesitaría integrar
 * bibliotecas como Leaflet o Mapbox con coordenadas PostGIS.
 */

interface MesaParticipacion {
  id: number;
  numero: string;
  puesto: string;
  municipio: string;
  estado: 'PENDIENTE' | 'REPORTADA' | 'VALIDADA' | 'OBSERVADA';
  votantes?: number;
  porcentajeParticipacion?: number;
}

interface MapaParticipacionProps {
  mesas: MesaParticipacion[];
  onMesaClick?: (mesa: MesaParticipacion) => void;
  titulo?: string;
}

const estadoConfig = {
  PENDIENTE: {
    color: 'bg-gray-100 text-gray-600 border-gray-300',
    icon: Clock,
    label: 'Pendiente',
  },
  REPORTADA: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    icon: Clock,
    label: 'Reportada',
  },
  VALIDADA: {
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle,
    label: 'Validada',
  },
  OBSERVADA: {
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: XCircle,
    label: 'Observada',
  },
};

export const MapaParticipacion: React.FC<MapaParticipacionProps> = ({
  mesas,
  onMesaClick,
  titulo = 'Participación por Mesa',
}) => {
  // Agrupar por municipio
  const porMunicipio = mesas.reduce((acc, mesa) => {
    if (!acc[mesa.municipio]) {
      acc[mesa.municipio] = [];
    }
    acc[mesa.municipio].push(mesa);
    return acc;
  }, {} as Record<string, MesaParticipacion[]>);

  const resumen = {
    total: mesas.length,
    validadas: mesas.filter((m) => m.estado === 'VALIDADA').length,
    reportadas: mesas.filter((m) => m.estado === 'REPORTADA').length,
    observadas: mesas.filter((m) => m.estado === 'OBSERVADA').length,
    pendientes: mesas.filter((m) => m.estado === 'PENDIENTE').length,
  };

  const porcentajeAvance =
    resumen.total > 0
      ? Math.round(((resumen.validadas + resumen.reportadas) / resumen.total) * 100)
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center mb-2">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          {titulo}
        </h2>

        {/* Resumen */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xl font-bold text-gray-900">{resumen.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded">
            <div className="text-xl font-bold text-green-700">{resumen.validadas}</div>
            <div className="text-xs text-green-600">Validadas</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded">
            <div className="text-xl font-bold text-yellow-700">{resumen.reportadas}</div>
            <div className="text-xs text-yellow-600">Reportadas</div>
          </div>
          <div className="text-center p-2 bg-red-50 rounded">
            <div className="text-xl font-bold text-red-700">{resumen.observadas}</div>
            <div className="text-xs text-red-600">Observadas</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <div className="text-xl font-bold text-blue-700">{porcentajeAvance}%</div>
            <div className="text-xs text-blue-600">Avance</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${porcentajeAvance}%` }}
          />
        </div>
      </div>

      {/* Lista por municipio */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(porMunicipio).map(([municipio, mesasMunicipio]) => (
          <div key={municipio} className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              {municipio}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {mesasMunicipio.map((mesa) => {
                const config = estadoConfig[mesa.estado];
                const Icon = config.icon;
                return (
                  <button
                    key={mesa.id}
                    onClick={() => onMesaClick?.(mesa)}
                    className={`p-3 rounded-lg border-2 text-left transition-all hover:shadow-md ${config.color} ${
                      onMesaClick ? 'hover:scale-105' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">Mesa {mesa.numero}</span>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs opacity-80 truncate">{mesa.puesto}</div>
                    {mesa.porcentajeParticipacion !== undefined && (
                      <div className="mt-2 text-xs font-medium">
                        Participación: {mesa.porcentajeParticipacion}%
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapaParticipacion;
