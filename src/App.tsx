import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
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
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute adminOnly={true}>
              <TicketsManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/menu" replace />} />
        {/* Catch-all route for 404 - redirect to menu */}
        <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
