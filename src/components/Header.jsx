// src/components/Header.jsx
import React from 'react';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { FaBars, FaSun, FaMoon, FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const Header = ({ onToggleSidebar }) => {
  const { user, settings, updateSettings, logout, formatCurrency, metrics } = useApp();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <Navbar className="header shadow-sm">
      <div className="d-flex align-items-center justify-content-between w-100">
        {/* Lado izquierdo */}
        <div className="d-flex align-items-center">
          {/* Botón menú móvil */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-md-none me-3"
            onClick={onToggleSidebar}
          >
            <FaBars />
          </Button>

          {/* Título de página */}
          <div>
            <h4 className="mb-0" style={{ color: 'var(--text-primary)' }}>
              {getPageTitle(window.location.pathname)}
            </h4>
            <small style={{ color: 'var(--text-secondary)' }}>
              {getPageSubtitle(window.location.pathname)}
            </small>
          </div>
        </div>

        {/* Centro - Métricas rápidas */}
        <div className="d-none d-lg-flex align-items-center gap-4">
          <div className="text-center">
            <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              {metrics.totalProducts}
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>Productos</small>
          </div>
          
          <div className="text-center">
            <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              {metrics?.totalStock ? metrics.totalStock.toLocaleString() : '0'}
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>Stock Total</small>
          </div>
          
          <div className="text-center">
            <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              {formatCurrency(metrics.totalValue)}
            </div>
            <small style={{ color: 'var(--text-secondary)' }}>Valor Total</small>
          </div>

          {metrics.lowStockProducts.length > 0 && (
            <div className="text-center">
              <div style={{ color: 'var(--danger)', fontWeight: '600' }}>
                {metrics.lowStockProducts.length}
              </div>
              <small style={{ color: 'var(--text-secondary)' }}>Stock Bajo</small>
            </div>
          )}
        </div>

        {/* Lado derecho */}
        <div className="d-flex align-items-center gap-2">
          {/* Toggle de tema */}
          <Button
            variant="outline-secondary"
            size="sm"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Cambiar a tema ${settings.theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {settings.theme === 'dark' ? <FaSun /> : <FaMoon />}
          </Button>

          {/* Dropdown del usuario */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-2"
              style={{ border: '1px solid var(--border-color)' }}
            >
              <div 
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="d-none d-sm-inline">{user?.name}</span>
            </Dropdown.Toggle>

            <Dropdown.Menu style={{ 
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 8px var(--shadow)'
            }}>
              <Dropdown.Header style={{ color: 'var(--text-secondary)' }}>
                <div>{user?.name}</div>
                <small>{user?.email}</small>
              </Dropdown.Header>
              
              <Dropdown.Divider style={{ borderColor: 'var(--border-color)' }} />
              
              <Dropdown.Item 
                onClick={() => navigate('/profile')}
                style={{ color: 'var(--text-primary)' }}
                className="d-flex align-items-center gap-2"
              >
                <FaUser size={14} />
                Mi Perfil
              </Dropdown.Item>
              
              {user?.role === 'admin' && (
                <Dropdown.Item 
                  onClick={handleSettings}
                  style={{ color: 'var(--text-primary)' }}
                  className="d-flex align-items-center gap-2"
                >
                  <FaCog size={14} />
                  Configuración
                </Dropdown.Item>
              )}
              
              <Dropdown.Divider style={{ borderColor: 'var(--border-color)' }} />
              
              <Dropdown.Item 
                onClick={handleLogout}
                style={{ color: 'var(--danger)' }}
                className="d-flex align-items-center gap-2"
              >
                <FaSignOutAlt size={14} />
                Cerrar Sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    </Navbar>
  );
};

// Función para obtener el título de la página
const getPageTitle = (pathname) => {
  const titles = {
    '/dashboard': 'Dashboard',
    '/inventory': 'Control de Inventario',
    '/movements': 'Gestión de Movimientos',
    '/reports': 'Reportes',
    '/analysis': 'Análisis Avanzado',
    '/security': 'Seguridad',
    '/settings': 'Configuración'
  };
  return titles[pathname] || 'EconoArena';
};

// Función para obtener el subtítulo de la página
const getPageSubtitle = (pathname) => {
  const subtitles = {
    '/dashboard': 'Vista general del sistema',
    '/inventory': 'Gestiona tus productos y controla el stock',
    '/movements': 'Registra entradas y salidas de productos',
    '/reports': 'Genera reportes detallados de tu inventario y movimientos',
    '/analysis': 'Visualiza tendencias y patrones de tu inventario',
    '/security': 'Gestiona usuarios, permisos y configuración de seguridad',
    '/settings': 'Personaliza EconoArena según tus necesidades'
  };
  return subtitles[pathname] || 'Sistema de Gestión de Inventario';
};

export default Header;