// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // We'll create this
import LoginPage from './pages/common/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import ProductBrowsePage from './pages/customer/ProductBrowsePage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductManagement from './pages/admin/AdminProductManagement';
import AdminCustomerManagement from './pages/admin/AdminCustomerManagement';
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>; // Or a spinner
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />; // Redirect if not authorized
    return children;
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Common Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Customer Portal Routes */}
                    <Route path="/" element={<PrivateRoute roles={['customer']}> <CustomerDashboard /> </PrivateRoute>} />
                    <Route path="/products" element={<PrivateRoute roles={['customer']}> <ProductBrowsePage /> </PrivateRoute>} />
                    <Route path="/cart" element={<PrivateRoute roles={['customer']}> <CartPage /> </PrivateRoute>} />
                    <Route path="/checkout" element={<PrivateRoute roles={['customer']}> <CheckoutPage /> </PrivateRoute>} />
                    <Route path="/my-orders" element={<PrivateRoute roles={['customer']}> <CustomerOrdersPage /> </PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute roles={['customer']}> <CustomerProfilePage /> </PrivateRoute>} />

                    {/* Admin Portal Routes */}
                    <Route path="/admin" element={<PrivateRoute roles={['admin']}> <AdminDashboard /> </PrivateRoute>} />
                    <Route path="/admin/products" element={<PrivateRoute roles={['admin']}> <AdminProductManagement /> </PrivateRoute>} />
                    <Route path="/admin/customers" element={<PrivateRoute roles={['admin']}> <AdminCustomerManagement /> </PrivateRoute>} />
                    <Route path="/admin/orders" element={<PrivateRoute roles={['admin']}> <AdminOrderManagement /> </PrivateRoute>} />
                    <Route path="/admin/settings" element={<PrivateRoute roles={['admin']}> <AdminSettingsPage /> </PrivateRoute>} />

                    {/* Catch-all for unauthenticated users, redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;