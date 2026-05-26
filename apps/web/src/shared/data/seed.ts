import type { Business, BusinessEvent, CashMovement, Category, DiningTable, Order, Payment, Product, UpgradeRequest, User } from '../types';

export const demoUser: User = {
  id: 'usr-admin',
  name: 'Valeria Ramos',
  email: 'admin@vecopa.pe',
  role: 'administrador',
  plan: 'premium',
};

export const categories: Category[] = [
  { id: 'cat-cafe', name: 'Cafe', color: '#0f766e' },
  { id: 'cat-comida', name: 'Comida', color: '#e11d48' },
  { id: 'cat-bar', name: 'Bar', color: '#2563eb' },
  { id: 'cat-postres', name: 'Postres', color: '#ca8a04' },
];

export const products: Product[] = [
  { id: 'p1', name: 'Americano', categoryId: 'cat-cafe', price: 8.5, stock: 45, active: true },
  { id: 'p2', name: 'Capuccino', categoryId: 'cat-cafe', price: 11, stock: 38, active: true },
  { id: 'p3', name: 'Hamburguesa casa', categoryId: 'cat-comida', price: 28, stock: 20, active: true },
  { id: 'p4', name: 'Lomo saltado', categoryId: 'cat-comida', price: 34, stock: 16, active: true },
  { id: 'p5', name: 'Chilcano', categoryId: 'cat-bar', price: 24, stock: 28, active: true },
  { id: 'p6', name: 'Cheesecake', categoryId: 'cat-postres', price: 15, stock: 12, active: true },
];

export const tables: DiningTable[] = [
  { id: 't1', name: 'Mesa 1', capacity: 2, status: 'ocupada' },
  { id: 't2', name: 'Mesa 2', capacity: 4, status: 'libre' },
  { id: 't3', name: 'Terraza 1', capacity: 4, status: 'reservada' },
  { id: 't4', name: 'Barra', capacity: 6, status: 'ocupada' },
  { id: 't5', name: 'Mesa 5', capacity: 2, status: 'libre' },
  { id: 't6', name: 'Salon 2', capacity: 8, status: 'libre' },
];

export const orders: Order[] = [
  {
    id: 'o1',
    tableId: 't1',
    items: [
      { productId: 'p2', quantity: 2 },
      { productId: 'p6', quantity: 1, note: 'Sin salsa' },
    ],
    status: 'abierto',
    waiter: 'Mozo 1',
    openedAt: new Date().toISOString(),
  },
  {
    id: 'o2',
    tableId: 't4',
    items: [
      { productId: 'p5', quantity: 3 },
      { productId: 'p3', quantity: 1 },
    ],
    status: 'abierto',
    waiter: 'Mozo 2',
    openedAt: new Date().toISOString(),
  },
];

export const payments: Payment[] = [
  {
    id: 'pay-1',
    orderId: 'paid-1',
    method: 'YAPE',
    amount: 126,
    reference: 'YAP-83912',
    confirmed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay-2',
    orderId: 'paid-2',
    method: 'PLIN',
    amount: 88,
    reference: 'PLN-55219',
    confirmed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pay-3',
    orderId: 'paid-3',
    method: 'EFECTIVO',
    amount: 74,
    confirmed: true,
    createdAt: new Date().toISOString(),
  },
];

export const cashMovements: CashMovement[] = [
  { id: 'cm-1', type: 'apertura', amount: 300, note: 'Fondo inicial', createdAt: new Date().toISOString() },
  { id: 'cm-2', type: 'ingreso', amount: 74, note: 'Venta efectivo', createdAt: new Date().toISOString() },
];

export const upgradeRequests: UpgradeRequest[] = [
  {
    id: 'ur-1',
    userId: 'usr-admin',
    userEmail: 'admin@vecopa.pe',
    businessName: 'Vecopa Demo',
    requestedPlan: 'premium',
    status: 'pendiente',
    note: 'Solicita activar facturacion premium y caja completa.',
    createdAt: new Date().toISOString(),
  },
];

export const businesses: Business[] = [
  {
    id: 'biz-superadmin',
    ownerUserId: 'bootstrap-super-admin',
    ownerEmail: 'superadmin@vecopa.pe',
    name: 'Vecopa',
    plan: 'premium',
    paymentStatus: 'al_dia',
    licenseStatus: 'activa',
    licenseEndsAt: '2099-12-31T23:59:59.000Z',
    branchesCount: 1,
    activeBranches: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'biz-demo-admin',
    ownerUserId: 'usr-admin',
    ownerEmail: 'admin@vecopa.pe',
    name: 'Vecopa Demo',
    plan: 'free',
    paymentStatus: 'pendiente',
    licenseStatus: 'activa',
    licenseEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    branchesCount: 1,
    activeBranches: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const businessEvents: BusinessEvent[] = [
  {
    id: 'be-1',
    businessId: 'biz-superadmin',
    kind: 'registro',
    plan: 'premium',
    note: 'Cuenta base de la plataforma',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'be-2',
    businessId: 'biz-demo-admin',
    kind: 'registro',
    plan: 'free',
    note: 'Alta gratuita inicial',
    createdAt: new Date().toISOString(),
  },
];
