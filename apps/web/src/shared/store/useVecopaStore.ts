import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { create } from 'zustand';
import {
  cashMovements as seedCashMovements,
  businesses as seedBusinesses,
  businessEvents as seedBusinessEvents,
  categories as seedCategories,
  orders as seedOrders,
  payments as seedPayments,
  products as seedProducts,
  upgradeRequests as seedUpgradeRequests,
  tables as seedTables,
} from '../data/seed';
import { auth, db } from '../services/firebase';
import { collections } from '../services/firestorePaths';
import { defaultPlanModuleConfig, type PlanModuleAccessConfig, type ModuleId } from '../lib/access';
import type {
  BillingConfig,
  Business,
  BusinessEvent,
  CashMovement,
  AccountPlan,
  Category,
  DiningTable,
  Order,
  OrderItem,
  Payment,
  PaymentMethod,
  Product,
  Role,
  UpgradeRequest,
  User,
} from '../types';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  plan: AccountPlan;
  businessName: string;
}

interface StoreState {
  user: User | null;
  bootstrapped: boolean;
  loading: boolean;
  error: string | null;
  categories: Category[];
  products: Product[];
  tables: DiningTable[];
  orders: Order[];
  payments: Payment[];
  cashMovements: CashMovement[];
  users: User[];
  upgradeRequests: UpgradeRequest[];
  planConfig: PlanModuleAccessConfig;
  billingConfig: BillingConfig;
  initialize: () => Unsubscribe;
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  setTableStatus: (tableId: string, status: DiningTable['status']) => Promise<void>;
  openTable: (tableId: string) => Promise<void>;
  closeTable: (tableId: string) => Promise<void>;
  addOrderItem: (tableId: string, productId: string) => Promise<void>;
  updateOrderItem: (orderId: string, productId: string, quantity: number) => Promise<void>;
  removeOrderItem: (orderId: string, productId: string) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'active'>) => Promise<void>;
  updateProductStock: (productId: string, stock: number) => Promise<void>;
  confirmPayment: (orderId: string, method: PaymentMethod, reference?: string) => Promise<void>;
  addCashMovement: (movement: Omit<CashMovement, 'id' | 'createdAt'>) => Promise<void>;
  requestUpgrade: (
    input: Omit<UpgradeRequest, 'id' | 'createdAt' | 'status' | 'paymentMethod' | 'paymentAmount' | 'paymentReference' | 'paymentNote' | 'paidAt'> & {
      paymentMethod?: UpgradeRequest['paymentMethod'];
      paymentAmount?: UpgradeRequest['paymentAmount'];
      paymentReference?: UpgradeRequest['paymentReference'];
      paymentNote?: UpgradeRequest['paymentNote'];
      paidAt?: UpgradeRequest['paidAt'];
    },
  ) => Promise<void>;
  approveUpgradeRequest: (requestId: string) => Promise<void>;
  rejectUpgradeRequest: (requestId: string) => Promise<void>;
  updateUserPlan: (userId: string, plan: AccountPlan) => Promise<void>;
  updateUserRole: (userId: string, role: Role) => Promise<void>;
  updatePlanConfig: (config: PlanModuleAccessConfig) => Promise<void>;
  updateBillingConfig: (config: BillingConfig) => Promise<void>;
  businesses: Business[];
  businessEvents: BusinessEvent[];
  renewBusinessLicense: (businessId: string, plan?: AccountPlan) => Promise<void>;
  updateBusinessStatus: (businessId: string, status: Business['licenseStatus']) => Promise<void>;
  registerBusinessEvent: (event: Omit<BusinessEvent, 'id' | 'createdAt'>) => Promise<void>;
  orderTotal: (order: Order) => number;
}

const unsubscribers: Unsubscribe[] = [];

const roleForEmail = (email: string): Role =>
  email.startsWith('caja')
    ? 'cajero'
    : email.startsWith('mozo')
      ? 'mozo'
      : email.startsWith('superadmin')
        ? 'super_admin'
        : 'administrador';

const bootstrapEmails = new Set(['admin@vecopa.pe', 'caja@vecopa.pe', 'mozo@vecopa.pe', 'superadmin@vecopa.pe']);

const defaultBillingConfig: BillingConfig = {
  premiumPrice: 49.9,
  currency: 'PEN',
  yapeNumber: '999111222',
  yapeHolder: 'Vecopa',
  referencePrefix: 'VECOPA',
  licenseDays: 30,
  supportEmail: 'superadmin@vecopa.pe',
};

