// src/utils/constants.js

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Permisos por rol
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'dashboard',
    'inventory', 
    'movements',
    'reports', 
    'analysis',
    'security',
    'settings'
  ],
// src/utils/constants.js

// Roles de usuario
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
};

// Permisos por rol
export const PERMISSIONS = {
  [USER_ROLES.ADMIN]: [
    'dashboard',
    'inventory', 
    'movements',
    'reports', 
    'analysis',
    'security',
    'settings'
  ],
  [USER_ROLES.OPERATOR]: [
    'dashboard',
    'inventory',
    'movements', 
    'reports',
    'analysis'
  ],
  [USER_ROLES.VIEWER]: [
    'dashboard',
    'reports',
    'analysis'
  ]
};

// Estados de productos
export const PRODUCT_STATUS = {
  NORMAL: 'normal',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock'
};

// Tipos de movimiento
export const MOVEMENT_TYPES = {
  ENTRY: 'entrada',
  EXIT: 'salida'
};

// Estados de usuario
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

// Configuración por defecto
export const DEFAULT_SETTINGS = {
  currency: 'PEN',
  currencySymbol: 'S/',
  company: 'EconoArena',
  theme: 'dark',
  language: 'es',
  lowStockThreshold: 10,
  timezone: 'America/Lima'
};

// Mensajes del sistema
export const MESSAGES = {
  SUCCESS: {
    PRODUCT_CREATED: 'Producto creado correctamente',
    PRODUCT_UPDATED: 'Producto actualizado correctamente',
    PRODUCT_DELETED: 'Producto eliminado correctamente',
    MOVEMENT_CREATED: 'Movimiento registrado correctamente',
    USER_CREATED: 'Usuario creado correctamente',
    USER_UPDATED: 'Usuario actualizado correctamente',
    USER_DELETED: 'Usuario eliminado correctamente',
    SETTINGS_SAVED: 'Configuración guardada correctamente',
    LOGIN_SUCCESS: 'Sesión iniciada correctamente',
    LOGOUT_SUCCESS: 'Sesión cerrada correctamente'
  },
  ERROR: {
    PRODUCT_NOT_FOUND: 'Producto no encontrado',
    INSUFFICIENT_STOCK: 'Stock insuficiente',
    USER_NOT_FOUND: 'Usuario no encontrado',
    INVALID_CREDENTIALS: 'Credenciales incorrectas',
    UNAUTHORIZED: 'No tienes permisos para esta acción',
    VALIDATION_ERROR: 'Error de validación',
    GENERIC_ERROR: 'Ha ocurrido un error inesperado'
  },
  WARNING: {
    LOW_STOCK: 'Producto con stock bajo',
    UNSAVED_CHANGES: 'Tienes cambios sin guardar',
    DELETE_CONFIRMATION: '¿Estás seguro de eliminar este elemento?'
  }
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'EconoArena',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de Gestión de Inventario',
  AUTHOR: 'EconoArena Team',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['json', 'csv', 'xlsx'],
  PAGINATION_SIZE: 20,
  TOAST_DURATION: 4000
};

// Colores para gráficos
export const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#ec4899', // pink
  '#6b7280'  // gray
];

// Formatos de fecha
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: 'dd/MM/yyyy HH:mm',
  TIME: 'HH:mm',
  ISO: 'yyyy-MM-dd',
  MONTH_YEAR: 'MM/yyyy'
};

// Validaciones
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MAX_LENGTH: 100,
  SKU_MAX_LENGTH: 50,
  EMAIL_REGEX: /\S+@\S+\.\S+/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/
};

// Límites del sistema
export const SYSTEM_LIMITS = {
  MAX_PRODUCTS: 10000,
  MAX_MOVEMENTS: 50000,
  MAX_USERS: 100,
  MAX_CATEGORIES: 50,
  MAX_LOCATIONS: 20
};

export default {
  USER_ROLES,
  PERMISSIONS,
  PRODUCT_STATUS,
  MOVEMENT_TYPES,
  USER_STATUS,
  DEFAULT_SETTINGS,
  MESSAGES,
  APP_CONFIG,
  CHART_COLORS,
  DATE_FORMATS,
  VALIDATION_RULES,
  SYSTEM_LIMITS
};