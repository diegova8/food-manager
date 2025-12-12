/**
 * CSV Export Utilities
 * Converts data arrays to CSV format and triggers download
 */

type CSVValue = string | number | boolean | null | undefined;

/**
 * Escape a value for CSV format
 */
function escapeCSV(value: CSVValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, newline, or quotes, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert an array of objects to CSV string
 */
export function toCSV<T>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return columns.map(c => c.label).join(',');
  }

  // Header row
  const headerRow = columns.map(c => escapeCSV(c.label)).join(',');

  // Data rows
  const dataRows = data.map(row =>
    columns.map(c => escapeCSV(row[c.key] as CSVValue)).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv'): void {
  const blob = new Blob(['\ufeff' + content], { type: `${mimeType};charset=utf-8` }); // BOM for Excel
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and download
 */
export function exportToCSV<T>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
): void {
  const csv = toCSV(data, columns);
  const fullFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csv, fullFilename);
}

// Pre-defined export configurations for common entities

export interface OrderExportRow {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: string;
  total: number;
  status: string;
  createdAt: string;
}

export const ORDER_EXPORT_COLUMNS: { key: keyof OrderExportRow; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'customerName', label: 'Cliente' },
  { key: 'customerPhone', label: 'Teléfono' },
  { key: 'customerEmail', label: 'Email' },
  { key: 'items', label: 'Productos' },
  { key: 'total', label: 'Total (₡)' },
  { key: 'status', label: 'Estado' },
  { key: 'createdAt', label: 'Fecha' },
];

export interface UserExportRow {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isAdmin: string;
  emailVerified: string;
  createdAt: string;
}

export const USER_EXPORT_COLUMNS: { key: keyof UserExportRow; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Usuario' },
  { key: 'firstName', label: 'Nombre' },
  { key: 'lastName', label: 'Apellido' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'isAdmin', label: 'Admin' },
  { key: 'emailVerified', label: 'Email Verificado' },
  { key: 'createdAt', label: 'Fecha Registro' },
];

export interface TicketExportRow {
  id: string;
  type: string;
  title: string;
  description: string;
  userName: string;
  userEmail: string;
  status: string;
  createdAt: string;
}

export const TICKET_EXPORT_COLUMNS: { key: keyof TicketExportRow; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'type', label: 'Tipo' },
  { key: 'title', label: 'Título' },
  { key: 'description', label: 'Descripción' },
  { key: 'userName', label: 'Usuario' },
  { key: 'userEmail', label: 'Email' },
  { key: 'status', label: 'Estado' },
  { key: 'createdAt', label: 'Fecha' },
];
