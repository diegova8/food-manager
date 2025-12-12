# Admin Dashboard Improvement Plan

> **Project:** Ceviche Manager - World-Class Admin Dashboard
> **Created:** December 12, 2025
> **Last Updated:** December 12, 2025 (Session 2 - Phase 9 Complete)

---

## Overview

This document tracks the implementation progress of transforming the admin dashboard into an enterprise-grade, world-class experience.

### Current State
- Tab-based navigation (Orders, Users, Prices)
- Separate tickets page
- Basic CRUD operations
- Functional but not scalable

### Target State
- Sidebar navigation with collapsible menu
- Dashboard overview with analytics
- Reusable component library
- Global search, notifications, activity logs
- Dark mode support
- Mobile responsive

---

## Phase 1: Foundation

### 1.1 Folder Structure Reorganization
- [x] Create `src/components/ui/` directory for design system primitives
- [x] Create `src/components/layout/` for layout components
- [x] Create `src/components/shared/` for shared business components
- [x] Create `src/components/features/` for feature-specific components
- [x] Create `src/hooks/` for custom hooks
- [x] Create `src/stores/` for global state (if needed)
- [ ] Move and reorganize existing components

### 1.2 UI Primitives (Design System)
- [x] `Button.tsx` - Primary, secondary, danger, ghost, outline variants
- [x] `Input.tsx` - Text input with label, error state, icons
- [x] `Select.tsx` - Dropdown select component
- [x] `Badge.tsx` - Status badges with variants
- [x] `Card.tsx` - Container card component
- [x] `Modal.tsx` - Reusable modal dialog
- [x] `SlideOver.tsx` - Slide-over panel for details
- [x] `Skeleton.tsx` - Loading skeleton components
- [x] `index.ts` - Barrel export for all UI components

### 1.3 Utility Functions
- [x] `cn.ts` - Class name merge utility (clsx + tailwind-merge)
- [x] `formatters.ts` - Date, currency, number formatters
- [x] `constants.ts` - App-wide constants

### 1.4 Shared Components
- [x] `StatusBadge.tsx` - Order/Ticket/User status badges
- [x] `UserAvatar.tsx` - Avatar with initials fallback
- [x] `EmptyState.tsx` - Empty data state component
- [x] `ErrorState.tsx` - Error state component
- [x] `LoadingState.tsx` - Loading state with skeletons
- [x] `ConfirmDialog.tsx` - Confirmation modal
- [x] `SearchInput.tsx` - Search input with debounce
- [x] `FilterPanel.tsx` - Reusable filter panel (includes FilterTabs)

### 1.5 Data Table Component
- [x] `DataTable.tsx` - Main table component
- [x] `TableHeader.tsx` - Sortable headers (included in DataTable)
- [x] `TableRow.tsx` - Row component with selection (included in DataTable)
- [x] `TablePagination.tsx` - Pagination controls
- [x] Support for: sorting, filtering, selection, pagination

---

## Phase 2: Layout & Navigation

### 2.1 Admin Layout
- [x] `AdminLayout.tsx` - Main layout wrapper with Outlet
- [x] `Sidebar.tsx` - Collapsible sidebar navigation with mobile support
- [x] `AdminHeader.tsx` - Top header with search & user menu
- [x] `PageHeader.tsx` - Page title, description, breadcrumbs, and actions

### 2.2 Routing Updates
- [x] Update routes to use new AdminLayout (nested routes)
- [x] Add new routes:
  - [x] `/admin` - Dashboard (overview) - DashboardPage
  - [x] `/admin/orders` - Orders management - OrdersPage
  - [x] `/admin/users` - Users management - UsersPage
  - [x] `/admin/tickets` - Tickets management - TicketsPage
  - [x] `/admin/pricing` - Pricing configuration - PricingPage
  - [ ] `/admin/settings` - Settings page (future)
- [x] Keep legacy routes at `/admin-legacy` for backwards compatibility
- [ ] Implement lazy loading for routes (future optimization)

### 2.3 Navigation Items
- [x] Dashboard (home icon)
- [x] Orders (with pending count badge support)
- [x] Users
- [x] Tickets (with open count badge support)
- [x] Pricing
- [ ] Settings
- [ ] Activity logs (future)

---

## Phase 3: Dashboard Overview (New Page)

### 3.1 Stats Cards
- [x] Pending orders count (with link to filtered orders)
- [x] Total users count (fetched from API)
- [x] Open tickets count (fetched from API)
- [x] Revenue by date range (completed orders)
- [x] Subtitles showing context (e.g., "de X órdenes")
- [ ] Trend indicators (+X today, +X%) - deferred

### 3.2 Date Range Filtering
- [x] Today / This Week / This Month / All Time filters
- [x] Stats cards update based on selected range
- [x] Revenue label updates dynamically

