// src/utils/formatters.js
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Formatear moneda
export const formatCurrency = (amount, currencySymbol = 'S/', decimals = 2) => {
  if (isNaN(amount)) return `${currencySymbol} 0.00`;
  return `${currencySymbol} ${Number(amount).toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

// Formatear número con separadores de miles
export const formatNumber = (number) => {
  if (isNaN(number)) return '0';
  return Number(number).toLocaleString('es-PE');
};

// Formatear fecha
export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatString, { locale: es });
};

// Formatear fecha y hora
export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
};

// Calcular tendencia de stock en tiempo real
export const calculateStockTrend = (movements, days = 7) => {
  const today = new Date();
  const trendData = [];
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(today, i);
    const dayMovements = movements.filter(movement => {
      const movementDate = new Date(movement.date);
      return format(movementDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
    
    const entries = dayMovements
      .filter(m => m.type === 'entrada')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const exits = dayMovements
      .filter(m => m.type === 'salida')
      .reduce((sum, m) => sum + m.quantity, 0);
    
    trendData.push({
      date: format(date, 'dd/MM'),
      entries,
      exits,
      net: entries - exits
    });
  }
  
  return trendData;
};

// Calcular movimientos por mes
export const calculateMonthlyMovements = (movements, months = 6) => {
  const today = new Date();
  const monthlyData = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStart = startOfMonth(targetDate);
    const monthEnd = endOfMonth(targetDate);
    
    const monthMovements = movements.filter(movement => {
      const movementDate = new Date(movement.date);
      return isWithinInterval(movementDate, { start: monthStart, end: monthEnd });
    });
    
    const entradas = monthMovements.filter(m => m.type === 'entrada').length;
    const salidas = monthMovements.filter(m => m.type === 'salida').length;
    
    monthlyData.push({
      month: format(targetDate, 'MMM', { locale: es }),
      entradas,
      salidas
    });
  }
  
  return monthlyData;
};

// Calcular stock histórico
export const calculateHistoricalStock = (products, movements) => {
  const today = new Date();
  const stockHistory = [];
  
  // Últimos 7 meses
  for (let i = 6; i >= 0; i--) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthEnd = endOfMonth(targetDate);
    
    // Calcular stock acumulado hasta esa fecha
    let totalStock = 0;
    
    products.forEach(product => {
      // Stock actual del producto
      let productStock = product.stock;
      
      // Restar movimientos posteriores a la fecha objetivo
      const futureMovements = movements.filter(movement => {
        return movement.productId === product.id && 
               new Date(movement.date) > monthEnd;
      });
      
      futureMovements.forEach(movement => {
        if (movement.type === 'entrada') {
          productStock -= movement.quantity;
        } else {
          productStock += movement.quantity;
        }
      });
      
      totalStock += Math.max(0, productStock);
    });
    
    stockHistory.push({
      month: format(targetDate, 'MMM', { locale: es }),
      stock: totalStock
    });
  }
  
  return stockHistory;
};

// Calcular productos más movidos
export const calculateTopMovedProducts = (movements, limit = 10) => {
  const productMovements = movements.reduce((acc, movement) => {
    if (!acc[movement.productId]) {
      acc[movement.productId] = {
        productId: movement.productId,
        product: movement.product,
        totalQuantity: 0,
        movements: 0,
        lastMovement: movement.date
      };
    }
    
    acc[movement.productId].totalQuantity += movement.quantity;
    acc[movement.productId].movements += 1;
    
    if (new Date(movement.date) > new Date(acc[movement.productId].lastMovement)) {
      acc[movement.productId].lastMovement = movement.date;
    }
    
    return acc;
  }, {});
  
  return Object.values(productMovements)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
};

// Calcular métricas de periodo
export const calculatePeriodMetrics = (movements, products, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const periodMovements = movements.filter(movement => {
    const movementDate = new Date(movement.date);
    return isWithinInterval(movementDate, { start, end });
  });
  
  const entries = periodMovements.filter(m => m.type === 'entrada');
  const exits = periodMovements.filter(m => m.type === 'salida');
  
  const totalEntriesQuantity = entries.reduce((sum, m) => sum + m.quantity, 0);
  const totalExitsQuantity = exits.reduce((sum, m) => sum + m.quantity, 0);
  
  // Calcular valor de movimientos
  const entriesValue = entries.reduce((sum, movement) => {
    const product = products.find(p => p.id === movement.productId);
    return sum + (product ? product.price * movement.quantity : 0);
  }, 0);
  
  const exitsValue = exits.reduce((sum, movement) => {
    const product = products.find(p => p.id === movement.productId);
    return sum + (product ? product.price * movement.quantity : 0);
  }, 0);
  
  return {
    totalMovements: periodMovements.length,
    totalEntries: entries.length,
    totalExits: exits.length,
    totalEntriesQuantity,
    totalExitsQuantity,
    netQuantity: totalEntriesQuantity - totalExitsQuantity,
    entriesValue,
    exitsValue,
    netValue: entriesValue - exitsValue,
    averageMovementsPerDay: periodMovements.length / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  };
};

// Generar datos para gráfico de distribución
export const generateCategoryDistribution = (products) => {
  if (!products || products.length === 0) {
    return [];
  }

  const categoryData = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = {
        name: product.category,
        products: 0,
        stock: 0,
        value: 0
      };
    }
    
    acc[product.category].products += 1;
    acc[product.category].stock += product.stock || 0;
    acc[product.category].value += (product.stock || 0) * (product.price || 0);
    
    return acc;
  }, {});
  
  return Object.values(categoryData);
};

// Calcular rotación de inventario
export const calculateInventoryTurnover = (movements, products, days = 30) => {
  if (!movements || !products || movements.length === 0 || products.length === 0) {
    return [];
  }

  const today = new Date();
  const startDate = subDays(today, days);
  
  const periodExits = movements.filter(movement => {
    const movementDate = new Date(movement.date);
    return movement.type === 'salida' && 
           isWithinInterval(movementDate, { start: startDate, end: today });
  });
  
  const productTurnover = products.map(product => {
    const productExits = periodExits
      .filter(m => m.productId === product.id)
      .reduce((sum, m) => sum + m.quantity, 0);
    
    const turnoverRate = product.stock > 0 ? (productExits / product.stock) * (365 / days) : 0;
    
    return {
      ...product,
      exitQuantity: productExits,
      turnoverRate: turnoverRate,
      daysOfStock: turnoverRate > 0 ? 365 / turnoverRate : Infinity
    };
  });
  
  return productTurnover
    .filter(p => p.turnoverRate > 0 && p.turnoverRate !== Infinity)
    .sort((a, b) => b.turnoverRate - a.turnoverRate);
};

// Validar fechas
export const isValidDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && start <= new Date();
};

// Formatear porcentaje
export const formatPercentage = (value, decimals = 1) => {
  if (isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// Generar referencia de movimiento
export const generateMovementReference = (type, movements) => {
  const year = new Date().getFullYear();
  const typePrefix = type === 'entrada' ? 'ENT' : 'SAL';
  const nextNumber = movements.filter(m => m.reference?.startsWith(typePrefix)).length + 1;
  return `${typePrefix}-${year}-${String(nextNumber).padStart(3, '0')}`;
};