import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Sidebar, defaultNavItems, type NavItem } from './Sidebar';
import { AdminHeader } from './AdminHeader';
import { CommandPalette } from '../shared/CommandPalette';
import { ShortcutsHelp } from '../shared/ShortcutsHelp';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { decodeJWT, type JWTPayload } from '../../utils/jwt';
import { STORAGE_KEYS } from '../../utils/constants';

export interface AdminLayoutProps {
  navItems?: NavItem[];
  pendingOrdersCount?: number;
  openTicketsCount?: number;
}

export function AdminLayout({
  navItems: customNavItems,
  pendingOrdersCount = 0,
  openTicketsCount = 0,
}: AdminLayoutProps) {
  const location = useLocation();

  // Get user from JWT token
  const [user, setUser] = useState<JWTPayload | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      const decoded = decodeJWT(token);
      setUser(decoded);
    }
  }, []);

  // Persist sidebar state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.sidebarCollapsed);
    return stored === 'true';
  });

  // Mobile sidebar state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Command palette and shortcuts help state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onOpenShortcutsHelp: () => setIsShortcutsHelpOpen(true),
    enabled: !isCommandPaletteOpen && !isShortcutsHelpOpen,
  });

  // Update localStorage when collapsed state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, String(isCollapsed));
  }, [isCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Build nav items with badges
  const navItems = customNavItems || defaultNavItems.map((item) => {
    if (item.href === '/admin/orders') {
      return { ...item, badge: pendingOrdersCount };
    }
    if (item.href === '/admin/tickets') {
      return { ...item, badge: openTicketsCount };
    }
    return item;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={() => setIsCollapsed(!isCollapsed)}
          navItems={navItems}
          userName={user?.firstName || user?.username}
          userRole={user?.isAdmin ? 'Administrador' : 'Usuario'}
        />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 lg:hidden',
          'transform transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          isCollapsed={false}
          onToggle={() => setIsMobileOpen(false)}
          navItems={navItems}
          userName={user?.firstName || user?.username}
          userRole={user?.isAdmin ? 'Administrador' : 'Usuario'}
        />
      </div>

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300 ease-in-out',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        )}
      >
        {/* Header */}
        <AdminHeader
          showMenuButton={true}
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Keyboard Shortcuts Help */}
      <ShortcutsHelp
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />
    </div>
  );
}
