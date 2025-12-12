import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '../../ui/Card';

interface OrderItem {
  cevicheType: string;
  quantity: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  status: string;
}

interface TopProductsChartProps {
  orders: Order[];
  limit?: number;
}

// Ceviche type labels for display
const CEVICHE_LABELS: Record<string, string> = {
  camaron: 'Camarón',
  pulpo: 'Pulpo',
  pescado: 'Pescado',
  mixto: 'Mixto',
  'camaron-pulpo': 'Camarón-Pulpo',
  'pulpo-piangua': 'Pulpo-Piangua',
};

// Colors for different ceviches
const CEVICHE_COLORS: Record<string, string> = {
  camaron: '#f97316',
  pulpo: '#8b5cf6',
  pescado: '#3b82f6',
  mixto: '#22c55e',
  'camaron-pulpo': '#ec4899',
  'pulpo-piangua': '#14b8a6',
};

export function TopProductsChart({ orders, limit = 6 }: TopProductsChartProps) {
  const chartData = useMemo(() => {
    const productCounts: Record<string, number> = {};

    // Only count from non-cancelled orders
    orders
      .filter((order) => order.status !== 'cancelled')
      .forEach((order) => {
        order.items.forEach((item) => {
          productCounts[item.cevicheType] =
            (productCounts[item.cevicheType] || 0) + item.quantity;
        });
      });

    return Object.entries(productCounts)
      .map(([type, quantity]) => ({
        type,
        name: CEVICHE_LABELS[type] || type,
        quantity,
        color: CEVICHE_COLORS[type] || '#9ca3af',
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, limit);
  }, [orders, limit]);

  const totalSold = chartData.reduce((sum, d) => sum + d.quantity, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Productos Más Vendidos
            </h3>
          </div>
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">
            No hay datos de ventas
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
                Productos Más Vendidos
              </h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Por cantidad vendida
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalSold}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                unidades vendidas
              </p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value} unidades`, 'Vendidos']}
                />
                <Bar
                  dataKey="quantity"
                  radius={[0, 4, 4, 0]}
                  fill="#f97316"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TopProductsChart;
