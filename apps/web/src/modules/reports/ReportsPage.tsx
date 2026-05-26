import { BarChart3 } from 'lucide-react';
import { PremiumLocked } from '../../shared/components/PremiumLocked';
import { PageHeader } from '../../shared/components/PageHeader';
import { isModuleLocked } from '../../shared/lib/access';
import { money } from '../../shared/lib/format';
import { useVecopaStore } from '../../shared/store/useVecopaStore';

export function ReportsPage() {
  const { payments, orders, products, user, planConfig } = useVecopaStore();
  if (user && isModuleLocked(user.plan, 'reportes', planConfig)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Reportes" eyebrow="Modulo premium" />
        <PremiumLocked moduleName="Reportes" />
      </div>
    );
  }
  const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const byMethod = ['YAPE', 'PLIN', 'EFECTIVO'].map((method) => ({
    method,
    total: payments.filter((payment) => payment.method === method).reduce((sum, payment) => sum + payment.amount, 0),
  }));
  const sold = products
    .map((product) => ({
      product,
      quantity: orders.flatMap((order) => order.items).filter((item) => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0),
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Reportes" eyebrow="Analitica basica" />
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel p-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink"><BarChart3 size={20} /> Ventas por metodo</h2>
          <div className="mt-5 space-y-4">
            {byMethod.map((row) => {
              const width = total ? Math.max(8, (row.total / total) * 100) : 0;
              return (
                <div key={row.method}>
                  <div className="flex justify-between text-sm font-bold">
                    <span>{row.method}</span>
                    <span>{money(row.total)}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-stone-100">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel p-4">
          <h2 className="text-lg font-bold text-ink">Productos mas vendidos</h2>
          <div className="mt-4 space-y-2">
            {sold.map((row) => (
              <div key={row.product.id} className="flex items-center justify-between rounded-lg bg-stone-50 p-3">
                <span className="font-bold text-ink">{row.product.name}</span>
                <span className="rounded-lg bg-white px-3 py-1 text-sm font-black text-brand-700">{row.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
