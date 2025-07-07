// src/services/api.js
import axios from 'axios';

// URL base de la API
const API_URL = 'http://localhost:8000/api/';

// Cliente axios con configuración común
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (no autorizado) y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry && 
        originalRequest.url !== 'auth/refresh/') {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        
        const response = await apiClient.post('auth/refresh/', {
          refresh: refreshToken
        });
        
        // Guardar nuevo token
        localStorage.setItem('access_token', response.data.access);
        
        // Reintentar la solicitud original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir a login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Servicio de autenticación
export const authService = {
  login: async (username, password) => {
    try {
      const response = await apiClient.post('auth/login/', { username, password });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Error de autenticación' };
    }
  },
  
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await apiClient.post('auth/logout/', { refresh: refreshToken });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('auth/me/');
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Servicio de productos
export const productService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('products/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  create: async (productData) => {
    try {
      const response = await apiClient.post('products/', productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  update: async (id, productData) => {
    try {
      const response = await apiClient.put(`products/${id}/`, productData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      await apiClient.delete(`products/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Servicio de movimientos
export const movementService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('movements/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  create: async (movementData) => {
    try {
      const response = await apiClient.post('movements/', movementData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Servicio de usuarios
export const userService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('users/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  create: async (userData) => {
    try {
      const response = await apiClient.post('users/', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  update: async (id, userData) => {
    try {
      const response = await apiClient.put(`users/${id}/`, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      await apiClient.delete(`users/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Servicio de dashboard
export const dashboardService = {
  getStats: async () => {
    try {
      const response = await apiClient.get('dashboard/stats/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

// Servicio de categorías
export const categoryService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('categories/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  create: async (name) => {
    try {
      const response = await apiClient.post('categories/', { name });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  update: async (id, name) => {
    try {
      const response = await apiClient.put(`categories/${id}/`, { name });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      await apiClient.delete(`categories/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};

// Servicio de ubicaciones
export const locationService = {
  getAll: async () => {
    try {
      const response = await apiClient.get('locations/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  create: async (name) => {
    try {
      const response = await apiClient.post('locations/', { name });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  update: async (id, name) => {
    try {
      const response = await apiClient.put(`locations/${id}/`, { name });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  delete: async (id) => {
    try {
      await apiClient.delete(`locations/${id}/`);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || error.message };
    }
  }
};

// Servicio de configuración
export const settingsService = {
  get: async () => {
    try {
      const response = await apiClient.get('settings/');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  
  update: async (settingsData) => {
    try {
      const response = await apiClient.put('settings/', settingsData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};