### 3.3 Quick Views
- [x] Recent orders list (last 5) with status badges
- [x] Recent tickets list (last 5) with type icons
- [x] Two-column responsive layout
- [x] Quick action cards

### 3.4 API Service Enhancements
- [x] Added `getTickets()` method to API service
- [x] Parallel data fetching with Promise.all()
- [ ] Create dedicated `GET /api/admin/dashboard` endpoint (optional future optimization)

### 3.5 Charts (Deferred - Phase 3.5)
- [ ] Revenue chart (last 7 days)
- [ ] Orders by status pie chart
- [ ] Top selling products

---

## Phase 4: Orders Page Refactor

### 4.1 Components
- [x] `OrderStatusFlow.tsx` - Visual status progression with clickable steps
- [x] `OrderStatusBadge.tsx` - Compact status badge component
- [x] `OrderFilters.tsx` - Status filters, search input, action buttons
- [x] `OrderDetailSlideOver.tsx` - Slide-over panel with full order details
- [x] `index.ts` - Barrel export for orders feature components
- [ ] `OrderTimeline.tsx` - Order history timeline (deferred)
- [ ] `OrderActions.tsx` - Action buttons/dropdown (deferred)

### 4.2 Features
- [x] Search functionality (by name, phone, order ID)
- [x] Slide-over panel instead of modal for details
- [x] Visual status flow with interactive status change
- [x] Quick status update buttons in slide-over
- [x] Status filter pills with color coding
- [x] Row click to open details
- [x] Bulk selection and delete
- [x] Refresh button
- [ ] Date range filter (deferred)
- [ ] Export to CSV functionality (deferred)

### 4.3 Architecture
- [x] Created `src/components/features/orders/` folder structure
- [x] Refactored OrdersPage to use new modular components
- [x] Kept legacy OrdersManagementPage for backwards compatibility
- [ ] `useOrders.ts` custom hook (deferred - can be added later)

---

## Phase 5: Users Page Refactor

### 5.1 Components
- [x] `UserFilters.tsx` - Search, email verified filter, admin filter, bulk delete
- [x] `UserStatusBadges.tsx` - UserRoleBadge, UserVerificationBadge components
- [x] `UserDetailSlideOver.tsx` - Slide-over panel with user details
- [x] `index.ts` - Barrel export for users feature components
- [ ] `UserOrdersHistory.tsx` - User's order history (deferred)

### 5.2 Features
- [x] Refactored UsersPage with modular components
- [x] User avatar with initials
- [x] Search by name, email, username
- [x] Filter by email verification status
- [x] Filter by role (admin/client)
- [x] Sortable columns (name, email, date)
- [x] Pagination with page numbers
- [x] Slide-over panel for user details
- [x] Bulk selection and delete
- [x] Row click to open details
- [ ] Order count per user (deferred)
- [ ] View user's order history (deferred)
- [ ] Export to CSV functionality (deferred)

### 5.3 Architecture
- [x] Created `src/components/features/users/` folder structure
- [x] Refactored UsersPage to use new modular components
- [x] Kept legacy UsersManagementPage for backwards compatibility
- [ ] `useUsers.ts` custom hook (deferred)

---

## Phase 6: Tickets Page Refactor

### 6.1 Components
- [x] `TicketFilters.tsx` - Search, status filter, type filter, bulk delete, refresh
- [x] `TicketStatusBadges.tsx` - TicketStatusBadge, TicketTypeBadge components
- [x] `TicketDetailSlideOver.tsx` - Slide-over with ticket details, images, status change
- [x] `index.ts` - Barrel export for tickets feature components
- [ ] `TicketImageGallery.tsx` - Lightbox image viewer (deferred)

### 6.2 Features
- [x] Refactored TicketsPage with modular components
- [x] Search by title, description, user name/email
- [x] Filter by ticket status (Open/In Progress/Resolved/Closed)
- [x] Filter by ticket type (Suggestion/Bug)
- [x] Image count indicator in table
- [x] Image thumbnails in slide-over with external link
- [x] Status change buttons in slide-over
- [x] User avatar with registered/guest badge
- [x] Pagination with page numbers
- [x] Bulk selection and delete
- [x] Row click to open details
- [x] Refresh button
- [ ] Better image gallery with lightbox (deferred)
- [ ] Reply/comment functionality (deferred)
- [ ] Priority indicator (deferred)

### 6.3 Architecture
- [x] Created `src/components/features/tickets/` folder structure
- [x] Refactored TicketsPage to use new modular components
- [x] Kept legacy TicketsManagementPage for backwards compatibility
- [ ] `useTickets.ts` custom hook (deferred)

---

## Phase 7: Pricing Page Refactor

