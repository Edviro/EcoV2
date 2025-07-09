// src/utils/mockData.js
export const DEMO_PRODUCTS = [
  {
    id: 1,
    name: "Arena Fina 5 kg",
    sku: "AF-5KG-001",
    category: "Arena para Gatos",
    location: "Almacén Principal",
    price: 25.50,
    stock: 50,
    minStock: 10,
    description: "Arena fina para gatos, absorción rápida",
    createdAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: 2,
    name: "Arena Perlada 10 kg",
    sku: "AP-10KG-002", 
    category: "Arena para Gatos",
    location: "Almacén Principal",
    price: 45.00,
    stock: 8,
    minStock: 10,
    description: "Arena perlada premium, control de olores",
    createdAt: "2024-01-02T00:00:00.000Z"
  },
  {
    id: 3,
    name: "Arena Granulada 25 kg",
    sku: "AG-25KG-003",
    category: "Arena para Gatos", 
    location: "Almacén Secundario",
    price: 85.00,
    stock: 2,
    minStock: 5,
    description: "Arena granulada para uso industrial",
    createdAt: "2024-01-03T00:00:00.000Z"
  },
  {
    id: 4,
    name: "Arena Perlada 50 kg",
    sku: "AP-50KG-004",
    category: "Arena para Gatos",
    location: "Almacén Principal", 
    price: 180.00,
    stock: 0,
    minStock: 3,
    description: "Arena perlada industrial 50kg",
    createdAt: "2024-01-04T00:00:00.000Z"
  },
  {
    id: 5,
    name: "Comedero Automático",
    sku: "CA-AUTO-005",
    category: "Accesorios",
    location: "Tienda",
    price: 120.00,
    stock: 15,
    minStock: 5,
    description: "Comedero automático con temporizador",
    createdAt: "2024-01-05T00:00:00.000Z"
  },
  {
    id: 6,
    name: "Juguete Ratón",
    sku: "JR-RAT-006",
    category: "Juguetes",
    location: "Tienda",
    price: 12.50,
    stock: 353,
    minStock: 20,
    description: "Juguete ratón de peluche con hierba gatera",
    createdAt: "2024-01-06T00:00:00.000Z"
  }
];

export const DEMO_MOVEMENTS = [
  {
    id: 1,
    productId: 1,
    product: "Arena Fina 5 kg",
    type: "entrada",
    quantity: 50,
    reason: "Compra",
    user: "María",
    date: "2024-07-03T11:20:00.000Z",
    reference: "COM-2024-015",
    notes: ""
  },
  {
    id: 2,
    productId: 2,
    product: "Arena Perlada 10 kg", 
    type: "salida",
    quantity: 5,
    reason: "Venta",
    user: "Eduardo",
    date: "2024-07-03T10:00:00.000Z",
    reference: "VEN-2024-001",
    notes: ""
  },
  {
    id: 3,
    productId: 3,
    product: "Arena Granulada 25 kg",
    type: "salida", 
    quantity: 2,
    reason: "Venta",
    user: "Juan",
    date: "2024-07-02T04:15:00.000Z",
    reference: "VEN-2024-002",
    notes: ""
  },
  {
    id: 4,
    productId: 4,
    product: "Arena Perlada 50 kg",
    type: "salida",
    quantity: 1,
    reason: "Venta", 
    user: "Pedro",
    date: "2024-07-01T00:00:00.000Z",
    reference: "VEN-2024-003",
    notes: ""
  }
];

export const DEMO_USERS = [
  {
    id: 1,
    name: "Eduardo",
    username: "admin",
    email: "admin@econoarena.com",
    password: "admin",
    role: "admin",
    status: "active",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastAccess: "2024-07-07T03:00:00.000Z"
  },
  {
    id: 2,
    name: "María Operadora",
    username: "operator", 
    email: "operator@econoarena.com",
    password: "operator",
    role: "operator",
    status: "active",
    createdAt: "2024-01-02T00:00:00.000Z",
    lastAccess: "2024-07-07T02:30:00.000Z"
  },
  {
    id: 3,
    name: "Juan Visualizador",
    username: "viewer",
    email: "viewer@econoarena.com", 
    password: "viewer",
    role: "viewer",
    status: "active",
    createdAt: "2024-01-03T00:00:00.000Z",
    lastAccess: "2024-07-06T11:00:00.000Z"
  },
  {
    id: 4,
    name: "Carlos Almacén",
    username: "carlos",
    email: "almacen@econoarena.com",
    password: "carlos123",
    role: "operator", 
    status: "inactive",
    createdAt: "2024-01-04T00:00:00.000Z",
    lastAccess: "2024-06-28T11:00:00.000Z"
  }
];

export const CATEGORIES = [
  "Arena para Gatos",
  "Accesorios", 
  "Alimentos",
  "Juguetes",
  "Higiene"
];

export const LOCATIONS = [
  "Almacén Principal",
  "Almacén Secundario",
  "Tienda", 
  "Depósito"
];

export const MOVEMENT_REASONS = {
  entrada: [
    "Compra",
    "Devolución cliente",
    "Transferencia entrada",
    "Ajuste inventario",
    "Entrada rápida",
    "Stock inicial"
  ],
  salida: [
    "Venta",
    "Devolución proveedor", 
    "Transferencia salida",
    "Producto dañado",
    "Merma",
    "Salida rápida",
    "Muestra gratuita"
  ]
};

// DATOS PARA GRÁFICOS - Estos se calcularán en tiempo real
export const CHART_DATA = {
  // Ya no se usará - se calculará desde datos reales
  stockTrend: [],
  entriesVsExits: []
};