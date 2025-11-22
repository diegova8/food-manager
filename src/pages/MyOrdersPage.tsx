import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';
import { formatCurrency, formatDateDisplay } from '../utils';
import type { Order } from '../types';

function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.getMyOrders();
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Pendiente' };
      case 'confirmed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Confirmado' };
      case 'ready':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Listo' };
      case 'completed':
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Completado' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', label: 'Cancelado' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: status };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Cargando pedidos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mis Pedidos</h1>
            <p className="text-slate-500 text-sm">{orders.length} pedidos realizados</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No tienes pedidos</h2>
            <p className="text-slate-500 mb-6">Aún no has realizado ningún pedido</p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Ver Menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <button
                  key={order._id}
                  onClick={() => navigate(`/profile/orders/${order._id}`)}
                  className="w-full bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all text-left border border-slate-100 hover:border-orange-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-sm text-slate-500">#{order._id.slice(-8)}</span>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(order.createdAt)}</p>
                      <p className="text-xs text-teal-600 mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDateDisplay(order.scheduledDate, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                        {totalItems}
                      </span>
                      <div>
                        <p className="text-sm text-slate-600">
                          {totalItems === 1 ? '1 ceviche' : `${totalItems} ceviches`}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.deliveryMethod === 'pickup' ? 'Pick Up' : 'Uber Flash'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{formatCurrency(order.total)}</p>
                      <svg className="w-5 h-5 text-slate-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrdersPage;
