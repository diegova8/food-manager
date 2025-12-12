import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { TicketFilters, TicketDetailSlideOver, TicketStatusBadge, TicketTypeBadge } from '../../components/features/tickets';
import { UserAvatar } from '../../components/shared/UserAvatar';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { BulkDeleteModal } from '../../components/BulkDeleteModal';
import { api } from '../../services/api';
import { exportToCSV, TICKET_EXPORT_COLUMNS, type TicketExportRow } from '../../utils/export';
import { TICKET_STATUS_LABELS, TICKET_TYPE_LABELS } from '../../utils/constants';

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type TicketType = 'suggestion' | 'bug';

interface Ticket {
  id: string;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
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

const ITEMS_PER_PAGE = 15;

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // SlideOver state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete modals
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      // Note: search is handled client-side for now since API doesn't support it

      const response = await fetch(`/api/tickets?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      let filteredTickets = data.data.tickets;

      // Client-side search filtering
      if (search) {
        const searchLower = search.toLowerCase();
        filteredTickets = filteredTickets.filter((ticket: Ticket) =>
          ticket.title.toLowerCase().includes(searchLower) ||
          ticket.description.toLowerCase().includes(searchLower) ||
          (ticket.user?.firstName?.toLowerCase().includes(searchLower)) ||
          (ticket.user?.lastName?.toLowerCase().includes(searchLower)) ||
          (ticket.user?.email?.toLowerCase().includes(searchLower)) ||
          (ticket.guestName?.toLowerCase().includes(searchLower)) ||
          (ticket.guestEmail?.toLowerCase().includes(searchLower))
        );
      }

      setTickets(filteredTickets);
      setTotalCount(search ? filteredTickets.length : data.data.pagination.total);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast.error('Error al cargar los tickets');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, search]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const toggleSelectAll = () => {
    if (selectedIds.size === tickets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tickets.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
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
        t.id === ticketId ? { ...t, status: newStatus } : t
      ));

      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: newStatus } : null);
      }

      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar el estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    setDeleting(true);
    try {
      await api.bulkDeleteTickets([ticketToDelete.id]);
      setShowDeleteModal(false);
      setShowDetailPanel(false);
      setTicketToDelete(null);
      setSelectedTicket(null);
      await loadTickets();
      toast.success('Ticket eliminado correctamente');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Error al eliminar el ticket');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const response = await api.bulkDeleteTickets(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      await loadTickets();
      toast.success(`${response.data.deletedCount} tickets eliminados`);
    } catch (error) {
      console.error('Error deleting tickets:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUserName = (ticket: Ticket) => {
    if (ticket.user) {
      return ticket.user.firstName
        ? `${ticket.user.firstName} ${ticket.user.lastName || ''}`
        : ticket.user.username;
    }
    return ticket.guestName || 'Anónimo';
  };

  const getUserEmail = (ticket: Ticket) => {
    if (ticket.user) {
      return ticket.user.email;
    }
    return ticket.guestEmail || 'No disponible';
  };

  const handleExport = useCallback(() => {
    const dataToExport = tickets.map((ticket): TicketExportRow => ({
      id: ticket.id,
      type: TICKET_TYPE_LABELS[ticket.type] || ticket.type,
      title: ticket.title,
      description: ticket.description,
      userName: getUserName(ticket),
      userEmail: getUserEmail(ticket),
      status: TICKET_STATUS_LABELS[ticket.status] || ticket.status,
      createdAt: formatDate(ticket.createdAt),
    }));

    const filename = `tickets_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(dataToExport, TICKET_EXPORT_COLUMNS, filename);
    toast.success(`${dataToExport.length} tickets exportados`);
  }, [tickets]);

  if (loading && tickets.length === 0) {
    return (
      <div>
        <PageHeader title="Tickets de Soporte" description="Gestiona las consultas y reportes de clientes" />
        <LoadingState variant="skeleton" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Tickets de Soporte" description="Gestiona las consultas y reportes de clientes" />

      {/* Filters */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        totalCount={totalCount}
        selectedCount={selectedIds.size}
        onBulkDelete={() => setShowBulkDeleteModal(true)}
        onClearFilters={() => {
          setSearch('');
          setStatusFilter('');
          setTypeFilter('');
        }}
        onRefresh={loadTickets}
        onExport={handleExport}
      />

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <EmptyState
              title="No hay tickets"
              message={search || statusFilter || typeFilter
                ? 'No se encontraron tickets con esos criterios'
                : 'Aún no hay tickets registrados'}
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-4 w-12">
                        <input
                          type="checkbox"
                          checked={tickets.length > 0 && selectedIds.size === tickets.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Ticket
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Imágenes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tickets.map((ticket) => {
                      const isSelected = selectedIds.has(ticket.id);
                      const userName = getUserName(ticket);

                      return (
                        <tr
                          key={ticket.id}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowDetailPanel(true);
                          }}
                        >
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(ticket.id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="max-w-xs">
                              <p className="font-medium text-slate-800 truncate">{ticket.title}</p>
                              <p className="text-xs text-slate-500">#{ticket.id.slice(-8)}</p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={userName} size="sm" />
                              <div>
                                <p className="font-medium text-slate-800 text-sm">{userName}</p>
                                <p className="text-xs text-slate-500">{getUserEmail(ticket)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <TicketTypeBadge type={ticket.type} size="sm" />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <TicketStatusBadge status={ticket.status} size="sm" />
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-slate-600 text-sm">{formatDate(ticket.createdAt)}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {ticket.images && ticket.images.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {ticket.images.length}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-600">
                    Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Anterior
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 rounded-lg text-sm ${
                              currentPage === pageNum
                                ? 'bg-blue-500 text-white'
                                : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail SlideOver */}
      <TicketDetailSlideOver
        ticket={selectedTicket}
        isOpen={showDetailPanel}
        onClose={() => {
          setShowDetailPanel(false);
          setSelectedTicket(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={(ticket) => {
          setTicketToDelete(ticket);
          setShowDeleteModal(true);
        }}
        isUpdating={updatingStatus}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTicketToDelete(null);
        }}
        onConfirm={handleDeleteTicket}
        title="Eliminar Ticket"
        message={
          ticketToDelete
            ? `¿Estás seguro de que deseas eliminar el ticket "${ticketToDelete.title}"? Esta acción no se puede deshacer.`
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
        itemType="tickets"
        items={getSelectedItems()}
      />
    </div>
  );
}

export default TicketsPage;
