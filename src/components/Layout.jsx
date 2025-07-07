// src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { user } = useApp();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // No mostrar layout en login
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  // Redirigir si no hay usuario autenticado
  if (!user) {
    window.location.href = '/login';
    return null;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="position-fixed w-100 h-100 bg-dark opacity-50 d-md-none"
          style={{ zIndex: 999 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-grow-1 main-content" style={{ marginLeft: '250px' }}>
        <Header onToggleSidebar={toggleSidebar} />
        
        <Container fluid className="p-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default Layout;