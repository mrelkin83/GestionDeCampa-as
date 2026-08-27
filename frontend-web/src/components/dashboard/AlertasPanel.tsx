import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Componente: AlertaItem
 * 
 * Muestra una alerta individual del sistema de preconteo.
 * Puede ser de tipo WARNING, CRITICAL o INFO.
 */

interface Alerta {
  id: number;
  tipo: string;
  severidad: 'CRITICAL' | 'WARNING' | 'INFO';
  mensaje: string;
  mesa_id?: number;
  created_at: string;
}

interface AlertaItemProps {
  alerta: Alerta;
  onClick?: (alerta: Alerta) => void;
}

const severidadConfig = {
  CRITICAL: {
    icon: XCircle,
    color: 'bg-red-100 border-red-400 text-red-800',
    iconColor: 'text-red-600',
    label: 'Crítica',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'bg-yellow-100 border-yellow-400 text-yellow-800',
    iconColor: 'text-yellow-600',
    label: 'Advertencia',
  },
  INFO: {
    icon: Info,
    color: 'bg-blue-100 border-blue-400 text-blue-800',
    iconColor: 'text-blue-600',
    label: 'Información',
  },
};

export const AlertaItem: React.FC<AlertaItemProps> = ({ alerta, onClick }) => {
  const config = severidadConfig[alerta.severidad];
  const Icon = config.icon;

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${config.color} cursor-pointer transition-all hover:shadow-md ${
        onClick ? 'hover:translate-x-1' : ''
      }`}
      onClick={() => onClick?.(alerta)}
      role="alert"
    >
      <div className="flex items-start">
        <Icon className={`w-5 h-5 mr-3 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">{config.label}</span>
            <span className="text-xs opacity-70">
              {new Date(alerta.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm">{alerta.mensaje}</p>
          {alerta.mesa_id && (
            <p className="text-xs mt-1 opacity-70">Mesa #{alerta.mesa_id}</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface AlertasPanelProps {
  alertas: Alerta[];
  maxAlertas?: number;
  onAlertaClick?: (alerta: Alerta) => void;
  onVerTodas?: () => void;
}

export const AlertasPanel: React.FC<AlertasPanelProps> = ({
  alertas,
  maxAlertas = 5,
  onAlertaClick,
  onVerTodas,
}) => {
  const alertasOrdenadas = [...alertas].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const alertasCriticas = alertasOrdenadas.filter((a) => a.severidad === 'CRITICAL');
  const alertasMostradas = alertasOrdenadas.slice(0, maxAlertas);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500" />
          Alertas del Sistema
          {alertasCriticas.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
              {alertasCriticas.length}
            </span>
          )}
        </h2>
        {onVerTodas && alertas.length > maxAlertas && (
          <button
            onClick={onVerTodas}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver todas ({alertas.length})
          </button>
        )}
      </div>

      {alertasMostradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
          <p>No hay alertas pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertasMostradas.map((alerta) => (
            <AlertaItem
              key={alerta.id}
              alerta={alerta}
              onClick={onAlertaClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertasPanel;
