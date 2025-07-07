// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';

// Importar estilos
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/themes.css';

// Importar componentes
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import Analysis from './pages/Analysis';
import Security from './pages/Security';
import Settings from './pages/Settings';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const user = JSON.parse(localStorage.getItem('econoarena_user') || 'null');
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
              },
              success: {
                style: {
                  border: '1px solid var(--success)',
                },
              },
              error: {
                style: {
                  border: '1px solid var(--danger)',
                },
              },
            }}
          />

          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />
            
            {/* Rutas protegidas */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Rutas principales */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="movements" element={<Movements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="analysis" element={<Analysis />} />
              
              {/* Rutas solo para admin */}
              <Route path="security" element={
                <ProtectedRoute requiredRole="admin">
                  <Security />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute requiredRole="admin">
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;