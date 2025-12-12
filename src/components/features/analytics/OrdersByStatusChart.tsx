import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent } from '../../ui/Card';
import { ORDER_STATUS_LABELS } from '../../../utils/constants';

interface Order {
  _id: string;
  status: string;
}

interface OrdersByStatusChartProps {
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f97316',      // orange
  confirmed: '#3b82f6',    // blue
  preparing: '#8b5cf6',    // purple
  ready: '#06b6d4',        // cyan
  delivered: '#22c55e',    // green
  completed: '#10b981',    // emerald
  cancelled: '#ef4444',    // red
};

export function OrdersByStatusChart({ orders }: OrdersByStatusChartProps) {
  const chartData = useMemo(() => {
    const statusCounts: Record<string, number> = {};

    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: ORDER_STATUS_LABELS[status as keyof typeof ORDER_STATUS_LABELS] || status,
        value: count,
        status,
        color: STATUS_COLORS[status] || '#9ca3af',
      }))
      .sort((a, b) => b.value - a.value);
  }, [orders]);

  const totalOrders = orders.length;

  if (totalOrders === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Órdenes por Estado
            </h3>
          </div>
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            No hay órdenes para mostrar
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Órdenes por Estado
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Distribución actual
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalOrders}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                órdenes totales
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number, name: string) => [
                    `${value} (${((value / totalOrders) * 100).toFixed(0)}%)`,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="middle"
                  align="right"
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-sm text-gray-600 dark:text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default OrdersByStatusChart;
