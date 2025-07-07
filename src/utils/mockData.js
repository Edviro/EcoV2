// src/utils/mockData.js

export const DEMO_PRODUCTS = [
  {
    id: 1,
    name: "Arena Perlada 5 kg",
    sku: "AP-5KG-001",
    stock: 120,
    minStock: 30,
    price: 8.50,
    category: "Arena para Gatos",
    location: "Almacén Principal",
    createdAt: "2024-01-15T10:00:00Z",
    lastMovement: "2024-07-03T14:30:00Z"
  },
  {
    id: 2,
    name: "Arena Perlada 10 kg",
    sku: "AP-10KG-002", 
    stock: 80,
    minStock: 20,
    price: 15.00,
    category: "Arena para Gatos",
    location: "Almacén Principal",
    createdAt: "2024-01-15T10:05:00Z",
    lastMovement: "2024-07-03T15:00:00Z"
  },
  {
    id: 3,
    name: "Arena Perlada 25 kg",
    sku: "AP-25KG-003",
    stock: 40,
    minStock: 10,
    price: 35.00,
    category: "Arena para Gatos", 
    location: "Almacén Principal",
    createdAt: "2024-01-15T10:10:00Z",
    lastMovement: "2024-07-02T09:15:00Z"
  },
  {
    id: 4,
    name: "Arena Perlada 50 kg",
    sku: "AP-50KG-004",
    stock: 15,
    minStock: 5,
    price: 65.00,
    category: "Arena para Gatos",
    location: "Almacén Principal", 
    createdAt: "2024-01-15T10:15:00Z",
    lastMovement: "2024-07-01T11:45:00Z"
  },
  {
    id: 5,
    name: "Arena Fina 5 kg",
    sku: "AF-5KG-005",
    stock: 150,
    minStock: 40,
    price: 7.00,
    category: "Arena para Gatos",
    location: "Almacén Principal",
    createdAt: "2024-02-01T09:00:00Z", 
    lastMovement: "2024-07-03T16:20:00Z"
  },
  {
    id: 6,
    name: "Arena Granulada 25 kg",
    sku: "AG-25KG-006",
    stock: 8,
    minStock: 15,
    price: 32.00,
    category: "Arena para Gatos",
    location: "Almacén Principal",
    createdAt: "2024-02-15T11:30:00Z",
    lastMovement: "2024-06-30T08:00:00Z"
  }
];

export const DEMO_MOVEMENTS = [
  {
    id: 1,
    productId: 2,
    product: "Arena Perlada 10 kg",
    type: "salida",
    quantity: 5,
    reason: "Venta",
    user: "Eduardo",
    date: "2024-07-03T15:00:00Z",
    reference: "VEN-2024-001"
  },
  {
    id: 2, 
    productId: 5,
    product: "Arena Fina 5 kg",
    type: "entrada",
    quantity: 50,
    reason: "Compra",
    user: "María",
    date: "2024-07-03T16:20:00Z",
    reference: "COM-2024-015"
  },
  {
    id: 3,
    productId: 6,
    product: "Arena Granulada 25 kg", 
    type: "salida",
    quantity: 2,
    reason: "Venta",
    user: "Juan",
    date: "2024-07-02T09:15:00Z",
    reference: "VEN-2024-002"
  },
  {
    id: 4,
    productId: 4,
    product: "Arena Perlada 50 kg",
    type: "salida", 
    quantity: 1,
    reason: "Venta",
    user: "Pedro",
    date: "2024-07-01T11:45:00Z",
    reference: "VEN-2024-003"
  },
  {
    id: 5,
    productId: 3,
    product: "Arena Perlada 25 kg",
    type: "entrada",
    quantity: 30,
    reason: "Abastecimiento mensual",
    user: "Ana",
    date: "2024-06-30T08:00:00Z",
    reference: "COM-2024-014"
  }
];

export const DEMO_USERS = [
  {
    id: 1,
    name: "Eduardo",
    username: "admin",
    password: "admin", // Solo para demo
    email: "admin@econoarena.com",
    role: "admin",
    status: "active",
    lastAccess: "2024-07-07T08:00:00Z",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "María Operadora", 
    username: "operator",
    password: "operator",
    email: "operator@econoarena.com",
    role: "operator",
    status: "active",
    lastAccess: "2024-07-07T07:30:00Z",
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: 3,
    name: "Juan Visualizador",
    username: "viewer", 
    password: "viewer",
    email: "viewer@econoarena.com",
    role: "viewer",
    status: "active",
    lastAccess: "2024-07-06T16:00:00Z",
    createdAt: "2024-02-01T00:00:00Z"
  },
  {
    id: 4,
    name: "Carlos Almacén",
    username: "carlos",
    password: "carlos123",
    email: "almacen@econoarena.com",
    role: "operator",
    status: "inactive",
    lastAccess: "2024-06-28T16:00:00Z",
    createdAt: "2024-03-01T00:00:00Z"
  }
];

// Categorías disponibles
export const CATEGORIES = [
  "Arena para Gatos",
  "Accesorios",
  "Alimentos",
  "Juguetes",
  "Higiene"
];

// Ubicaciones del almacén
export const LOCATIONS = [
  "Almacén Principal",
  "Almacén Secundario", 
  "Tienda",
  "Depósito"
];

// Razones comunes para movimientos
export const MOVEMENT_REASONS = {
  entrada: [
    "Compra",
    "Devolución cliente",
    "Ajuste inventario",
    "Abastecimiento mensual",
    "Stock inicial"
  ],
  salida: [
    "Venta",
    "Devolución proveedor",
    "Producto dañado",
    "Ajuste inventario",
    "Muestra gratis"
  ]
};

// Datos para gráficos de análisis
export const CHART_DATA = {
  stockTrend: [
    { month: "Ene", stock: 1100 },
    { month: "Feb", stock: 1180 },
    { month: "Mar", stock: 1250 },
    { month: "Abr", stock: 1320 },
    { month: "May", stock: 1280 },
    { month: "Jun", stock: 1350 },
    { month: "Jul", stock: 1245 }
  ],
  entriesVsExits: [
    { month: "Ene", entradas: 80, salidas: 65 },
    { month: "Feb", entradas: 95, salidas: 75 },
    { month: "Mar", entradas: 110, salidas: 85 },
    { month: "Abr", entradas: 85, salidas: 90 },
    { month: "May", entradas: 120, salidas: 95 },
    { month: "Jun", entradas: 105, salidas: 110 },
    { month: "Jul", entradas: 90, salidas: 75 }
  ],
  categoryDistribution: [
    { name: "Arena Perlada", value: 60, color: "#3b82f6" },
    { name: "Arena Fina", value: 25, color: "#10b981" },
    { name: "Arena Granulada", value: 15, color: "#f59e0b" }
  ]
};