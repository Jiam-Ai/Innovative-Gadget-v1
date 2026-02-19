
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from './services/storageService';
import { UIProvider } from './contexts/UIContext';
import { CartProvider } from './contexts/CartContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Recharge from './pages/Recharge';
import History from './pages/History';
import Security from './pages/Security';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import TrackOrder from './pages/TrackOrder';
import Wishlist from './pages/Wishlist';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPackages from './pages/admin/AdminPackages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMaintenance from './pages/admin/AdminMaintenance';
import AdminLogin from './pages/admin/AdminLogin';

import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { ChatBot } from './components/ChatBot';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const user = getCurrentUser();
  if (!user || !user.isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen font-sans flex relative">
      {!isAuthPage && !isAdminPage && <Sidebar />}
      
      <div className={`flex-1 flex flex-col min-h-screen relative w-full overflow-x-hidden ${!isAuthPage && !isAdminPage ? 'md:ml-72' : ''}`}>
        <main className={`flex-1 w-full max-w-7xl mx-auto animate-in fade-in duration-500 ${!isAuthPage && !isAdminPage ? 'pb-24 md:pb-8 md:px-8 md:pt-8' : ''}`}>
          {children}
        </main>
        
        {!isAuthPage && !isAdminPage && (
          <>
            <BottomNav />
            <ChatBot />
          </>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UIProvider>
      <CartProvider>
        <HashRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/track" element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                <Route index element={<Navigate to="overview" replace />} />
                <Route path="overview" element={<AdminOverview />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="analytics" element={<AdminOverview />} />
                <Route path="logs" element={<AdminTransactions />} />
                <Route path="maintenance" element={<AdminMaintenance />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </HashRouter>
      </CartProvider>
    </UIProvider>
  );
};

export default App;
