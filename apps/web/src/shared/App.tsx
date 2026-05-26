import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { LoginPage } from '../modules/auth/LoginPage';
import { CashPage } from '../modules/cash/CashPage';
import { BusinessesPage } from '../modules/admin/BusinessesPage';
import { AccountsPage } from '../modules/admin/AccountsPage';
import { ConfigurationPage } from '../modules/admin/ConfigurationPage';
import { PlansPage } from '../modules/admin/PlansPage';
import { RequestsPage } from '../modules/admin/RequestsPage';
import { DashboardPage } from '../modules/dashboard/DashboardPage';
import { OrdersPage } from '../modules/orders/OrdersPage';
import { ProductsPage } from '../modules/products/ProductsPage';
import { ReportsPage } from '../modules/reports/ReportsPage';
import { TablesPage } from '../modules/tables/TablesPage';
import { AppLayout } from './layouts/AppLayout';
import { SuperAdminOnly } from './components/SuperAdminOnly';
import { useVecopaStore } from './store/useVecopaStore';

export function App() {
  const user = useVecopaStore((state) => state.user);
  const loading = useVecopaStore((state) => state.loading);
  const bootstrapped = useVecopaStore((state) => state.bootstrapped);
  const initialize = useVecopaStore((state) => state.initialize);

  useEffect(() => initialize(), [initialize]);

  if (!bootstrapped || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f7f4] px-5">
        <div className="panel w-full max-w-sm p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-xl font-black text-white">V</div>
          <p className="mt-4 text-lg font-black text-ink">Conectando Vecopa</p>
          <p className="mt-2 text-sm text-stone-500">Sincronizando Firebase Auth y Firestore.</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      {user?.role === 'super_admin' ? (
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/admin/negocios" element={<SuperAdminOnly><BusinessesPage /></SuperAdminOnly>} />
          <Route path="/admin/cuentas" element={<SuperAdminOnly><AccountsPage /></SuperAdminOnly>} />
          <Route path="/admin/solicitudes" element={<SuperAdminOnly><RequestsPage /></SuperAdminOnly>} />
          <Route path="/admin/planes" element={<SuperAdminOnly><PlansPage /></SuperAdminOnly>} />
          <Route path="/admin/configuracion" element={<SuperAdminOnly><ConfigurationPage /></SuperAdminOnly>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/mesas" element={<TablesPage />} />
          <Route path="/pedidos" element={<OrdersPage />} />
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/caja" element={<CashPage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </AppLayout>
  );
}