const nameForRole = (role: Role) =>
  role === 'super_admin'
    ? 'Super Admin Vecopa'
    : role === 'administrador'
      ? 'Valeria Ramos'
      : role === 'cajero'
        ? 'Caja Norte'
        : 'Mozo Patio';

const defaultPlanForEmail = (email: string): AccountPlan => (email === 'superadmin@vecopa.pe' ? 'premium' : 'free');

const normalizePlanConfig = (config: Partial<PlanModuleAccessConfig> | null | undefined): PlanModuleAccessConfig => {
  const allModules: ModuleId[] = ['dashboard', 'mesas', 'pedidos', 'productos', 'caja', 'reportes'];
  const freeModules = config?.freeModules?.filter((moduleId): moduleId is ModuleId => allModules.includes(moduleId)) ?? defaultPlanModuleConfig.freeModules;
  const premiumModules =
    config?.premiumModules?.filter((moduleId): moduleId is ModuleId => allModules.includes(moduleId)) ??
    defaultPlanModuleConfig.premiumModules;
  return { freeModules, premiumModules };
};

const normalizeBillingConfig = (config: Partial<BillingConfig> | null | undefined): BillingConfig => ({
  premiumPrice:
    typeof config?.premiumPrice === 'number' && Number.isFinite(config.premiumPrice)
      ? config.premiumPrice
      : defaultBillingConfig.premiumPrice,
  currency: config?.currency === 'PEN' ? 'PEN' : defaultBillingConfig.currency,
  yapeNumber: config?.yapeNumber?.trim() ? config.yapeNumber.trim() : defaultBillingConfig.yapeNumber,
  yapeHolder: config?.yapeHolder?.trim() ? config.yapeHolder.trim() : defaultBillingConfig.yapeHolder,
  referencePrefix: config?.referencePrefix?.trim() ? config.referencePrefix.trim() : defaultBillingConfig.referencePrefix,
  licenseDays:
    typeof config?.licenseDays === 'number' && Number.isFinite(config.licenseDays)
      ? Math.max(1, Math.trunc(config.licenseDays))
      : defaultBillingConfig.licenseDays,
  supportEmail: config?.supportEmail?.trim() ? config.supportEmail.trim() : defaultBillingConfig.supportEmail,
});

const isFirebaseError = (error: unknown): error is FirebaseError =>
  typeof error === 'object' && error !== null && 'code' in error;

const collectionRef = <T extends { id: string }>(name: string) => collection(db, name);

const snapshotToItems = <T extends { id: string }>(snapshot: QuerySnapshot<DocumentData>) =>
  snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);

const orderTotalWithProducts = (order: Order, products: Product[]) =>
  order.items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);

const syncCollection = <T extends { id: string }>(
  name: string,
  setData: (items: T[]) => void,
) =>
  onSnapshot(
    collectionRef<T>(name),
    (snapshot) => setData(snapshotToItems<T>(snapshot)),
    (error) => useVecopaStore.setState({ error: error.message }),
  );

async function ensureUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const ref = doc(db, collections.users, firebaseUser.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    const data = existing.data() as Partial<User>;
    return {
      id: existing.id,
      name: data.name ?? firebaseUser.displayName ?? 'Usuario Vecopa',
      email: data.email ?? firebaseUser.email ?? '',
      role: data.role ?? roleForEmail(firebaseUser.email ?? ''),
      plan: data.plan ?? defaultPlanForEmail(firebaseUser.email ?? ''),
      businessName: data.businessName,
    };
  }

  const role = roleForEmail(firebaseUser.email ?? '');
  const user: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? nameForRole(role),
    email: firebaseUser.email ?? '',
    role,
    plan: defaultPlanForEmail(firebaseUser.email ?? ''),
  };
  await setDoc(ref, user);
  return user;
}

const nextLicenseDates = (
  plan: AccountPlan,
  licenseDays = plan === 'premium' ? defaultBillingConfig.licenseDays : 14,
): Pick<Business, 'licenseEndsAt' | 'paymentStatus' | 'licenseStatus'> => {
  const now = Date.now();
  return {
    licenseEndsAt: new Date(now + licenseDays * 24 * 60 * 60 * 1000).toISOString(),
    paymentStatus: plan === 'premium' ? 'al_dia' : 'pendiente',
    licenseStatus: 'activa' as const,
  };
};

