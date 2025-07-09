// src/services/supabaseService.js
import { createClient } from '@supabase/supabase-js'

// 🔴 REEMPLAZA ESTOS VALORES CON LOS TUYOS:
const supabaseUrl = 'https://mgvbcjkzevctktdcettk.supabase.co'  // Tu Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndmJjamt6ZXZjdGt0ZGNldHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjcwNDgsImV4cCI6MjA2NzYwMzA0OH0.co7YXiy7eHBAR_1COi_RqRaQc9Nsy0cCM08hsbt3nvQ'  // 🔴 REEMPLAZA con tu anon key

export const supabase = createClient(supabaseUrl, supabaseKey)

// ================================
// SERVICIO DE PRODUCTOS
// ================================
export const productService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener productos:', error)
      return { success: false, error: error.message }
    }
  },

  async create(productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          location: productData.location,
          price: productData.price,
          stock: productData.stock,
          min_stock: productData.minStock,
          description: productData.description
        }])
        .select()
      
      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error al crear producto:', error)
      return { success: false, error: error.message }
    }
  },

  async update(id, productData) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          location: productData.location,
          price: productData.price,
          stock: productData.stock,
          min_stock: productData.minStock,
          description: productData.description
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error al actualizar producto:', error)
      return { success: false, error: error.message }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      return { success: false, error: error.message }
    }
  }
}

// ================================
// SERVICIO DE MOVIMIENTOS
// ================================
export const movementService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('movements')
        .select(`
          *,
          products (name)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener movimientos:', error)
      return { success: false, error: error.message }
    }
  },

  async create(movementData) {
    try {
      // Crear el movimiento
      const { data: movement, error: movementError } = await supabase
        .from('movements')
        .insert([{
          product_id: movementData.productId,
          type: movementData.type,
          quantity: movementData.quantity,
          reason: movementData.reason,
          notes: movementData.notes || '',
          user_name: movementData.user
        }])
        .select()
      
      if (movementError) throw movementError

      // Actualizar stock del producto
      const stockChange = movementData.type === 'entrada' 
        ? movementData.quantity 
        : -movementData.quantity

      const { error: stockError } = await supabase.rpc('update_product_stock', {
        product_id: movementData.productId,
        stock_change: stockChange
      })

      if (stockError) throw stockError

      return { success: true, data: movement[0] }
    } catch (error) {
      console.error('Error al crear movimiento:', error)
      return { success: false, error: error.message }
    }
  }
}

// ================================
// SERVICIO DE USUARIOS
// ================================
export const userService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, username, email, role, status, created_at, last_access')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return { success: false, error: error.message }
    }
  },

  async login(username, password) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, username, email, role, status')
        .eq('username', username)
        .eq('password', password)
        .eq('status', 'active')
        .single()
      
      if (error) throw error
      
      // Actualizar último acceso
      await supabase
        .from('users')
        .update({ last_access: new Date().toISOString() })
        .eq('id', data.id)
      
      return { success: true, data }
    } catch (error) {
      console.error('Error en login:', error)
      return { success: false, error: 'Credenciales incorrectas' }
    }
  },

  async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          status: userData.status || 'active'
        }])
        .select()
      
      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      return { success: false, error: error.message }
    }
  },

  async update(id, userData) {
    try {
      const updateData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status
      }
      
      if (userData.password) {
        updateData.password = userData.password
      }

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
      
      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error al actualizar usuario:', error)
      return { success: false, error: error.message }
    }
  },

  async delete(id) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      return { success: false, error: error.message }
    }
  }
}

// ================================
// SERVICIO DE CONFIGURACIÓN
// ================================
export const settingsService = {
  async get() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('id', 1)
        .single()
      
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error al obtener configuración:', error)
      return { success: false, error: error.message }
    }
  },

  async update(settingsData) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert([{
          id: 1,
          currency: settingsData.currency,
          currency_symbol: settingsData.currencySymbol,
          company: settingsData.company,
          theme: settingsData.theme,
          language: settingsData.language,
          low_stock_threshold: settingsData.lowStockThreshold,
          email: settingsData.email,
          phone: settingsData.phone,
          address: settingsData.address
        }])
        .select()
      
      if (error) throw error
      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error al actualizar configuración:', error)
      return { success: false, error: error.message }
    }
  }
}