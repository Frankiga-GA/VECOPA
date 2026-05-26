export type Role = 'super_admin' | 'administrador' | 'cajero' | 'mozo';
export type AccountPlan = 'free' | 'premium';
export type TableStatus = 'libre' | 'ocupada' | 'reservada';
export type PaymentMethod = 'YAPE' | 'PLIN' | 'EFECTIVO';
export type OrderStatus = 'abierto' | 'pagado' | 'cancelado';
export type BusinessLicenseStatus = 'activa' | 'vencida' | 'suspendida';
export type PaymentStatus = 'al_dia' | 'pendiente' | 'vencido';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: AccountPlan;
  businessName?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  active: boolean;
}

export interface DiningTable {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  note?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: OrderStatus;
  waiter: string;
  openedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  confirmed: boolean;
  createdAt: string;
}

export interface CashMovement {
  id: string;
  type: 'apertura' | 'ingreso' | 'egreso' | 'cierre';
  amount: number;
  note: string;
  createdAt: string;
}

export interface UpgradeRequest {
  id: string;
  userId: string;
  userEmail: string;
  businessName: string;
  requestedPlan: AccountPlan;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  paymentMethod?: PaymentMethod;
  paymentAmount?: number;
  paymentReference?: string;
  paymentNote?: string;
  paidAt?: string;
  note?: string;
  createdAt: string;
}

export interface BillingConfig {
  premiumPrice: number;
  currency: 'PEN';
  yapeNumber: string;
  yapeHolder: string;
  referencePrefix: string;
  licenseDays: number;
  supportEmail: string;
}

export interface Business {
  id: string;
  ownerUserId: string;
  ownerEmail: string;
  name: string;
  plan: AccountPlan;
  paymentStatus: PaymentStatus;
  licenseStatus: BusinessLicenseStatus;
  licenseEndsAt: string;
  branchesCount: number;
  activeBranches: number;
  lastPaymentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessEvent {
  id: string;
  businessId: string;
  kind:
    | 'registro'
    | 'solicitud'
    | 'renovacion'
    | 'suspension'
    | 'reactivacion'
    | 'upgrade_aprobado'
    | 'upgrade_rechazado'
    | 'pago_registrado';
  plan: AccountPlan;
  amount?: number;
  note?: string;
  createdAt: string;
}
