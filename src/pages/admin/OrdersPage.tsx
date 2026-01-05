import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { OrderFilters, OrderDetailSlideOver, OrderStatusBadge, type OrderStatus } from '../../components/features/orders';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { BulkDeleteModal } from '../../components/BulkDeleteModal';
import { PaymentMethodIcon, getPaymentMethodLabel } from '../../components/PaymentMethodIcon';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { formatDateDisplay } from '../../utils';
import { exportToCSV, ORDER_EXPORT_COLUMNS, type OrderExportRow } from '../../utils/export';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import type { Order } from '../../types';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // SlideOver state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Delete modals
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;

    const query = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const customerName = order.user
        ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.toLowerCase()
        : (order.guestInfo?.name || '').toLowerCase();
      const phone = order.user?.phone || order.guestInfo?.phone || '';
      const orderId = order._id.toLowerCase();

      return (
        customerName.includes(query) ||
        phone.includes(query) ||
        orderId.includes(query)
      );
    });
  }, [orders, searchQuery]);

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
      setShowDetailPanel(false);
      setOrderToDelete(null);
      setSelectedOrder(null);
      await loadOrders();
      toast.success('Pedido eliminado correctamente');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error al eliminar el pedido');
    } finally {
      setDeleting(false);
    }
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

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o._id)));
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

  const getSelectedItems = () => {
    return orders
      .filter(o => selectedIds.has(o._id))
      .map(o => ({
        id: o._id,
        label: `#${o._id.slice(-8)} - ${getCustomerName(o)} - ${formatCurrency(o.total)}`
      }));
  };

  const handleExport = useCallback(() => {
    const dataToExport = filteredOrders.map((order): OrderExportRow => ({
      id: order._id,
      customerName: getCustomerName(order),
      customerPhone: getCustomerPhone(order),
      customerEmail: order.user?.email || order.guestInfo?.email || '',
      items: order.items.map(i => `${i.quantity}x ${i.cevicheType}`).join(', '),
      total: order.total,
      status: ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status,
      createdAt: formatDateDisplay(order.createdAt),
    }));

    const filename = `ordenes_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(dataToExport, ORDER_EXPORT_COLUMNS, filename);
    toast.success(`${dataToExport.length} órdenes exportadas`);
  }, [filteredOrders]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Órdenes" description="Gestiona todos los pedidos" />
        <LoadingState variant="skeleton" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Órdenes" description="Gestiona todos los pedidos" />

      {/* Filters */}
      <OrderFilters
        statusFilter={filterStatus}
        onStatusChange={setFilterStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalOrders={filteredOrders.length}
        totalAmount={totalAmount}
        selectedCount={selectedIds.size}
        onBulkDelete={() => setShowBulkDeleteModal(true)}
        onRefresh={loadOrders}
        onExport={handleExport}
      />

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <EmptyState
              title="No hay pedidos"
              message={searchQuery ? 'No se encontraron pedidos con esos criterios' : 'Aún no hay pedidos registrados'}
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pago</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrega</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Programado</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedIds.has(order._id);
                    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                      <tr
                        key={order._id}
                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'}`}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailPanel(true);
                        }}
                      >
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(order._id)}
                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            #{order._id.slice(-8)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-800">{getCustomerName(order)}</div>
                          <div className="text-xs text-slate-500">{getCustomerPhone(order)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-lg font-bold text-sm">
                            {itemCount}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-bold text-orange-600">
                            {formatCurrency(order.total)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <PaymentMethodIcon paymentMethod={order.paymentMethod || 'sinpe'} className="w-5 h-5" />
                            <span className="text-sm">{getPaymentMethodLabel(order.paymentMethod || 'sinpe')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {order.deliveryMethod === 'pickup' ? '🏪 Pick Up' : '🚗 Uber'}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 text-sm text-teal-700 bg-teal-50 px-2 py-1 rounded-lg">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDateDisplay(order.scheduledDate, { month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <OrderStatusBadge status={order.status as OrderStatus} />
                        </td>
                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailPanel(true);
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
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail SlideOver */}
      <OrderDetailSlideOver
        order={selectedOrder}
        isOpen={showDetailPanel}
        onClose={() => {
          setShowDetailPanel(false);
          setSelectedOrder(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={(order) => {
          setOrderToDelete(order);
          setShowDeleteModal(true);
        }}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setOrderToDelete(null);
        }}
        onConfirm={handleDeleteOrder}
        title="Eliminar Pedido"
        message={
          orderToDelete
            ? `¿Estás seguro de que deseas eliminar el pedido #${orderToDelete._id.slice(-8)}? Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={deleting}
      />

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

export default OrdersPage;
