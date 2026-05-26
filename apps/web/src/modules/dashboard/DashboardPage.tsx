import { Banknote, BarChart3, Building2, Crown, ClipboardList, CreditCard, PanelsTopLeft, Receipt, Smartphone, UsersRound, FileClock, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../shared/components/PageHeader';
import { PremiumLocked } from '../../shared/components/PremiumLocked';
import { StatCard } from '../../shared/components/StatCard';
import { isModuleLocked } from '../../shared/lib/access';
import { money } from '../../shared/lib/format';
import { useVecopaStore } from '../../shared/store/useVecopaStore';

export function DashboardPage() {
  const { user, orders, payments, tables, orderTotal, users, upgradeRequests, businesses } = useVecopaStore();

  if (user?.role === 'super_admin') {
    const totalUsers = users.length;
    const premiumUsers = users.filter((item) => item.plan === 'premium').length;
    const freeUsers = users.filter((item) => item.plan === 'free').length;
    const pending = upgradeRequests.filter((item) => item.status === 'pendiente').length;
    const approved = upgradeRequests.filter((item) => item.status === 'aprobada').length;
    const rejected = upgradeRequests.filter((item) => item.status === 'rechazada').length;
    const activeBusinesses = businesses.filter((item) => item.licenseStatus === 'activa').length;
    const expiredBusinesses = businesses.filter((item) => item.licenseStatus === 'vencida').length;
    const suspendedBusinesses = businesses.filter((item) => item.licenseStatus === 'suspendida').length;

    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard plataforma" eyebrow="Super admin" />
        <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Cuentas" value={String(totalUsers)} tone="stone" icon={UsersRound} />
          <StatCard label="Premium" value={String(premiumUsers)} tone="green" icon={ShieldCheck} />
          <StatCard label="Gratis" value={String(freeUsers)} tone="amber" icon={Crown} />
          <StatCard label="Solicitudes" value={String(pending)} tone="blue" icon={FileClock} />
          <StatCard label="Aprobadas" value={String(approved)} tone="green" icon={ClipboardList} />
          <StatCard label="Rechazadas" value={String(rejected)} tone="rose" icon={BarChart3} />
          <StatCard label="Negocios" value={String(businesses.length)} tone="stone" icon={Building2} />
          <StatCard label="Licencias activas" value={String(activeBusinesses)} tone="green" icon={ShieldCheck} />
          <StatCard label="Licencias vencidas" value={String(expiredBusinesses)} tone="amber" icon={FileClock} />
          <StatCard label="Suspendidas" value={String(suspendedBusinesses)} tone="rose" icon={Banknote} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Estado de la plataforma</h2>
              <span className="rounded-lg bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">Premium activo</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoRow label="Negocios activos" value={String(totalUsers)} />
              <InfoRow label="Cuentas premium" value={String(premiumUsers)} />
              <InfoRow label="Cuentas gratis" value={String(freeUsers)} />
              <InfoRow label="Upgrade pendientes" value={String(pending)} />
            </div>
          </div>
          <div className="panel p-4">
            <h2 className="text-lg font-bold text-ink">Acceso rapido</h2>
            <div className="mt-4 space-y-3">
              <InfoRow label="Solicitudes aprobadas" value={String(approved)} />
              <InfoRow label="Solicitudes rechazadas" value={String(rejected)} />
              <InfoRow label="Módulos SaaS" value="4" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  const paidTotal = payments.filter((payment) => payment.confirmed).reduce((sum, payment) => sum + payment.amount, 0);
  const yape = payments.filter((payment) => payment.method === 'YAPE').reduce((sum, payment) => sum + payment.amount, 0);
  const plin = payments.filter((payment) => payment.method === 'PLIN').reduce((sum, payment) => sum + payment.amount, 0);
  const cash = payments.filter((payment) => payment.method === 'EFECTIVO').reduce((sum, payment) => sum + payment.amount, 0);
  const activeOrders = orders.filter((order) => order.status === 'abierto');
  const averageTicket = payments.length ? paidTotal / payments.length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard operativo" eyebrow="Hoy" />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Ventas" value={money(paidTotal)} tone="green" icon={Receipt} />
        <StatCard label="Pedidos" value={String(activeOrders.length)} tone="blue" icon={ClipboardList} />
        <StatCard label="Yape" value={money(yape)} tone="rose" icon={Smartphone} />
        <StatCard label="Plin" value={money(plin)} tone="blue" icon={CreditCard} />
        <StatCard label="Efectivo" value={money(cash)} tone="amber" icon={Banknote} />
        <StatCard label="Mesas ocup." value={`${tables.filter((table) => table.status === 'ocupada').length}/${tables.length}`} tone="stone" icon={PanelsTopLeft} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Pedidos activos</h2>
            <span className="rounded-lg bg-brand-50 px-3 py-1 text-sm font-bold text-brand-700">Ticket prom. {money(averageTicket)}</span>
          </div>
          <div className="mt-4 grid gap-3">
            {activeOrders.map((order) => {
              const table = tables.find((item) => item.id === order.tableId);
              return (
                <div key={order.id} className="flex items-center justify-between rounded-lg border border-stone-200 p-3">
                  <div>
                    <p className="font-bold text-ink">{table?.name}</p>
                    <p className="text-sm text-stone-500">{order.items.length} items · {order.waiter}</p>
                  </div>
                  <strong className="text-lg text-brand-700">{money(orderTotal(order))}</strong>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel p-4">
          <h2 className="text-lg font-bold text-ink">Conciliacion rapida</h2>
          <div className="mt-4 space-y-3">
            {['YAPE', 'PLIN', 'EFECTIVO'].map((method) => {
              const total = payments.filter((payment) => payment.method === method).reduce((sum, payment) => sum + payment.amount, 0);
              return (
                <div key={method} className="flex items-center justify-between rounded-lg bg-stone-50 p-3">
                  <span className="font-semibold text-stone-700">{method}</span>
                  <span className="font-black text-ink">{money(total)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-stone-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}
