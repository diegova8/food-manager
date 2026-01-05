/**
 * Validation schemas for order endpoints
 */

import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      cevicheType: z.string().min(1, 'Ceviche type is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity cannot exceed 100'),
      price: z.number().positive('Price must be positive')
    })
  ).min(1, 'At least one item is required').max(100, 'Too many items in order'),
  total: z.number().positive('Total must be positive'),
  personalInfo: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
    email: z.string().email('Invalid email format').optional().or(z.literal(''))
  }),
  deliveryMethod: z.enum(['pickup', 'uber-flash'], {
    message: 'Delivery method must be either "pickup" or "uber-flash"'
  }),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  paymentMethod: z.enum(['sinpe', 'paypal', 'card'], {
    message: 'Payment method must be "sinpe", "paypal", or "card"'
  }).default('sinpe'),
  notes: z.string().max(500, 'Notes are too long').optional(),
  paymentProof: z.string().url('Payment proof must be a valid URL')
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum(['pending', 'confirmed', 'ready', 'completed', 'cancelled'], {
    message: 'Invalid status value'
  })
});

export const deleteOrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required')
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type DeleteOrderInput = z.infer<typeof deleteOrderSchema>;
