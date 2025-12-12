import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { UserFilters, UserDetailSlideOver, UserRoleBadge, UserVerificationBadge } from '../../components/features/users';
import { UserAvatar } from '../../components/shared/UserAvatar';
import { LoadingState } from '../../components/shared/LoadingState';
import { EmptyState } from '../../components/shared/EmptyState';
import { ConfirmDialog } from '../../components/shared/ConfirmDialog';
import { BulkDeleteModal } from '../../components/BulkDeleteModal';
import { api } from '../../services/api';
import { exportToCSV, USER_EXPORT_COLUMNS, type UserExportRow } from '../../utils/export';

interface User {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
}

const ITEMS_PER_PAGE = 15;

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('');
  const [isAdminFilter, setIsAdminFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // SlideOver state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);

  // Delete modals
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      const response = await api.getUsers({
        search: search || undefined,
        emailVerified: emailVerifiedFilter === '' ? undefined : emailVerifiedFilter === 'true',
        isAdmin: isAdminFilter === '' ? undefined : isAdminFilter === 'true',
        limit: ITEMS_PER_PAGE,
        offset,
        sortBy,
        sortOrder,
      });

      if (response.success) {
        setUsers(response.data.users);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, emailVerifiedFilter, isAdminFilter, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, emailVerifiedFilter, isAdminFilter]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map(u => u._id)));
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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await api.bulkDeleteUsers([userToDelete._id]);
      setShowDeleteModal(false);
      setShowDetailPanel(false);
      setUserToDelete(null);
      setSelectedUser(null);
      await loadUsers();
      toast.success('Usuario eliminado correctamente');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      await api.bulkDeleteUsers(Array.from(selectedIds));
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      await loadUsers();
      toast.success(`${selectedIds.size} usuarios eliminados`);
    } catch (error) {
      console.error('Error deleting users:', error);
      toast.error('Error al eliminar los usuarios');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const getSelectedItems = () => {
    return users
      .filter(u => selectedIds.has(u._id))
      .map(u => ({
        id: u._id,
        label: `${u.firstName || ''} ${u.lastName || ''} (${u.email || u.username})`.trim()
      }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExport = useCallback(() => {
    const dataToExport = users.map((user): UserExportRow => ({
      id: user._id,
      username: user.username,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      isAdmin: user.isAdmin ? 'Sí' : 'No',
      emailVerified: user.emailVerified ? 'Sí' : 'No',
      createdAt: formatDate(user.createdAt),
    }));

    const filename = `usuarios_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(dataToExport, USER_EXPORT_COLUMNS, filename);
    toast.success(`${dataToExport.length} usuarios exportados`);
  }, [users]);

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return (
      <svg className="w-4 h-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d={sortOrder === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
      </svg>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div>
        <PageHeader title="Usuarios" description="Gestiona los usuarios registrados" />
        <LoadingState variant="skeleton" rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" description="Gestiona los usuarios registrados" />

      {/* Filters */}
      <UserFilters
        search={search}
        onSearchChange={setSearch}
        emailVerifiedFilter={emailVerifiedFilter}
        onEmailVerifiedChange={setEmailVerifiedFilter}
        isAdminFilter={isAdminFilter}
        onIsAdminChange={setIsAdminFilter}
        totalCount={totalCount}
        selectedCount={selectedIds.size}
        onBulkDelete={() => setShowBulkDeleteModal(true)}
        onClearFilters={() => {
          setSearch('');
          setEmailVerifiedFilter('');
          setIsAdminFilter('');
        }}
        onExport={handleExport}
      />

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <EmptyState
              title="No hay usuarios"
              message={search || emailVerifiedFilter || isAdminFilter
                ? 'No se encontraron usuarios con esos criterios'
                : 'Aún no hay usuarios registrados'}
              icon={
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
                          checked={users.length > 0 && selectedIds.size === users.length}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('firstName')}
                      >
                        Usuario <SortIcon field="firstName" />
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('email')}
                      >
                        Email <SortIcon field="email" />
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th
                        className="px-4 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        Registrado <SortIcon field="createdAt" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => {
                      const isSelected = selectedIds.has(user._id);
                      const fullName = user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username;

                      return (
                        <tr
                          key={user._id}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailPanel(true);
                          }}
                        >
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(user._id)}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={fullName} size="sm" />
                              <div>
                                <p className="font-medium text-slate-800">{fullName}</p>
                                <p className="text-xs text-slate-500">@{user.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-slate-600">{user.email || '-'}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-slate-600">{user.phone || '-'}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <UserVerificationBadge verified={user.emailVerified} size="sm" />
                          </td>
                          <td className="px-4 py-4 text-center">
                            <UserRoleBadge isAdmin={user.isAdmin} size="sm" />
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-slate-600 text-sm">{formatDate(user.createdAt)}</span>
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

      {/* User Detail SlideOver */}
      <UserDetailSlideOver
        user={selectedUser}
        isOpen={showDetailPanel}
        onClose={() => {
          setShowDetailPanel(false);
          setSelectedUser(null);
        }}
        onDelete={(user) => {
          setUserToDelete(user);
          setShowDeleteModal(true);
        }}
      />

      {/* Single Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Eliminar Usuario"
        message={
          userToDelete
            ? `¿Estás seguro de que deseas eliminar a ${userToDelete.firstName || userToDelete.username}? Esta acción no se puede deshacer.`
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
        itemType="usuarios"
        items={getSelectedItems()}
      />
    </div>
  );
}

export default UsersPage;
