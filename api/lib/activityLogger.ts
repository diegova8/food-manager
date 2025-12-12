import type { VercelRequest } from '@vercel/node';
import { ActivityLog, type IActivityLog } from './models.js';
import connectDB from './mongodb.js';

type ActivityAction = IActivityLog['action'];
type EntityType = IActivityLog['entityType'];

interface LogActivityParams {
  userId: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  req?: VercelRequest;
}

/**
 * Log an admin activity to the database
 * This function is non-blocking and won't throw errors to avoid disrupting the main flow
 */
export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  description,
  metadata,
  req,
}: LogActivityParams): Promise<void> {
  try {
    await connectDB();

    const log = new ActivityLog({
      user: userId,
      action,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress: req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || undefined,
      userAgent: req?.headers?.['user-agent'] || undefined,
    });

    await log.save();
  } catch (error) {
    // Log error but don't throw - activity logging should never break the main flow
    console.error('Failed to log activity:', error);
  }
}

/**
 * Helper functions for common activity types
 */
export const ActivityLogger = {
  // Order activities
  orderStatusChanged: (userId: string, orderId: string, oldStatus: string, newStatus: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'status_change',
      entityType: 'order',
      entityId: orderId,
      description: `Cambió estado de orden #${orderId.slice(-8)} de "${oldStatus}" a "${newStatus}"`,
      metadata: { oldStatus, newStatus },
      req,
    }),

  orderDeleted: (userId: string, orderId: string, customerName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'delete',
      entityType: 'order',
      entityId: orderId,
      description: `Eliminó orden #${orderId.slice(-8)} de ${customerName}`,
      req,
    }),

  ordersBulkDeleted: (userId: string, count: number, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'bulk_delete',
      entityType: 'order',
      description: `Eliminó ${count} órdenes en lote`,
      metadata: { count },
      req,
    }),

  // User activities
  userDeleted: (userId: string, targetUserId: string, targetUsername: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'delete',
      entityType: 'user',
      entityId: targetUserId,
      description: `Eliminó usuario @${targetUsername}`,
      req,
    }),

  usersBulkDeleted: (userId: string, count: number, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'bulk_delete',
      entityType: 'user',
      description: `Eliminó ${count} usuarios en lote`,
      metadata: { count },
      req,
    }),

  // Ticket activities
  ticketStatusChanged: (userId: string, ticketId: string, oldStatus: string, newStatus: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'status_change',
      entityType: 'ticket',
      entityId: ticketId,
      description: `Cambió estado de ticket #${ticketId.slice(-8)} de "${oldStatus}" a "${newStatus}"`,
      metadata: { oldStatus, newStatus },
      req,
    }),

  ticketDeleted: (userId: string, ticketId: string, title: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'delete',
      entityType: 'ticket',
      entityId: ticketId,
      description: `Eliminó ticket #${ticketId.slice(-8)}: "${title}"`,
      req,
    }),

  ticketsBulkDeleted: (userId: string, count: number, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'bulk_delete',
      entityType: 'ticket',
      description: `Eliminó ${count} tickets en lote`,
      metadata: { count },
      req,
    }),

  // Config activities
  configUpdated: (userId: string, changes: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'update',
      entityType: 'config',
      description: `Actualizó configuración: ${changes}`,
      req,
    }),

  // Auth activities
  adminLogin: (userId: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'login',
      entityType: 'auth',
      description: 'Inició sesión en el panel de administración',
      req,
    }),
};

export default ActivityLogger;
