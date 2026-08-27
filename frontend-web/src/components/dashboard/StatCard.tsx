import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';

/**
 * Componente: StatCard
 * 
 * Tarjeta de estadística para mostrar métricas clave del preconteo.
 * Incluye indicadores de tendencia (subida/bajada) y alertas.
 */

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  alert?: boolean;
  alertMessage?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  red: 'bg-red-50 border-red-200 text-red-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  gray: 'bg-gray-50 border-gray-200 text-gray-900',
};

const iconColors = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  red: 'text-red-600',
  yellow: 'text-yellow-600',
  gray: 'text-gray-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  alert,
  alertMessage,
  icon,
  color = 'blue',
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500';

  return (
    <div className={`p-6 rounded-lg border-2 ${colorClasses[color]} transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium opacity-80 mb-1">{title}</h3>
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-sm mt-1 opacity-70">{subtitle}</p>
          )}
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
              <TrendIcon className="w-4 h-4 mr-1" />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`ml-4 ${iconColors[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {alert && (
        <div className="mt-4 flex items-center text-sm text-red-600 bg-red-100 p-2 rounded">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{alertMessage}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