const eventLabel = (kind: BusinessEvent['kind']) =>
  kind === 'registro'
    ? 'Registro'
    : kind === 'solicitud'
      ? 'Solicitud'
    : kind === 'renovacion'
      ? 'Renovacion'
      : kind === 'suspension'
        ? 'Suspension'
        : kind === 'reactivacion'
          ? 'Reactivacion'
          : kind === 'upgrade_aprobado'
            ? 'Upgrade aprobado'
            : kind === 'upgrade_rechazado'
              ? 'Upgrade rechazado'
              : 'Pago registrado';

async function seedIfEmpty() {
  const [usersSnapshot, productsSnapshot, businessesSnapshot, businessEventsSnapshot, upgradeRequestsSnapshot, planSettingsSnapshot, billingSettingsSnapshot] =
    await Promise.all([
      getDocs(collection(db, collections.users)),
      getDocs(collection(db, collections.products)),
      getDocs(collection(db, collections.businesses)),
      getDocs(collection(db, collections.businessEvents)),
      getDocs(collection(db, collections.upgradeRequests)),
      getDoc(doc(db, collections.settings, 'planAccess')),
      getDoc(doc(db, collections.settings, 'billingConfig')),
    ]);
  const batch = writeBatch(db);
  let shouldWrite = false;

  if (usersSnapshot.empty) {
    batch.set(doc(db, collections.users, 'bootstrap-super-admin'), {
      id: 'bootstrap-super-admin',
      name: 'Super Admin Vecopa',
      email: 'superadmin@vecopa.pe',
      role: 'super_admin',
      plan: 'premium',
      businessName: 'Vecopa',
    } satisfies User);
    shouldWrite = true;
  }

  if (productsSnapshot.empty) {
    seedCategories.forEach((item) => batch.set(doc(db, collections.categories, item.id), item));
    seedProducts.forEach((item) => batch.set(doc(db, collections.products, item.id), item));
    seedTables.forEach((item) => batch.set(doc(db, collections.tables, item.id), item));
    seedOrders.forEach((item) => batch.set(doc(db, collections.orders, item.id), item));
    seedPayments.forEach((item) => batch.set(doc(db, collections.payments, item.id), item));
    seedCashMovements.forEach((item) => batch.set(doc(db, collections.cashMovements, item.id), item));
    shouldWrite = true;
  }

  if (upgradeRequestsSnapshot.empty) {
    seedUpgradeRequests.forEach((item) => batch.set(doc(db, collections.upgradeRequests, item.id), item));
    shouldWrite = true;
  }

  if (businessesSnapshot.empty) {
    seedBusinesses.forEach((item) => batch.set(doc(db, collections.businesses, item.id), item));
    shouldWrite = true;
  }

  if (businessEventsSnapshot.empty) {
    seedBusinessEvents.forEach((item) => batch.set(doc(db, collections.businessEvents, item.id), item));
    shouldWrite = true;
  }

  if (!planSettingsSnapshot.exists()) {
    batch.set(doc(db, collections.settings, 'planAccess'), defaultPlanModuleConfig);
    shouldWrite = true;
  }

  if (!billingSettingsSnapshot.exists()) {
    batch.set(doc(db, collections.settings, 'billingConfig'), defaultBillingConfig);
    shouldWrite = true;
  }

  if (shouldWrite) await batch.commit();
}

async function findOpenOrderByTable(tableId: string) {
  const snapshot = await getDocs(
    query(collection(db, collections.orders), where('tableId', '==', tableId), where('status', '==', 'abierto')),
  );
  const first = snapshot.docs[0];
  return first ? ({ id: first.id, ...first.data() } as Order) : null;
}

