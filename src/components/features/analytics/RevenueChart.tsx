import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatters';

interface Order {
  _id: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RevenueChartProps {
  orders: Order[];
  days?: number;
}

export function RevenueChart({ orders, days = 7 }: RevenueChartProps) {
  const chartData = useMemo(() => {
    // Generate last N days
    const data: { date: string; label: string; revenue: number; orders: number }[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('es-CR', { weekday: 'short', day: 'numeric' });

      data.push({
        date: dateStr,
        label,
        revenue: 0,
        orders: 0,
      });
    }

    // Fill in revenue from completed orders
    orders.forEach((order) => {
      if (order.status !== 'completed') return;

      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      const dayData = data.find((d) => d.date === orderDate);

      if (dayData) {
        dayData.revenue += order.total;
        dayData.orders += 1;
      }
    });

    return data;
  }, [orders, days]);

  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ingresos
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Últimos {days} días
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {totalOrders} órdenes completadas
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(value) => `₡${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Ingresos' : 'Órdenes',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RevenueChart;
