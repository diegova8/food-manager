import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { formatCurrency, formatDateDisplay } from '../utils';
import type { Order } from '../types';
import { BulkDeleteModal } from '../components/BulkDeleteModal';

function OrdersManagementPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const response = await api.getOrders(params);
      setOrders(response.data.orders);
      setTotalAmount(response.data.totalAmount || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      await loadOrders();
      toast.success('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeleting(true);
    try {
      await api.deleteOrder(orderToDelete._id);
      setShowDeleteModal(false);
      setOrderToDelete(null);
      await loadOrders();
      toast.success('Pedido eliminado correctamente');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar el pedido');
    } finally {
      setDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(orders.map(o => o._id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsBulkDeleting(true);
    try {
      const response = await api.bulkDeleteOrders(Array.from(selectedIds));
      toast.success(`${response.data.deletedCount} pedidos eliminados`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      await loadOrders();
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      toast.error('Error al eliminar los pedidos');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getSelectedItems = () => {
    return orders
      .filter(o => selectedIds.has(o._id))
      .map(o => ({
        id: o._id,
        label: `#${o._id.slice(-8)} - ${getCustomerName(o)} - ${formatCurrency(o.total)}`
      }));
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' };
      case 'confirmed':
        return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' };
      case 'ready':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
      case 'completed':
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'ready': return 'Listo';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CR', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCustomerName = (order: Order) => {
    if (order.user) {
      const fullName = [order.user.firstName, order.user.lastName].filter(Boolean).join(' ');
      return fullName || 'N/A';
    }
    return order.guestInfo?.name || 'N/A';
  };

  const getCustomerPhone = (order: Order) => {
    return order.user?.phone || order.guestInfo?.phone || 'N/A';
  };

  const filters = [
    { id: '', label: 'Todos', color: 'slate' },
    { id: 'pending', label: 'Pendientes', color: 'amber' },
    { id: 'confirmed', label: 'Confirmados', color: 'blue' },
    { id: 'ready', label: 'Listos', color: 'emerald' },
    { id: 'completed', label: 'Completados', color: 'slate' },
  ];

  const renderDetailsModal = () => {
    if (!selectedOrder) return null;

    const statusConfig = getStatusConfig(selectedOrder.status);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 rounded-t-3xl">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Pedido #{selectedOrder._id.slice(-8)}
                </h2>
                <p className="text-orange-100 text-sm mt-1">
                  {formatDate(selectedOrder.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* Status Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                {getStatusLabel(selectedOrder.status)}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                {selectedOrder.deliveryMethod === 'pickup' ? '🏪 Pick Up' : '🚗 Uber Flash'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="inline-flex items-center gap-1 text-teal-700">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDateDisplay(selectedOrder.scheduledDate, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Cliente
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Nombre</p>
                  <p className="font-semibold text-slate-800">{getCustomerName(selectedOrder)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Teléfono</p>
                  <p className="font-semibold text-slate-800">{getCustomerPhone(selectedOrder)}</p>
                </div>
                {(selectedOrder.user?.email || selectedOrder.guestInfo?.email) && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="font-semibold text-slate-800">
                      {selectedOrder.user?.email || selectedOrder.guestInfo?.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Pedido
              </h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                        {item.quantity}
                      </span>
                      <span className="text-slate-700">{item.cevicheType}</span>
                    </div>
                    <span className="font-semibold text-slate-800">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-2xl font-bold text-orange-600">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Notas
                </h3>
                <p className="text-amber-700 whitespace-pre-wrap">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Payment Proof */}
            {selectedOrder.paymentProof && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Comprobante de Pago
                </h3>
                <img
                  src={selectedOrder.paymentProof}
                  alt="Comprobante"
                  className="w-full max-w-sm rounded-xl border border-slate-200 shadow-sm"
                />
              </div>
            )}

            {/* Status Update */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-200">
              <h3 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar Estado
              </h3>
              <select
                value={selectedOrder.status}
                onChange={(e) => {
                  handleStatusChange(selectedOrder._id, e.target.value);
                  setShowDetailsModal(false);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-orange-200 rounded-xl focus:outline-none focus:border-orange-400 text-slate-800 font-medium"
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmado</option>
                <option value="ready">Listo</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestión de Pedidos</h2>
            <p className="text-slate-500 text-sm mt-1">
              {orders.length} pedidos en total • Total general: <span className="font-bold text-orange-600">{formatCurrency(totalAmount)}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar ({selectedIds.size})
              </button>
            )}
            <button
              onClick={loadOrders}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((filter) => {
            const isActive = filterStatus === filter.id;
            const colorClasses = {
              slate: isActive ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              amber: isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200',
              blue: isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
              emerald: isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
            };
            return (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${colorClasses[filter.color as keyof typeof colorClasses]}`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.size === orders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrega</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Programado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Creado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">
                      No hay pedidos {filterStatus && `con estado "${getStatusLabel(filterStatus)}"`}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const isSelected = selectedIds.has(order._id);
                  return (
                    <tr key={order._id} className={`transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order._id)}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          #{order._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{getCustomerName(order)}</div>
                        <div className="text-xs text-slate-500">{getCustomerPhone(order)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-lg font-bold text-sm">
                          {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-orange-600">
                          {formatCurrency(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {order.deliveryMethod === 'pickup' ? '🏪 Pick Up' : '🚗 Uber'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-sm text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDateDisplay(order.scheduledDate, { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Ver detalles"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setOrderToDelete(order);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Eliminar pedido"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showDetailsModal && renderDetailsModal()}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && orderToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Eliminar Pedido</h3>
              <p className="text-slate-500 mb-6">
                ¿Estás seguro de que deseas eliminar el pedido{' '}
                <span className="font-mono font-semibold text-slate-700">#{orderToDelete._id.slice(-8)}</span>?
                <br />
                <span className="text-sm text-red-500">Esta acción no se puede deshacer.</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setOrderToDelete(null);
                  }}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      <BulkDeleteModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkDeleting}
        itemType="pedidos"
        items={getSelectedItems()}
      />
    </div>
  );
}

export default OrdersManagementPage;