### 7.1 Components
- [x] `PricingTabs.tsx` - Modern tab navigation with icons and descriptions
- [x] `MarkupSlider.tsx` - Visual markup slider with presets and live preview
- [x] `CostMatrixCard.tsx` - Grouped inputs (Proteins, Liquids, Other) with emoji icons
- [x] `CevicheCatalogCard.tsx` - Improved catalog with search, filters, margin display
- [x] `OrderCalculator.tsx` - Visual order simulator with raw materials breakdown
- [x] `index.ts` - Barrel export for pricing feature components

### 7.2 Features
- [x] Refactored PricingPage with modular components
- [x] Modern tab navigation with icons and descriptions
- [x] Grouped inputs by category (Proteins, Liquids, Other)
- [x] Visual markup slider with color gradient and presets (1.5x, 2.0x, 2.5x, 3.0x)
- [x] Live profit margin preview in slider
- [x] Improved catalog with search and ingredient count filters
- [x] Margin badges with color coding (green/yellow/red)
- [x] Modern order calculator with visual ceviche grid
- [x] Raw materials breakdown in calculator
- [x] Auto-save with visual saving indicator
- [ ] Undo/redo for changes (deferred)
- [ ] Change history log (deferred)

### 7.3 Architecture
- [x] Created `src/components/features/pricing/` folder structure
- [x] Kept legacy MatrizCostos, CatalogoCeviches, CalculadoraPedidos for backwards compatibility

---

## Phase 8: Polish & UX

### 8.1 Dark Mode
- [x] `useTheme.ts` hook - Theme detection, persistence, toggle
- [x] `ThemeToggle.tsx` component - Animated sun/moon toggle
- [x] Theme toggle in AdminHeader
- [x] Tailwind dark mode configuration (`darkMode: 'class'`)
- [x] Dark mode styles for AdminLayout, AdminHeader
- [ ] Full dark mode styling for all components (deferred - foundation is ready)

### 8.2 Global Search (Cmd+K)
- [x] `CommandPalette.tsx` component - Modal with search and actions
- [x] Navigation commands (Dashboard, Orders, Users, Tickets, Pricing)
- [x] Action commands (View Menu, Logout)
- [x] Keyboard navigation (arrows, enter, escape)
- [x] Search filtering
- [x] Grouped results (Navigation, Actions)
- [ ] Search orders, users, tickets by content (deferred - requires API)

### 8.3 Notifications
- [ ] `NotificationBell.tsx` component (placeholder exists)
- [ ] `NotificationDropdown.tsx` list (deferred)
- [ ] Mark as read functionality (deferred)
- [ ] Sound notification for new orders (deferred)

### 8.4 Keyboard Shortcuts
- [x] `useKeyboardShortcuts.ts` hook
- [x] `ShortcutsHelp.tsx` modal - Visual keyboard shortcuts guide
- [x] `⌘K` - Open command palette
- [x] `g d` - Go to Dashboard
- [x] `g o` - Go to Orders
- [x] `g u` - Go to Users
- [x] `g t` - Go to Tickets
- [x] `g p` - Go to Pricing
- [x] `?` - Show shortcuts help

### 8.5 Mobile Responsive
- [x] Sidebar becomes hamburger menu (already implemented in Phase 2)
- [ ] Tables become card lists on mobile (deferred)
- [x] Touch-friendly buttons (already implemented)
- [ ] Test on various screen sizes (ongoing)

### 8.6 Hooks Created
- [x] `src/hooks/useTheme.ts` - Theme management
- [x] `src/hooks/useKeyboardShortcuts.ts` - Keyboard navigation
- [x] `src/hooks/index.ts` - Barrel export

---

## Phase 9: Advanced Features

### 9.1 Activity Logs
- [ ] `ActivityLog` model in backend
- [ ] `GET /api/activity-logs` endpoint
- [ ] Log all admin actions
- [ ] Activity logs page
- [ ] Filter by entity type, user, date

### 9.2 Analytics Dashboard
- [x] Install chart library (recharts)
- [x] Revenue over time chart (RevenueChart.tsx - Area chart, last 7 days)
- [x] Orders by status chart (OrdersByStatusChart.tsx - Pie chart)
- [x] Top products chart (TopProductsChart.tsx - Horizontal bar chart)
- [ ] Customer acquisition chart (deferred)

### 9.3 Export & Reports
- [x] Export orders to CSV (OrdersPage with export button)
- [x] Export users to CSV (UsersPage with export button)
- [x] Export tickets to CSV (TicketsPage with export button)
- [x] Created `src/utils/export.ts` utility with `exportToCSV` function
- [ ] Generate PDF reports (deferred)
- [ ] Schedule automated reports (future)

