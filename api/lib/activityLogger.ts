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

  // Product activities
  productCreated: (userId: string, productId: string, productName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'create',
      entityType: 'product',
      entityId: productId,
      description: `Creó producto "${productName}"`,
      req,
    }),

  productUpdated: (userId: string, productId: string, productName: string, changes?: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'update',
      entityType: 'product',
      entityId: productId,
      description: changes ? `Actualizó producto "${productName}": ${changes}` : `Actualizó producto "${productName}"`,
      req,
    }),

  productDeleted: (userId: string, productId: string, productName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'delete',
      entityType: 'product',
      entityId: productId,
      description: `Eliminó producto "${productName}"`,
      req,
    }),

  productToggled: (userId: string, productId: string, productName: string, field: string, newValue: boolean, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'toggle',
      entityType: 'product',
      entityId: productId,
      description: `${newValue ? 'Activó' : 'Desactivó'} ${field === 'isActive' ? '' : 'disponibilidad de '}producto "${productName}"`,
      metadata: { field, newValue },
      req,
    }),

  // Category activities
  categoryCreated: (userId: string, categoryId: string, categoryName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'create',
      entityType: 'category',
      entityId: categoryId,
      description: `Creó categoría "${categoryName}"`,
      req,
    }),

  categoryUpdated: (userId: string, categoryId: string, categoryName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'update',
      entityType: 'category',
      entityId: categoryId,
      description: `Actualizó categoría "${categoryName}"`,
      req,
    }),

  categoryDeleted: (userId: string, categoryId: string, categoryName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'delete',
      entityType: 'category',
      entityId: categoryId,
      description: `Eliminó categoría "${categoryName}"`,
      req,
    }),

  // Raw Material activities
  rawMaterialCreated: (userId: string, materialId: string, materialName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'create',
      entityType: 'raw_material',
      entityId: materialId,
      description: `Creó materia prima "${materialName}"`,
      req,
    }),

  rawMaterialUpdated: (userId: string, materialId: string, materialName: string, changes?: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'update',
      entityType: 'raw_material',
      entityId: materialId,
      description: changes ? `Actualizó materia prima "${materialName}": ${changes}` : `Actualizó materia prima "${materialName}"`,
      req,
    }),

  rawMaterialDeleted: (userId: string, materialId: string, materialName: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'delete',
      entityType: 'raw_material',
      entityId: materialId,
      description: `Eliminó materia prima "${materialName}"`,
      req,
    }),

  rawMaterialToggled: (userId: string, materialId: string, materialName: string, newValue: boolean, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'toggle',
      entityType: 'raw_material',
      entityId: materialId,
      description: `${newValue ? 'Activó' : 'Desactivó'} materia prima "${materialName}"`,
      metadata: { newValue },
      req,
    }),

  // User management activities
  userCreated: (userId: string, newUserId: string, username: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'create',
      entityType: 'user',
      entityId: newUserId,
      description: `Creó usuario @${username}`,
      req,
    }),

  userUpdated: (userId: string, targetUserId: string, username: string, changes?: string, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'update',
      entityType: 'user',
      entityId: targetUserId,
      description: changes ? `Actualizó usuario @${username}: ${changes}` : `Actualizó usuario @${username}`,
      req,
    }),

  // Data export activities
  dataExported: (userId: string, entityType: 'order' | 'user' | 'ticket' | 'product' | 'raw_material', format: string, count: number, req?: VercelRequest) =>
    logActivity({
      userId,
      action: 'export',
      entityType,
      description: `Exportó ${count} ${entityType === 'order' ? 'órdenes' : entityType === 'user' ? 'usuarios' : entityType === 'ticket' ? 'tickets' : entityType === 'product' ? 'productos' : 'materias primas'} en formato ${format.toUpperCase()}`,
      metadata: { format, count },
      req,
    }),
};

export default ActivityLogger;
