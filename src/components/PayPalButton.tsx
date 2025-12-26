import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { api } from '../services/api';

interface OrderData {
  items: Array<{ cevicheType: string; quantity: number; price: number }>;
  total: number;
  personalInfo: { name: string; phone: string; email?: string };
  deliveryMethod: 'pickup' | 'uber-flash';
  scheduledDate: string;
  notes?: string;
}

interface PayPalButtonProps {
  orderData: OrderData;
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const USD_TO_CRC_RATE = parseFloat(import.meta.env.VITE_USD_TO_CRC_RATE || '505');

export function PayPalButton({ orderData, onSuccess, onError, disabled }: PayPalButtonProps) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalUsd = (orderData.total / USD_TO_CRC_RATE).toFixed(2);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        <span className="ml-2 text-gray-600">Cargando PayPal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
        <p>Total a pagar: <span className="font-semibold text-gray-900 dark:text-white">${totalUsd} USD</span></p>
        <p className="text-xs mt-1">(Equivalente a ₡{orderData.total.toLocaleString()})</p>
      </div>

      {isProcessing && (
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
          <span className="ml-2 text-sm text-gray-600">Procesando pago...</span>
        </div>
      )}

      <PayPalButtons
        disabled={disabled || isProcessing}
        style={{
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal'
        }}
        createOrder={async () => {
          try {
            setIsProcessing(true);
            const response = await api.createPayPalOrder(orderData);
            return response.data.paypalOrderId;
          } catch (error) {
            setIsProcessing(false);
            const message = error instanceof Error ? error.message : 'Error al crear la orden';
            onError(message);
            throw error;
          }
        }}
        onApprove={async (data) => {
          try {
            const response = await api.capturePayPalOrder(data.orderID, orderData);
            setIsProcessing(false);
            onSuccess(response.data.orderId);
          } catch (error) {
            setIsProcessing(false);
            const message = error instanceof Error ? error.message : 'Error al procesar el pago';
            onError(message);
          }
        }}
        onCancel={() => {
          setIsProcessing(false);
        }}
        onError={(err) => {
          setIsProcessing(false);
          console.error('PayPal error:', err);
          onError('Error en el proceso de pago. Por favor intente de nuevo.');
        }}
      />
    </div>
  );
}
