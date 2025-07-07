// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, 
  FaBoxes, 
  FaExchangeAlt, 
  FaChartBar, 
  FaChartLine, 
  FaUsers, 
  FaCog,
  FaWarehouse
} from 'react-icons/fa';
import { useApp } from '../context/AppContext';

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, hasPermission } = useApp();
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: FaHome,
      label: 'Dashboard',
      permission: 'dashboard'
    },
    {
      path: '/inventory',
      icon: FaBoxes,
      label: 'Inventario',
      permission: 'inventory'
    },
    {
      path: '/movements',
      icon: FaExchangeAlt,
      label: 'Movimientos',
      permission: 'movements'
    },
    {
      path: '/reports',
      icon: FaChartBar,
      label: 'Reportes',
      permission: 'reports'
    },
    {
      path: '/analysis',
      icon: FaChartLine,
      label: 'Análisis',
      permission: 'analysis'
    },
    {
      path: '/security',
      icon: FaUsers,
      label: 'Seguridad',
      permission: 'security'
    },
    {
      path: '/settings',
      icon: FaCog,
      label: 'Configuración',
      permission: 'settings'
    }
  ];

  return (
    <div className={`sidebar position-fixed h-100 ${isOpen ? 'show' : ''}`} style={{ width: '250px', zIndex: 1000 }}>
      {/* Logo y título */}
      <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center me-2"
            style={{ 
              width: '40px', 
              height: '40px', 
              background: 'var(--gradient-primary)',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold'
            }}
          >
            E
          </div>
          <div>
            <h5 className="mb-0" style={{ color: 'var(--text-primary)' }}>EconoArena</h5>
            <small style={{ color: 'var(--text-secondary)' }}>Sistema de Inventario</small>
          </div>
        </div>
      </div>

      {/* Información del usuario */}
      <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
        <div className="d-flex align-items-center">
          <div 
            className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
            style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow-1">
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              {user?.name}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'operator' ? 'Operador' : 'Visualizador'}
            </div>
          </div>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-grow-1 p-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          const hasAccess = hasPermission(item.permission);

          // No mostrar items sin permiso
          if (!hasAccess) return null;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => window.innerWidth < 768 && onToggle()}
            >
              <IconComponent size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="p-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
        <div className="d-flex align-items-center justify-content-between">
          <small style={{ color: 'var(--text-secondary)' }}>
            v1.0.0 Demo
          </small>
          <FaWarehouse 
            size={16} 
            style={{ color: 'var(--text-secondary)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;