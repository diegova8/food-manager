import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { LoadingState } from '../../components/shared/LoadingState';
import { RevenueChart, OrdersByStatusChart, TopProductsChart } from '../../components/features/analytics';
import { formatCurrency, formatRelativeTime } from '../../utils/formatters';
import { cn } from '../../utils/cn';
import { api } from '../../services/api';

type DateRange = 'today' | 'week' | 'month' | 'all';

interface DashboardStats {
  pendingOrders: number;
  totalOrders: number;
  totalUsers: number;
  openTickets: number;
  totalTickets: number;
  revenue: number;
  completedOrders: number;
}

interface OrderItem {
  cevicheType: string;
  quantity: number;
}

interface RecentOrder {
  _id: string;
  user?: { firstName?: string; lastName?: string };
  guestInfo?: { name?: string };
  items: OrderItem[];
  total: number;
  status: string;
  createdAt: string;
}

interface RecentTicket {
  id: string;
  type: 'suggestion' | 'bug';
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  user?: { firstName?: string; username?: string } | null;
  guestName?: string;
  createdAt: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allOrders, setAllOrders] = useState<RecentOrder[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('week');

  const getDateRangeFilter = (range: DateRange): Date | null => {
    const now = new Date();
    switch (range) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo;
      case 'all':
        return null;
    }
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
        const [ordersResponse, usersResponse, ticketsResponse] = await Promise.all([
          api.getOrders({ limit: 100 }), // Get more orders for stats calculation
          api.getUsers({ limit: 1 }), // Just need totalCount
          api.getTickets({ limit: 5 }), // Get recent tickets
        ]);

        const orders = ordersResponse.data?.orders || [];
        const totalUsers = usersResponse.data?.totalCount || 0;
        const tickets = ticketsResponse.data?.tickets || [];
        const totalTickets = ticketsResponse.data?.pagination?.total || 0;

        // Filter orders by date range
        const dateFilter = getDateRangeFilter(dateRange);
        const filteredOrders = dateFilter
          ? orders.filter((o: RecentOrder) => new Date(o.createdAt) >= dateFilter)
          : orders;

        // Calculate stats
        const pendingOrders = filteredOrders.filter((o: RecentOrder) => o.status === 'pending').length;
        const completedOrders = filteredOrders.filter((o: RecentOrder) => o.status === 'completed').length;
        const revenue = filteredOrders
          .filter((o: RecentOrder) => o.status === 'completed')
          .reduce((sum: number, o: RecentOrder) => sum + o.total, 0);

        // Count open tickets
        const openTickets = tickets.filter(
          (t: RecentTicket) => t.status === 'open' || t.status === 'in_progress'
        ).length;

        setStats({
          pendingOrders,
          totalOrders: filteredOrders.length,
          totalUsers,
          openTickets,
          totalTickets,
          revenue,
          completedOrders,
        });

        // Set all orders for charts and recent items (most recent 5)
        setAllOrders(orders);
        setRecentOrders(orders.slice(0, 5));
        setRecentTickets(tickets.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [dateRange]);

  const dateRangeLabels: Record<DateRange, string> = {
    today: 'Hoy',
    week: 'Esta semana',
    month: 'Este mes',
    all: 'Todo el tiempo',
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Dashboard"
          description="Vista general de tu negocio"
        />
        <LoadingState variant="skeleton" rows={4} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Vista general de tu negocio"
        actions={
          <div className="flex items-center gap-2">
            {(['today', 'week', 'month', 'all'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  dateRange === range
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {dateRangeLabels[range]}
              </button>
            ))}
          </div>
        }
      />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Órdenes Pendientes"
          value={stats?.pendingOrders || 0}
          subtitle={`de ${stats?.totalOrders || 0} órdenes`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          color="orange"
          href="/admin/orders?status=pending"
        />
        <StatCard
          title="Usuarios Registrados"
          value={stats?.totalUsers || 0}
          subtitle="usuarios totales"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="blue"
          href="/admin/users"
        />
        <StatCard
          title="Tickets Abiertos"
          value={stats?.openTickets || 0}
          subtitle={`de ${stats?.totalTickets || 0} tickets`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          }
          color="purple"
          href="/admin/tickets"
        />
        <StatCard
          title={`Ingresos ${dateRangeLabels[dateRange]}`}
          value={formatCurrency(stats?.revenue || 0)}
          subtitle={`${stats?.completedOrders || 0} órdenes completadas`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />
      </div>

      {/* Two column layout for recent items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Orders */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Órdenes Recientes</h2>
              <Link
                to="/admin/orders"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Ver todas →
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay órdenes recientes
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map((order) => {
                  const customerName = order.user?.firstName || order.guestInfo?.name || 'Cliente';
                  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 font-medium text-sm">
                            {customerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{customerName}</p>
                          <p className="text-xs text-gray-500">
                            {itemCount} items • {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                        <StatusBadge type="order" status={order.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tickets */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Tickets Recientes</h2>
              <Link
                to="/admin/tickets"
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Ver todos →
              </Link>
            </div>

            {recentTickets.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay tickets recientes
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentTickets.map((ticket) => {
                  const userName = ticket.user?.firstName || ticket.user?.username || ticket.guestName || 'Anónimo';

                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0',
                          ticket.type === 'bug' ? 'bg-red-100' : 'bg-teal-100'
                        )}>
                          {ticket.type === 'bug' ? (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{ticket.title}</p>
                          <p className="text-xs text-gray-500">
                            {userName} • {ticket.type === 'bug' ? 'Error' : 'Sugerencia'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">
                          {formatRelativeTime(ticket.createdAt)}
                        </span>
                        <StatusBadge type="ticket" status={ticket.status} size="sm" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RevenueChart orders={allOrders} days={7} />
        </div>
        <div>
          <OrdersByStatusChart orders={allOrders} />
        </div>
      </div>

      {/* Top Products */}
      <div className="mb-6">
        <TopProductsChart orders={allOrders} limit={6} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          title="Gestionar Órdenes"
          description="Ver y actualizar el estado de las órdenes"
          href="/admin/orders"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          }
        />
        <QuickActionCard
          title="Configurar Precios"
          description="Actualizar costos y precios de venta"
          href="/admin/pricing"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
        />
        <QuickActionCard
          title="Ver Tickets"
          description="Responder consultas de clientes"
          href="/admin/tickets"
          icon={
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'orange' | 'blue' | 'purple' | 'green';
  href?: string;
}

function StatCard({ title, value, subtitle, icon, color, href }: StatCardProps) {
  const colorClasses = {
    orange: 'bg-orange-100 text-orange-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
  };

  const content = (
    <Card hover={!!href} className="h-full">
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={cn('p-3 rounded-lg', colorClasses[color])}>
            {icon}
          </div>
        </div>
        <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

function QuickActionCard({ title, description, href, icon }: QuickActionCardProps) {
  return (
    <Link to={href}>
      <Card hover className="h-full">
        <CardContent>
          <div className="text-gray-400 mb-3">{icon}</div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default DashboardPage;
