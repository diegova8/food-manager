import { SlideOver, SlideOverSection, SlideOverFooter } from '../../ui/SlideOver';
import { Button } from '../../ui/Button';
import { OrderStatusFlow, type OrderStatus } from './OrderStatusFlow';
import { formatCurrency } from '../../../utils/formatters';
import { formatDateDisplay } from '../../../utils';
import type { Order } from '../../../types';

interface OrderDetailSlideOverProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: string) => void;
  onDelete?: (order: Order) => void;
}

export function OrderDetailSlideOver({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onDelete,
}: OrderDetailSlideOverProps) {
  if (!order) return null;

  const getCustomerName = () => {
    if (order.user) {
      const fullName = [order.user.firstName, order.user.lastName].filter(Boolean).join(' ');
      return fullName || 'N/A';
    }
    return order.guestInfo?.name || 'N/A';
  };

  const getCustomerPhone = () => {
    return order.user?.phone || order.guestInfo?.phone || 'N/A';
  };

  const getCustomerEmail = () => {
    return order.user?.email || order.guestInfo?.email;
  };

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={`Pedido #${order._id.slice(-8)}`}
      description={`Creado el ${formatDateDisplay(order.createdAt, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
    >
      <div className="space-y-6">
        {/* Status Flow */}
        <SlideOverSection title="Estado del Pedido">
          <div className="py-2">
            <OrderStatusFlow
              currentStatus={order.status as OrderStatus}
              onStatusChange={(status) => onStatusChange(order._id, status)}
              size="md"
            />
          </div>
        </SlideOverSection>

        {/* Delivery Info */}
        <SlideOverSection title="Información de Entrega">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
              {order.deliveryMethod === 'pickup' ? (
                <>
                  <span className="text-xl">🏪</span>
                  <span className="font-medium text-slate-700">Pick Up</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🚗</span>
                  <span className="font-medium text-slate-700">Uber Flash</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 text-teal-700 rounded-lg">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">
                {formatDateDisplay(order.scheduledDate, { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>
        </SlideOverSection>

        {/* Customer Info */}
        <SlideOverSection title="Cliente">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Nombre</p>
              <p className="font-semibold text-slate-800">{getCustomerName()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Teléfono</p>
              <a href={`tel:${getCustomerPhone()}`} className="font-semibold text-orange-600 hover:underline">
                {getCustomerPhone()}
              </a>
            </div>
            {getCustomerEmail() && (
              <div className="col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Email</p>
                <a href={`mailto:${getCustomerEmail()}`} className="font-semibold text-orange-600 hover:underline">
                  {getCustomerEmail()}
                </a>
              </div>
            )}
          </div>
        </SlideOverSection>

        {/* Order Items */}
        <SlideOverSection title={`Pedido (${totalItems} items)`}>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
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
            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-800">Total</span>
              <span className="text-2xl font-bold text-orange-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </SlideOverSection>

        {/* Notes */}
        {order.notes && (
          <SlideOverSection title="Notas">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 whitespace-pre-wrap">{order.notes}</p>
            </div>
          </SlideOverSection>
        )}

        {/* Payment Proof */}
        {order.paymentProof && (
          <SlideOverSection title="Comprobante de Pago">
            <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={order.paymentProof}
                alt="Comprobante"
                className="w-full max-w-sm rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              />
            </a>
            <p className="text-xs text-slate-500 mt-2">Click para ver en tamaño completo</p>
          </SlideOverSection>
        )}

        {/* Quick Status Change */}
        <SlideOverSection title="Cambio Rápido de Estado">
          <div className="flex flex-wrap gap-2">
            {(['pending', 'confirmed', 'ready', 'completed', 'cancelled'] as OrderStatus[]).map((status) => {
              const isActive = order.status === status;
              const labels: Record<OrderStatus, string> = {
                pending: 'Pendiente',
                confirmed: 'Confirmado',
                ready: 'Listo',
                completed: 'Completado',
                cancelled: 'Cancelado',
              };
              const colors: Record<OrderStatus, string> = {
                pending: isActive ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200',
                confirmed: isActive ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                ready: isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
                completed: isActive ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                cancelled: isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200',
              };

              return (
                <button
                  key={status}
                  onClick={() => !isActive && onStatusChange(order._id, status)}
                  disabled={isActive}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${colors[status]} ${isActive ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {labels[status]}
                </button>
              );
            })}
          </div>
        </SlideOverSection>
      </div>

      {/* Footer with actions */}
      <SlideOverFooter>
        {onDelete && (
          <Button
            variant="danger"
            onClick={() => onDelete(order)}
          >
            Eliminar Pedido
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </SlideOverFooter>
    </SlideOver>
  );
}

export default OrderDetailSlideOver;