export const useVecopaStore = create<StoreState>((set, get) => ({
  user: null,
  bootstrapped: false,
  loading: true,
  error: null,
  categories: [],
  products: [],
  tables: [],
  orders: [],
  payments: [],
  cashMovements: [],
  users: [],
  upgradeRequests: [],
  businesses: [],
  businessEvents: [],
  planConfig: defaultPlanModuleConfig,
  billingConfig: defaultBillingConfig,
  initialize: () =>
    onAuthStateChanged(auth, async (firebaseUser) => {
      unsubscribers.splice(0).forEach((unsubscribe) => unsubscribe());
      if (!firebaseUser) {
        set({
          user: null,
          loading: false,
          bootstrapped: true,
          categories: [],
          products: [],
          tables: [],
          orders: [],
          payments: [],
          cashMovements: [],
          users: [],
          upgradeRequests: [],
          businesses: [],
          businessEvents: [],
          planConfig: defaultPlanModuleConfig,
          billingConfig: defaultBillingConfig,
        });
        return;
      }

      set({ loading: true, error: null });
      try {
        const user = await ensureUserProfile(firebaseUser);
        await seedIfEmpty();
        set({ user, loading: false, bootstrapped: true });
        unsubscribers.push(syncCollection<Category>(collections.categories, (items) => set({ categories: items })));
        unsubscribers.push(syncCollection<Product>(collections.products, (items) => set({ products: items })));
        unsubscribers.push(syncCollection<DiningTable>(collections.tables, (items) => set({ tables: items })));
        unsubscribers.push(syncCollection<Order>(collections.orders, (items) => set({ orders: items })));
        unsubscribers.push(syncCollection<Payment>(collections.payments, (items) => set({ payments: items })));
        unsubscribers.push(syncCollection<CashMovement>(collections.cashMovements, (items) => set({ cashMovements: items })));
        unsubscribers.push(syncCollection<Business>(collections.businesses, (items) => set({ businesses: items })));
        unsubscribers.push(syncCollection<BusinessEvent>(collections.businessEvents, (items) => set({ businessEvents: items })));
        unsubscribers.push(
          syncCollection<User>(collections.users, (items) =>
            set((state) => ({
              users: items,
              user: state.user ? items.find((candidate) => candidate.id === state.user?.id) ?? state.user : state.user,
            })),
          ),
        );
        unsubscribers.push(syncCollection<UpgradeRequest>(collections.upgradeRequests, (items) => set({ upgradeRequests: items })));
        unsubscribers.push(
          onSnapshot(
            doc(db, collections.settings, 'planAccess'),
            (snapshot) => set({ planConfig: normalizePlanConfig(snapshot.exists() ? (snapshot.data() as Partial<PlanModuleAccessConfig>) : defaultPlanModuleConfig) }),
            (error) => useVecopaStore.setState({ error: error.message }),
          ),
        );
        unsubscribers.push(
          onSnapshot(
            doc(db, collections.settings, 'billingConfig'),
            (snapshot) => set({ billingConfig: normalizeBillingConfig(snapshot.exists() ? (snapshot.data() as Partial<BillingConfig>) : defaultBillingConfig) }),
            (error) => useVecopaStore.setState({ error: error.message }),
          ),
        );
      } catch (error) {
        set({ loading: false, bootstrapped: true, error: error instanceof Error ? error.message : 'No se pudo inicializar Firebase' });
      }
    }),
  login: async ({ email, password }) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (error) {
      if (
        isFirebaseError(error) &&
        bootstrapEmails.has(email) &&
        ['auth/user-not-found', 'auth/invalid-credential'].includes(error.code)
      ) {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          return true;
        } catch (createError) {
          const message = isFirebaseError(createError)
            ? `Firebase Auth: ${createError.code}`
            : 'No se pudo crear el usuario inicial';
          set({ loading: false, error: message });
          return false;
        }
      }
      const message = isFirebaseError(error)
        ? `Firebase Auth: ${error.code}`
        : 'Credenciales invalidas o proveedor Email/Password no habilitado';
      set({ loading: false, error: message });
      return false;
    }
  },
  register: async ({ email, password, plan, businessName }) => {
    set({ loading: true, error: null });
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const license = nextLicenseDates(plan, get().billingConfig.licenseDays);
      await setDoc(doc(db, collections.users, credential.user.uid), {
        id: credential.user.uid,
        name: businessName.trim() || nameForRole(roleForEmail(email)),
        email,
        role: roleForEmail(email),
        plan,
        businessName: businessName.trim(),
      } satisfies User);
      await setDoc(doc(db, collections.businesses, credential.user.uid), {
        id: credential.user.uid,
        ownerUserId: credential.user.uid,
        ownerEmail: email,
        name: businessName.trim() || nameForRole(roleForEmail(email)),
        plan,
        branchesCount: 1,
        activeBranches: 1,
        ...license,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies Business);
      return true;
    } catch (error) {
      const message = isFirebaseError(error)
        ? `Firebase Auth: ${error.code}`
        : 'No se pudo crear la cuenta';
      set({ loading: false, error: message });
      return false;
    }
  },
  logout: async () => {
    await signOut(auth);
  },
  setTableStatus: async (tableId, status) => {
    await updateDoc(doc(db, collections.tables, tableId), { status });
  },
  openTable: async (tableId) => {
    const order = await findOpenOrderByTable(tableId);
    const batch = writeBatch(db);
    batch.update(doc(db, collections.tables, tableId), { status: 'ocupada' });
    if (!order) {
      const orderRef = doc(collection(db, collections.orders));
      batch.set(orderRef, {
        tableId,
        items: [],
        status: 'abierto',
        waiter: get().user?.name ?? 'Equipo',
        openedAt: new Date().toISOString(),
      } satisfies Omit<Order, 'id'>);
    }
    await batch.commit();
  },
  closeTable: async (tableId) => {
    const order = await findOpenOrderByTable(tableId);
    const batch = writeBatch(db);
    batch.update(doc(db, collections.tables, tableId), { status: 'libre' });
    if (order) batch.update(doc(db, collections.orders, order.id), { status: 'cancelado' });
    await batch.commit();
  },
  addOrderItem: async (tableId, productId) => {
    const order = await findOpenOrderByTable(tableId);
    const nextItem = (items: OrderItem[]) => {
      const existing = items.find((item) => item.productId === productId);
      return existing
        ? items.map((item) => (item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item))
        : [...items, { productId, quantity: 1 }];
    };

    if (!order) {
      const batch = writeBatch(db);
      batch.update(doc(db, collections.tables, tableId), { status: 'ocupada' });
      batch.set(doc(collection(db, collections.orders)), {
        tableId,
        items: [{ productId, quantity: 1 }],
        status: 'abierto',
        waiter: get().user?.name ?? 'Equipo',
        openedAt: new Date().toISOString(),
      } satisfies Omit<Order, 'id'>);
      await batch.commit();
      return;
    }

    await updateDoc(doc(db, collections.orders, order.id), { items: nextItem(order.items) });
  },
  updateOrderItem: async (orderId, productId, quantity) => {
    const order = get().orders.find((candidate) => candidate.id === orderId);
    if (!order) return;
    const items = order.items
      .map((item) => (item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
      .filter((item) => item.quantity > 0);
    await updateDoc(doc(db, collections.orders, orderId), { items });
  },
  removeOrderItem: async (orderId, productId) => {
    const order = get().orders.find((candidate) => candidate.id === orderId);
    if (!order) return;
    await updateDoc(doc(db, collections.orders, orderId), {
      items: order.items.filter((item) => item.productId !== productId),
    });
  },
  addProduct: async (product) => {
    await addDoc(collection(db, collections.products), { ...product, active: true });
  },
  updateProductStock: async (productId, stock) => {
    await updateDoc(doc(db, collections.products, productId), { stock });
  },
  confirmPayment: async (orderId, method, reference) => {
    const order = get().orders.find((candidate) => candidate.id === orderId);
    if (!order) return;
    const amount = orderTotalWithProducts(order, get().products);
    const batch = writeBatch(db);
    batch.set(doc(collection(db, collections.payments)), {
      orderId,
      method,
      amount,
      reference: reference ?? '',
      confirmed: true,
      createdAt: new Date().toISOString(),
    } satisfies Omit<Payment, 'id'>);
    batch.update(doc(db, collections.tables, order.tableId), { status: 'libre' });
    batch.update(doc(db, collections.orders, orderId), { status: 'pagado' });
    if (method === 'EFECTIVO') {
      batch.set(doc(collection(db, collections.cashMovements)), {
        type: 'ingreso',
        amount,
        note: 'Venta efectivo',
        createdAt: new Date().toISOString(),
      } satisfies Omit<CashMovement, 'id'>);
    }
    await batch.commit();
  },
  addCashMovement: async (movement) => {
    await addDoc(collection(db, collections.cashMovements), { ...movement, createdAt: new Date().toISOString() });
  },
  registerBusinessEvent: async (event) => {
    await addDoc(collection(db, collections.businessEvents), {
      ...event,
      createdAt: new Date().toISOString(),
    } satisfies Omit<BusinessEvent, 'id'>);
  },
  requestUpgrade: async ({
    userId,
    userEmail,
    businessName,
    requestedPlan,
    note,
    paymentMethod,
    paymentReference,
    paymentAmount,
    paymentNote,
    paidAt,
  }) => {
    const requestRef = await addDoc(collection(db, collections.upgradeRequests), {
      userId,
      userEmail,
      businessName,
      requestedPlan,
      note,
      paymentMethod,
      paymentReference,
      paymentAmount,
      paymentNote,
      paidAt,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    } satisfies Omit<UpgradeRequest, 'id'>);
    await addDoc(collection(db, collections.businessEvents), {
      businessId: userId,
      kind: 'solicitud',
      plan: requestedPlan,
      amount: paymentAmount,
      note: paymentReference ? `Solicitud creada: ${requestRef.id} / Ref: ${paymentReference}` : `Solicitud creada: ${requestRef.id}`,
      createdAt: new Date().toISOString(),
    } satisfies Omit<BusinessEvent, 'id'>);
  },
  approveUpgradeRequest: async (requestId) => {
    const request = get().upgradeRequests.find((item) => item.id === requestId);
    if (!request) return;
    const billing = get().billingConfig;
    const batch = writeBatch(db);
    batch.update(doc(db, collections.users, request.userId), { plan: request.requestedPlan });
    batch.set(
      doc(db, collections.businesses, request.userId),
      {
        plan: request.requestedPlan,
        ...nextLicenseDates(request.requestedPlan, billing.licenseDays),
        lastPaymentAt: request.paidAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    batch.update(doc(db, collections.upgradeRequests, requestId), { status: 'aprobada' });
    await batch.commit();
    await addDoc(collection(db, collections.businessEvents), {
      businessId: request.userId,
      kind: 'upgrade_aprobado',
      plan: request.requestedPlan,
      note: request.note ?? 'Upgrade aprobado por super admin',
      createdAt: new Date().toISOString(),
    } satisfies Omit<BusinessEvent, 'id'>);
  },
  rejectUpgradeRequest: async (requestId) => {
    const request = get().upgradeRequests.find((item) => item.id === requestId);
    await updateDoc(doc(db, collections.upgradeRequests, requestId), { status: 'rechazada' });
    if (request) {
      await addDoc(collection(db, collections.businessEvents), {
        businessId: request.userId,
        kind: 'upgrade_rechazado',
        plan: request.requestedPlan,
        note: request.note ?? 'Upgrade rechazado por super admin',
        createdAt: new Date().toISOString(),
      } satisfies Omit<BusinessEvent, 'id'>);
    }
  },
  updateUserPlan: async (userId, plan) => {
    await updateDoc(doc(db, collections.users, userId), { plan });
    await setDoc(
      doc(db, collections.businesses, userId),
      {
        plan,
        ...nextLicenseDates(plan, get().billingConfig.licenseDays),
        lastPaymentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    await addDoc(collection(db, collections.businessEvents), {
      businessId: userId,
      kind: 'renovacion',
      plan,
      note: 'Cambio de plan manual desde Cuentas',
      createdAt: new Date().toISOString(),
    } satisfies Omit<BusinessEvent, 'id'>);
  },
  updateUserRole: async (userId, role) => {
    await updateDoc(doc(db, collections.users, userId), { role });
  },
  updatePlanConfig: async (config) => {
    await setDoc(doc(db, collections.settings, 'planAccess'), normalizePlanConfig(config));
  },
  updateBillingConfig: async (config) => {
    await setDoc(doc(db, collections.settings, 'billingConfig'), normalizeBillingConfig(config));
  },
  renewBusinessLicense: async (businessId, plan = 'premium') => {
    const license = nextLicenseDates(plan, get().billingConfig.licenseDays);
    await setDoc(
      doc(db, collections.businesses, businessId),
      {
        plan,
        ...license,
        lastPaymentAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    await addDoc(collection(db, collections.businessEvents), {
      businessId,
      kind: 'renovacion',
      plan,
      note: 'Licencia renovada',
      createdAt: new Date().toISOString(),
    } satisfies Omit<BusinessEvent, 'id'>);
  },
  updateBusinessStatus: async (businessId, status) => {
    await setDoc(
      doc(db, collections.businesses, businessId),
      {
        licenseStatus: status,
        paymentStatus: status === 'activa' ? 'al_dia' : status === 'suspendida' ? 'vencido' : 'pendiente',
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
    await addDoc(collection(db, collections.businessEvents), {
      businessId,
      kind: status === 'activa' ? 'reactivacion' : 'suspension',
      plan: 'premium',
      note: `Estado de licencia actualizado a ${status}`,
      createdAt: new Date().toISOString(),
    } satisfies Omit<BusinessEvent, 'id'>);
  },
  orderTotal: (order) => orderTotalWithProducts(order, get().products),
}));
