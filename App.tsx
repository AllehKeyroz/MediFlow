import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardHome from './pages/DashboardHome';
import Patients from './pages/Patients';
import Funnel from './pages/Funnel';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';

// Layout Wrapper for authenticated pages
const DashboardLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen font-sans text-slate-100">
      <Sidebar />
      <div className="flex-1 w-full relative z-10">
        <Outlet />
      </div>
    </div>
  );
};

// Protected Route Component
const PrivateRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
            <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 rounded-full"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 relative z-10"></div>
        </div>
      </div>
    );
  }

  return currentUser ? <DashboardLayout /> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/pacientes" element={<Patients />} />
            <Route path="/funil" element={<Funnel />} />
            <Route path="/integracoes" element={<Integrations />} />
            <Route path="/configuracao" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;