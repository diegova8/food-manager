import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { api } from '../services/api';

interface Ticket {
  id: string;
  type: 'suggestion' | 'bug';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadTickets();
  }, [navigate]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const response = await api.getMyTickets();
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Abierto' };
      case 'in_progress':
        return { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', label: 'En Progreso' };
      case 'resolved':
        return { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Resuelto' };
      case 'closed':
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: 'Cerrado' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500', label: status };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'suggestion':
        return { bg: 'bg-teal-100', text: 'text-teal-700', label: 'Sugerencia', icon: '💡' };
      case 'bug':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Error', icon: '🐛' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', label: type, icon: '📝' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-slate-600 font-medium">Cargando tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Mis Tickets</h1>
            <p className="text-slate-500 text-sm">{tickets.length} tickets creados</p>
          </div>
        </div>

        {/* Tickets List */}
        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No tienes tickets</h2>
            <p className="text-slate-500 mb-6">Aún no has enviado ninguna sugerencia o reporte</p>
            <button
              onClick={() => navigate('/menu')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg"
            >
              Ir al Menú
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => {
              const statusConfig = getStatusConfig(ticket.status);
              const typeConfig = getTypeConfig(ticket.type);

              return (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
                        <span>{typeConfig.icon}</span>
                        {typeConfig.label}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                        {statusConfig.label}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">#{ticket.id.slice(-8)}</span>
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-2">{ticket.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{ticket.description}</p>

                  {ticket.images && ticket.images.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-400">{ticket.images.length} imagen{ticket.images.length > 1 ? 'es' : ''} adjunta{ticket.images.length > 1 ? 's' : ''}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                    <span>Creado: {formatDate(ticket.createdAt)}</span>
                    {ticket.updatedAt !== ticket.createdAt && (
                      <span>Actualizado: {formatDate(ticket.updatedAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTicketsPage;
