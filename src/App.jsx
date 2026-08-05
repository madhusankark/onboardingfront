import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ProtectedRoute, { RoleRoute, PublicOnlyRoute } from './components/RouteGuards';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import EditProfile from './pages/provider/EditProfile';
import Documents from './pages/provider/Documents';
import ApplicationStatus from './pages/provider/ApplicationStatus';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProvidersList from './pages/admin/ProvidersList';
import ProviderDetail from './pages/admin/ProviderDetail';
import ManageServices from './pages/admin/ManageServices';
import ManageBookings from './pages/admin/ManageBookings';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

import CustomerOrders from './pages/customer/CustomerOrders';
import CartPage from './pages/CartPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>

          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              {/* Cart page — accessible to guests too so they can browse, login gated at checkout */}
              <Route path="/cart" element={<CartPage />} />

              {/* Public only */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/user/profile" element={<UserProfile />} />

                {/* Customer routes */}
                <Route element={<RoleRoute roles={['customer']} />}>
                  <Route path="/customer/orders" element={<CustomerOrders />} />
                </Route>


                {/* Provider routes */}
                <Route element={<RoleRoute roles={['provider']} />}>
                  <Route path="/dashboard" element={<ProviderDashboard />} />
                  <Route path="/profile" element={<EditProfile />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/status" element={<ApplicationStatus />} />
                </Route>

                {/* Admin routes */}
                <Route element={<RoleRoute roles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/providers" element={<ProvidersList />} />
                  <Route path="/admin/providers/:id" element={<ProviderDetail />} />
                  <Route path="/admin/services" element={<ManageServices />} />
                  <Route path="/admin/bookings" element={<ManageBookings />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}