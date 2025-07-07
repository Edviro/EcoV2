// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PRODUCTS, DEMO_MOVEMENTS, DEMO_USERS } from '../utils/mockData';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // ESTADO GLOBAL - TODO CONECTADO
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [movements, setMovements] = useState(DEMO_MOVEMENTS);
  const [users, setUsers] = useState(DEMO_USERS);
  
  // CATEGORÍAS Y UBICACIONES DINÁMICAS
  const [categories, setCategories] = useState([
    "Arena para Gatos",
    "Accesorios",
    "Alimentos",
    "Juguetes",
    "Higiene"
  ]);
  
  const [locations, setLocations] = useState([
    "Almacén Principal",
    "Almacén Secundario", 
    "Tienda",
    "Depósito"
  ]);
  
  // CONFIGURACIÓN GLOBAL - Cambios se reflejan en TODO el sistema
  const [settings, setSettings] = useState({
    currency: 'PEN',
    currencySymbol: 'S/',
    company: 'EconoArena',
    theme: 'dark',
    language: 'es',
    lowStockThreshold: 10,
    timezone: 'America/Lima',
    email: 'info@econoarena.com',
    phone: '+51 999 888 777',
    address: 'Av. Principal 123, Lima, Perú'
  });

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem('econoarena_settings');
    const savedUser = localStorage.getItem('econoarena_user');
    const savedCategories = localStorage.getItem('econoarena_categories');
    const savedLocations = localStorage.getItem('econoarena_locations');
    const savedProducts = localStorage.getItem('econoarena_products');
    const savedMovements = localStorage.getItem('econoarena_movements');
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    if (savedMovements) {
      setMovements(JSON.parse(savedMovements));
    }
  }, []);

  // Guardar cambios en localStorage
  useEffect(() => {
    localStorage.setItem('econoarena_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('econoarena_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('econoarena_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('econoarena_movements', JSON.stringify(movements));
  }, [movements]);

  // FUNCIONES QUE CONECTAN TODOS LOS MÓDULOS

  // Login con datos demo
  const login = (username, password) => {
    const foundUser = DEMO_USERS.find(u => 
      u.username === username && u.password === password
    );
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('econoarena_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('econoarena_user');
  };

  // GESTIÓN DE CATEGORÍAS
  const addCategory = (categoryName) => {
    const trimmedName = categoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories(prev => [...prev, trimmedName]);
      return true;
    }
    return false;
  };

  const updateCategory = (oldName, newName) => {
    const trimmedNewName = newName.trim();
    if (trimmedNewName && !categories.includes(trimmedNewName)) {
      setCategories(prev => prev.map(cat => cat === oldName ? trimmedNewName : cat));
      
      // Actualizar productos que usen esta categoría
      setProducts(prev => prev.map(product => 
        product.category === oldName 
          ? { ...product, category: trimmedNewName }
          : product
      ));
      return true;
    }
    return false;
  };

  const deleteCategory = (categoryName) => {
    const productsUsingCategory = products.filter(p => p.category === categoryName);
    if (productsUsingCategory.length > 0) {
      return { success: false, message: `No se puede eliminar. ${productsUsingCategory.length} productos usan esta categoría.` };
    }
    
    setCategories(prev => prev.filter(cat => cat !== categoryName));
    return { success: true };
  };

  // GESTIÓN DE UBICACIONES
  const addLocation = (locationName) => {
    const trimmedName = locationName.trim();
    if (trimmedName && !locations.includes(trimmedName)) {
      setLocations(prev => [...prev, trimmedName]);
      return true;
    }
    return false;
  };

  const updateLocation = (oldName, newName) => {
    const trimmedNewName = newName.trim();
    if (trimmedNewName && !locations.includes(trimmedNewName)) {
      setLocations(prev => prev.map(loc => loc === oldName ? trimmedNewName : loc));
      
      // Actualizar productos que usen esta ubicación
      setProducts(prev => prev.map(product => 
        product.location === oldName 
          ? { ...product, location: trimmedNewName }
          : product
      ));
      return true;
    }
    return false;
  };

  const deleteLocation = (locationName) => {
    const productsUsingLocation = products.filter(p => p.location === locationName);
    if (productsUsingLocation.length > 0) {
      return { success: false, message: `No se puede eliminar. ${productsUsingLocation.length} productos usan esta ubicación.` };
    }
    
    setLocations(prev => prev.filter(loc => loc !== locationName));
    return { success: true };
  };

  // Agregar producto - Se refleja automáticamente en Dashboard
  const addProduct = (productData) => {
    const newProduct = {
      ...productData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    
    // Auto-generar movimiento de entrada inicial
    if (productData.initialStock > 0) {
      addMovement({
        productId: newProduct.id,
        product: newProduct.name,
        type: 'entrada',
        quantity: productData.initialStock,
        reason: 'Stock inicial',
        user: user?.name || 'Sistema'
      });
    }
    
    return newProduct;
  };

  // Actualizar producto
  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  // Eliminar producto
  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setMovements(prev => prev.filter(m => m.productId !== id));
  };

  // Agregar movimiento - ACTUALIZA STOCK AUTOMÁTICAMENTE
  const addMovement = (movementData) => {
    const newMovement = {
      ...movementData,
      id: Date.now(),
      date: new Date().toISOString(),
      reference: `${movementData.type.toUpperCase()}-${new Date().getFullYear()}-${String(movements.length + 1).padStart(3, '0')}`
    };

    // CONEXIÓN CLAVE: Actualizar stock del producto
    const product = products.find(p => p.id === movementData.productId);
    if (product) {
      const stockChange = movementData.type === 'entrada' 
        ? movementData.quantity 
        : -movementData.quantity;
      
      updateProduct(movementData.productId, {
        stock: Math.max(0, product.stock + stockChange),
        lastMovement: new Date().toISOString()
      });
    }

    setMovements(prev => [...prev, newMovement]);
    return newMovement;
  };

  // Actualizar configuración - SE REFLEJA EN TODO EL SISTEMA
  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('econoarena_settings', JSON.stringify(updated));
    
    // Aplicar tema inmediatamente
    if (newSettings.theme) {
      document.documentElement.setAttribute('data-theme', newSettings.theme);
    }
  };

  // Gestión de usuarios (solo admin)
  const addUser = (userData) => {
    const newUser = {
      ...userData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      lastAccess: null,
      status: 'active'
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };

  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, ...updates } : u
    ));
  };

  const deleteUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // MÉTRICAS CALCULADAS EN TIEMPO REAL
  const metrics = {
    totalProducts: products.length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
    lowStockProducts: products.filter(p => p.stock <= settings.lowStockThreshold),
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0),
    todayMovements: movements.filter(m => {
      const today = new Date().toDateString();
      const movementDate = new Date(m.date).toDateString();
      return today === movementDate;
    }),
    todayEntries: movements.filter(m => {
      const today = new Date().toDateString();
      const movementDate = new Date(m.date).toDateString();
      return today === movementDate && m.type === 'entrada';
    }).length,
    todayExits: movements.filter(m => {
      const today = new Date().toDateString();
      const movementDate = new Date(m.date).toDateString();
      return today === movementDate && m.type === 'salida';
    }).length
  };

  // PERMISOS DINÁMICOS
  const hasPermission = (module) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const operatorModules = ['dashboard', 'inventory', 'movements', 'reports', 'analysis'];
    const viewerModules = ['dashboard', 'reports', 'analysis'];
    
    switch (user.role) {
      case 'operator':
        return operatorModules.includes(module);
      case 'viewer':
        return viewerModules.includes(module);
      default:
        return false;
    }
  };

  // Formatear moneda usando configuración global
  const formatCurrency = (amount) => {
    return `${settings.currencySymbol} ${amount.toFixed(2)}`;
  };

  // Aplicar tema al cargar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const value = {
    // Estado
    user,
    products,
    movements,
    users,
    settings,
    categories,
    locations,
    metrics,
    
    // Funciones de autenticación
    login,
    logout,
    
    // Funciones de productos
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Funciones de movimientos
    addMovement,
    
    // Funciones de usuarios
    addUser,
    updateUser,
    deleteUser,
    
    // Funciones de configuración
    updateSettings,
    
    // Funciones de categorías
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Funciones de ubicaciones
    addLocation,
    updateLocation,
    deleteLocation,
    
    // Utilidades
    hasPermission,
    formatCurrency
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};