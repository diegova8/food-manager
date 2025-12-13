import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import TicketsManagementPage from './pages/TicketsManagementPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProfilePage from './pages/ProfilePage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyTicketsPage from './pages/MyTicketsPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomeGuide from './components/WelcomeGuide';
import { TutorialProvider, useTutorial } from './context/TutorialContext';

// New Admin Layout and Pages
import { AdminLayout } from './components/layout/AdminLayout';
import { DashboardPage, OrdersPage, UsersPage, TicketsPage, PricingPage, SettingsPage, ActivityLogsPage, ProductsPage, CategoriesPage, RawMaterialsPage } from './pages/admin';

function GlobalTutorial() {
  const { showTutorial, closeTutorial } = useTutorial();

  if (!showTutorial) return null;

  return <WelcomeGuide onComplete={closeTutorial} />;
}

function App() {
  return (
    <TutorialProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <GlobalTutorial />
        <Routes>
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders" element={<MyOrdersPage />} />
        <Route path="/profile/orders/:id" element={<OrderDetailPage />} />
        <Route path="/profile/tickets" element={<MyTicketsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />

        {/* Legacy Admin Routes (keeping for backwards compatibility) */}
        <Route
          path="/admin-legacy"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-legacy/tickets"
          element={
            <ProtectedRoute adminOnly={true}>
              <TicketsManagementPage />
            </ProtectedRoute>
          }
        />

        {/* New Admin Routes with Sidebar Layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="raw-materials" element={<RawMaterialsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="activity" element={<ActivityLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/" element={<HomePage />} />
        {/* Catch-all route for 404 - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TutorialProvider>
  );
}

export default App;
