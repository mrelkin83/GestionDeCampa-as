import React from 'react';

/**
 * Componente: ProgressBar
 * 
 * Barra de progreso con porcentaje y etiquetas.
 * Usado para mostrar avance del preconteo.
 */

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-green-600',
  yellow: 'bg-yellow-500',
  red: 'bg-red-600',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
  showPercentage = true,
  size = 'md',
  color = 'blue',
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between mb-2 text-sm">
          {label && <span className="font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="font-semibold text-gray-900">
              {current.toLocaleString()} / {total.toLocaleString()}
              {' '}
              <span className={`${isComplete ? 'text-green-600' : 'text-gray-500'}`}>
                ({percentage}%)
              </span>
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
