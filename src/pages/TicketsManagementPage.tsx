import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../components/Header';
import { isUserAdmin } from '../utils/jwt';
import { api } from '../services/api';
import { BulkDeleteModal } from '../components/BulkDeleteModal';

interface Ticket {
  id: string;
  type: 'suggestion' | 'bug';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  images?: string[];
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  guestEmail?: string;
  guestName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const TicketsManagementPage = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  useEffect(() => {
    if (!isUserAdmin()) {
      navigate('/menu');
      return;
    }
    fetchTickets();
  }, [navigate, pagination.page, statusFilter, typeFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', pagination.page.toString());
      params.set('limit', '20');
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);

      const response = await fetch(`/api/tickets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      setTickets(data.data.tickets);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch('/api/tickets/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ ticketId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update status');

      // Update local state
      setTickets(prev => prev.map(t =>
        t.id === ticketId ? { ...t, status: newStatus as Ticket['status'] } : t
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus as Ticket['status'] } : null);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tickets.map(t => t.id)));
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
      const response = await api.bulkDeleteTickets(Array.from(selectedIds));
      toast.success(`${response.data.deletedCount} tickets eliminados`);
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      await fetchTickets();
    } catch (error) {
      console.error('Error bulk deleting tickets:', error);
      toast.error('Error al eliminar los tickets');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getSelectedItems = () => {
    return tickets
      .filter(t => selectedIds.has(t.id))
      .map(t => ({
        id: t.id,
        label: `#${t.id.slice(-8)} - ${t.title}`
      }));
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-slate-100 text-slate-700'
    };
    const labels: Record<string, string> = {
      open: 'Abierto',
      in_progress: 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return type === 'suggestion' ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
        Sugerencia
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Bug
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (ticket: Ticket) => {
    if (ticket.user) {
      return ticket.user.firstName || ticket.user.username;
    }
    return ticket.guestName || 'Anónimo';
  };

  const getUserEmail = (ticket: Ticket) => {
    if (ticket.user) {
      return ticket.user.email;
    }
    return ticket.guestEmail || 'No disponible';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tickets de Soporte</h1>
            <p className="text-slate-600">Gestiona sugerencias y reportes de errores</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Admin
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos</option>
                <option value="open">Abierto</option>
                <option value="in_progress">En Progreso</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Todos</option>
                <option value="suggestion">Sugerencia</option>
                <option value="bug">Bug</option>
              </select>
            </div>
            <div className="flex items-end gap-4">
              <span className="text-sm text-slate-500">
                {pagination.total} ticket{pagination.total !== 1 ? 's' : ''} encontrado{pagination.total !== 1 ? 's' : ''}
              </span>
              {selectedIds.size > 0 && (
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar ({selectedIds.size})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-500">No hay tickets para mostrar</p>
          </div>
        ) : (
          <>
            {/* Tickets Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 w-12">
                        <input
                          type="checkbox"
                          checked={tickets.length > 0 && selectedIds.size === tickets.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                      </th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Ticket</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Usuario</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Tipo</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Estado</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Fecha</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-slate-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((ticket) => {
                      const isSelected = selectedIds.has(ticket.id);
                      return (
                      <tr key={ticket.id} className={`transition-colors ${isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(ticket.id)}
                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900 truncate max-w-xs">{ticket.title}</div>
                          <div className="text-xs text-slate-500">#{ticket.id.slice(-8)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-slate-900">{getUserName(ticket)}</div>
                          <div className="text-xs text-slate-500">{getUserEmail(ticket)}</div>
                        </td>
                        <td className="px-4 py-3">{getTypeBadge(ticket.type)}</td>
                        <td className="px-4 py-3">{getStatusBadge(ticket.status)}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{formatDate(ticket.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 text-slate-600">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedTicket.title}</h2>
                  <p className="text-sm text-slate-500">#{selectedTicket.id.slice(-8)}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-slate-500">Usuario</span>
                    <p className="font-medium">{getUserName(selectedTicket)}</p>
                    <p className="text-sm text-slate-500">{getUserEmail(selectedTicket)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Fecha</span>
                    <p className="font-medium">{formatDate(selectedTicket.createdAt)}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Tipo</span>
                    {getTypeBadge(selectedTicket.type)}
                  </div>
                  <div>
                    <span className="text-sm text-slate-500 block mb-1">Estado</span>
                    {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-sm text-slate-500 block mb-2">Descripción</span>
                  <div className="bg-slate-50 rounded-lg p-4 text-slate-700 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Images */}
                {selectedTicket.images && selectedTicket.images.length > 0 && (
                  <div>
                    <span className="text-sm text-slate-500 block mb-2">Imágenes ({selectedTicket.images.length})</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedTicket.images.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={img}
                            alt={`Imagen ${i + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-slate-200 hover:border-orange-400 transition-colors"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div className="border-t border-slate-200 pt-4">
                  <span className="text-sm font-medium text-slate-700 block mb-2">Cambiar Estado</span>
                  <div className="flex flex-wrap gap-2">
                    {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateTicketStatus(selectedTicket.id, status)}
                        disabled={updatingStatus || selectedTicket.status === status}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          selectedTicket.status === status
                            ? 'bg-orange-100 text-orange-700 cursor-default'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {{ open: 'Abierto', in_progress: 'En Progreso', resolved: 'Resuelto', closed: 'Cerrado' }[status]}
                      </button>
                    ))}
                  </div>
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
          itemType="tickets"
          items={getSelectedItems()}
        />
      </div>
    </div>
  );
};

export default TicketsManagementPage;
