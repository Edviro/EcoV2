// src/context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { productService, movementService, userService, settingsService } from '../services/supabaseService';
import toast from 'react-hot-toast';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // ESTADO GLOBAL
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // CATEGORÍAS Y UBICACIONES (mantenidas localmente)
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
  
  // CONFIGURACIÓN GLOBAL
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

  // CARGAR DATOS INICIALES
  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      
      // Verificar usuario guardado
      const savedUser = localStorage.getItem('econoarena_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Cargar configuración
      await loadSettings();
      
      // Cargar datos si hay usuario
      if (savedUser) {
        await Promise.all([
          loadProducts(),
          loadMovements(),
          loadUsers()
        ]);
      }

      setLoading(false);
    };

    initializeApp();
  }, []);

  // CARGAR CONFIGURACIÓN
  const loadSettings = async () => {
    try {
      const result = await settingsService.get();
      if (result.success) {
        const dbSettings = result.data;
        const mappedSettings = {
          currency: dbSettings.currency,
          currencySymbol: dbSettings.currency_symbol,
          company: dbSettings.company,
          theme: dbSettings.theme,
          language: dbSettings.language,
          lowStockThreshold: dbSettings.low_stock_threshold,
          email: dbSettings.email,
          phone: dbSettings.phone,
          address: dbSettings.address
        };
        setSettings(mappedSettings);
        
        // Aplicar tema inmediatamente
        document.documentElement.setAttribute('data-theme', mappedSettings.theme);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  // CARGAR PRODUCTOS
  const loadProducts = async () => {
    try {
      const result = await productService.getAll();
      if (result.success) {
        const mappedProducts = result.data.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          location: product.location,
          price: product.price,
          stock: product.stock,
          minStock: product.min_stock,
          description: product.description,
          createdAt: product.created_at
        }));
        setProducts(mappedProducts);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast.error('Error al cargar productos');
    }
  };

  // CARGAR MOVIMIENTOS
  const loadMovements = async () => {
    try {
      const result = await movementService.getAll();
      if (result.success) {
        const mappedMovements = result.data.map(movement => ({
          id: movement.id,
          productId: movement.product_id,
          product: movement.products?.name || 'Producto eliminado',
          type: movement.type,
          quantity: movement.quantity,
          reason: movement.reason,
          notes: movement.notes,
          user: movement.user_name,
          reference: movement.reference,
          date: movement.created_at
        }));
        setMovements(mappedMovements);
      }
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      toast.error('Error al cargar movimientos');
    }
  };

  // CARGAR USUARIOS
  const loadUsers = async () => {
    try {
      const result = await userService.getAll();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar usuarios');
    }
  };

  // LOGIN
  const login = async (username, password) => {
    try {
      const result = await userService.login(username, password);
      if (result.success) {
        setUser(result.data);
        localStorage.setItem('econoarena_user', JSON.stringify(result.data));
        
        // Cargar datos después del login
        await Promise.all([
          loadProducts(),
          loadMovements(),
          loadUsers()
        ]);
        
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      toast.error('Error al iniciar sesión');
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setProducts([]);
    setMovements([]);
    setUsers([]);
    localStorage.removeItem('econoarena_user');
  };

  // AGREGAR PRODUCTO
  const addProduct = async (productData) => {
    try {
      const result = await productService.create(productData);
      if (result.success) {
        await loadProducts();
        toast.success('Producto agregado correctamente');
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast.error('Error al agregar producto');
      return null;
    }
  };

  // ACTUALIZAR PRODUCTO
  const updateProduct = async (id, updates) => {
    try {
      const result = await productService.update(id, updates);
      if (result.success) {
        await loadProducts();
        toast.success('Producto actualizado correctamente');
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast.error('Error al actualizar producto');
      return null;
    }
  };

  // ELIMINAR PRODUCTO
  const deleteProduct = async (id) => {
    try {
      const result = await productService.delete(id);
      if (result.success) {
        await loadProducts();
        await loadMovements();
        toast.success('Producto eliminado correctamente');
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('Error al eliminar producto');
      return false;
    }
  };

  // AGREGAR MOVIMIENTO
  const addMovement = async (movementData) => {
    try {
      const result = await movementService.create({
        ...movementData,
        user: user?.name || 'Usuario'
      });
      
      if (result.success) {
        await loadProducts(); // Stock actualizado automáticamente
        await loadMovements();
        toast.success(`${movementData.type === 'entrada' ? 'Entrada' : 'Salida'} registrada correctamente`);
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Error al agregar movimiento:', error);
      toast.error('Error al registrar movimiento');
      return null;
    }
  };

  // AGREGAR USUARIO
  const addUser = async (userData) => {
    try {
      const result = await userService.create(userData);
      if (result.success) {
        await loadUsers();
        toast.success('Usuario creado correctamente');
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error al crear usuario');
      return null;
    }
  };

  // ACTUALIZAR USUARIO
  const updateUser = async (id, updates) => {
    try {
      const result = await userService.update(id, updates);
      if (result.success) {
        await loadUsers();
        toast.success('Usuario actualizado correctamente');
        return result.data;
      } else {
        toast.error(result.error);
        return null;
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error al actualizar usuario');
      return null;
    }
  };

  // ELIMINAR USUARIO
  const deleteUser = async (id) => {
    try {
      const result = await userService.delete(id);
      if (result.success) {
        await loadUsers();
        toast.success('Usuario eliminado correctamente');
        return true;
      } else {
        toast.error(result.error);
        return false;
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast.error('Error al eliminar usuario');
      return false;
    }
  };

  // ACTUALIZAR CONFIGURACIÓN
  const updateSettings = async (newSettings) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      
      const result = await settingsService.update(updated);
      if (result.success) {
        if (newSettings.theme) {
          document.documentElement.setAttribute('data-theme', newSettings.theme);
        }
        toast.success('Configuración actualizada correctamente');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      toast.error('Error al actualizar configuración');
    }
  };

  // GESTIÓN DE CATEGORÍAS (local)
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

  // GESTIÓN DE UBICACIONES (local)
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

  // MÉTRICAS CALCULADAS
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

  // PERMISOS
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

  // FORMATEAR MONEDA
  const formatCurrency = (amount) => {
    return `${settings.currencySymbol} ${amount.toFixed(2)}`;
  };

  // Aplicar tema
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
    loading,
    
    // Funciones
    login,
    logout,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    addUser,
    updateUser,
    deleteUser,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    addLocation,
    updateLocation,
    deleteLocation,
    hasPermission,
    formatCurrency,
    loadProducts,
    loadMovements,
    loadUsers,
    loadSettings
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};