### 9.4 Settings Page
- [x] Business information (name, phone, email, address, schedule)
- [x] Notification preferences (sound, desktop, email toggles)
- [x] Theme preferences (light/dark/system selector)
- [x] Keyboard shortcuts reference
- [x] Sidebar navigation entry
- [x] Command palette integration (g s shortcut)
- [ ] Admin user management (deferred - requires backend)

---

## Phase 10: Performance

### 10.1 Data Fetching
- [ ] Consider adding React Query (@tanstack/react-query)
- [ ] Implement proper caching
- [ ] Optimistic updates

### 10.2 Bundle Optimization
- [ ] Lazy load all admin routes
- [ ] Code splitting for large components
- [ ] Analyze bundle size

### 10.3 Large Data Sets
- [ ] Virtual scrolling for large tables
- [ ] Infinite scroll option
- [ ] Efficient pagination

---

## Implementation Log

| Date | Phase | Task | Status | Notes |
|------|-------|------|--------|-------|
| 2025-12-12 | - | Created improvement plan | Done | Initial planning |
| 2025-12-12 | 1.1 | Folder structure created | Done | ui/, layout/, shared/, features/, hooks/, stores/ |
| 2025-12-12 | 1.2 | UI primitives created | Done | Button, Badge, Card, Input, Select, Modal, Skeleton |
| 2025-12-12 | 1.3 | cn utility created | Done | Installed clsx + tailwind-merge |
| 2025-12-12 | 1.4 | Shared components created | Done | StatusBadge, UserAvatar, EmptyState, ErrorState, LoadingState, ConfirmDialog, SearchInput |
| 2025-12-12 | 1.2 | SlideOver component added | Done | SlideOver, SlideOverFooter, SlideOverSection |
| 2025-12-12 | 1.3 | formatters.ts created | Done | Currency, date, phone, text formatters |
| 2025-12-12 | 1.3 | constants.ts created | Done | Order/Ticket statuses, pagination, colors |
| 2025-12-12 | 1.4 | FilterPanel added | Done | FilterPanel + FilterTabs components |
| 2025-12-12 | 1.5 | DataTable created | Done | Full table with sorting, selection, pagination |
| 2025-12-12 | 1 | **PHASE 1 COMPLETE** | Done | All foundation components ready |
| 2025-12-12 | 2 | Layout & Navigation | Done | AdminLayout, Sidebar, AdminHeader, PageHeader |
| 2025-12-12 | 3 | Dashboard Overview | Done | Stats cards, date range filtering, recent orders/tickets |
| 2025-12-12 | 4 | Orders Page Refactor | Done | OrderStatusFlow, OrderFilters, OrderDetailSlideOver |
| 2025-12-12 | 5 | Users Page Refactor | Done | UserFilters, UserStatusBadges, UserDetailSlideOver |
| 2025-12-12 | 6 | Tickets Page Refactor | Done | TicketFilters, TicketStatusBadges, TicketDetailSlideOver |
| 2025-12-12 | 7 | Pricing Page Refactor | Done | PricingTabs, MarkupSlider, CostMatrixCard, CevicheCatalogCard, OrderCalculator |
| 2025-12-12 | 8 | Polish & UX | Done | Dark mode, Command palette, Keyboard shortcuts |
| 2025-12-12 | 9.2 | Analytics Dashboard | Done | RevenueChart, OrdersByStatusChart, TopProductsChart with recharts |
| 2025-12-12 | 9.3 | CSV Exports | Done | Export utility + export buttons on Orders, Users, Tickets pages |
| 2025-12-12 | 9.4 | Settings Page | Done | Business info, notifications, theme, keyboard shortcuts reference |
| | | | | |

---

## Notes & Decisions

### Design Decisions
- Primary color: Orange (#f97316)
- Using Tailwind CSS for styling
- Slide-over panels for detail views (instead of modals)
- Sidebar navigation (instead of tabs)

### Technical Decisions
- Keep using native fetch (no React Query initially)
- No additional UI library (custom components with Tailwind)
- TypeScript strict mode

### Deferred Items
- Real-time notifications (WebSocket)
- Multi-admin collaboration
- Automated alerts
- PDF report generation

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Heroicons](https://heroicons.com/) - For icons
- [Recharts](https://recharts.org/) - For charts (when needed)

---

## How to Use This Document

1. **Starting a new session:** Read the "Implementation Log" to see what was last completed
2. **Working on a task:** Mark the checkbox as in-progress by changing `[ ]` to `[~]`
3. **Completing a task:** Mark the checkbox as done by changing `[ ]` to `[x]`
4. **Add notes:** Update the "Implementation Log" table with date and notes
5. **Making decisions:** Document them in "Notes & Decisions" section

---

*This is a living document. Update it as the project progresses.*
