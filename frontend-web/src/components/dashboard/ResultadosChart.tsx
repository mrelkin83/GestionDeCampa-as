import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

/**
 * Componente: ResultadosChart
 * 
 * Muestra los resultados de votación en formato de barras.
 * Se actualiza en tiempo real vía WebSocket.
 */

interface CandidatoResultado {
  candidate_id: number;
  candidate_nombre: string;
  votos: number;
  porcentaje: number;
  es_ganador?: boolean;
}

interface ResultadosChartProps {
  resultados: CandidatoResultado[];
  totalVotos: number;
  tipo?: 'barras' | 'pastel' | 'tendencia';
  showPercentages?: boolean;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280'];

export const ResultadosChart: React.FC<ResultadosChartProps> = ({
  resultados,
  totalVotos,
  tipo = 'barras',
  showPercentages = true,
}) => {
  // Ordenar por votos descendente
  const dataOrdenada = [...resultados].sort((a, b) => b.votos - a.votos);

  // Formatear datos para el gráfico
  const data = dataOrdenada.map((r) => ({
    name: r.candidate_nombre.split(' ').slice(0, 2).join(' '), // Primeros 2 nombres
    votos: r.votos,
    porcentaje: r.porcentaje,
    esGanador: r.es_ganador,
  }));

  if (tipo === 'pastel') {
    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, porcentaje }: any) => `${name}: ${(porcentaje ?? 0).toFixed(1)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="votos"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke={entry.esGanador ? '#000' : 'none'}
                  strokeWidth={entry.esGanador ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number | undefined, _name: string | undefined, props: any) => [
                `${(value ?? 0).toLocaleString()} votos (${(props.payload.porcentaje ?? 0).toFixed(1)}%)`,
                props.payload.name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (tipo === 'tendencia') {
    // Para tendencia necesitaríamos datos históricos
    // Por ahora mostramos los resultados actuales como línea
    return (
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip
              formatter={(value: number | undefined, _name: string | undefined, props: any) => [
                `${(value ?? 0).toLocaleString()} votos`,
                props.payload.name,
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="votos"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Gráfico de barras (default)
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number | undefined, _name: string | undefined, props: any) => [
              `${(value ?? 0).toLocaleString()} votos (${(props.payload.porcentaje ?? 0).toFixed(1)}%)`,
              'Votos',
            ]}
          />
          <Bar dataKey="votos" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke={entry.esGanador ? '#000' : 'none'}
                strokeWidth={entry.esGanador ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {showPercentages && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Total: {totalVotos.toLocaleString()} votos
        </div>
      )}
    </div>
  );
};

export default ResultadosChart;
