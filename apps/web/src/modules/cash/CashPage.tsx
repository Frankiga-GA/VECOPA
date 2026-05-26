import { Banknote, MinusCircle, PlusCircle } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import { money, shortTime } from '../../shared/lib/format';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import { isModuleLocked } from '../../shared/lib/access';
import { PremiumLocked } from '../../shared/components/PremiumLocked';

export function CashPage() {
  const { cashMovements, payments, addCashMovement, user, planConfig } = useVecopaStore();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  if (user && isModuleLocked(user.plan, 'caja', planConfig)) {
    return (
      <div className="space-y-6">
        <PageHeader title="Caja" eyebrow="Modulo premium" />
        <PremiumLocked moduleName="Caja" />
      </div>
    );
  }
  const cashSales = payments.filter((payment) => payment.method === 'EFECTIVO').reduce((sum, payment) => sum + payment.amount, 0);
  const digital = payments.filter((payment) => payment.method !== 'EFECTIVO').reduce((sum, payment) => sum + payment.amount, 0);
  const cashBalance = cashMovements.reduce((sum, movement) => (movement.type === 'egreso' ? sum - movement.amount : sum + movement.amount), 0);
  const difference = cashBalance - cashSales - 300;

  const submit = (type: 'ingreso' | 'egreso') => (event?: FormEvent) => {
    event?.preventDefault();
    if (!amount) return;
    addCashMovement({ type, amount: Number(amount), note: note || (type === 'ingreso' ? 'Ingreso manual' : 'Egreso manual') });
    setAmount('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Caja y conciliacion" eyebrow="Turno actual" />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Saldo caja" value={money(cashBalance)} tone="green" icon={Banknote} />
        <StatCard label="Pagos digitales" value={money(digital)} tone="blue" icon={PlusCircle} />
        <StatCard label="Diferencia" value={money(difference)} tone={difference === 0 ? 'stone' : 'amber'} icon={MinusCircle} />
      </section>
      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form className="panel p-4" onSubmit={submit('ingreso')}>
          <h2 className="text-lg font-bold text-ink">Movimiento</h2>
          <div className="mt-4 space-y-3">
            <input className="field" placeholder="Monto" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
            <input className="field" placeholder="Nota" value={note} onChange={(event) => setNote(event.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <button className="primary-button" type="submit">Ingreso</button>
              <button className="secondary-button" type="button" onClick={() => submit('egreso')()}>Egreso</button>
            </div>
          </div>
        </form>
        <div className="panel p-4">
          <h2 className="text-lg font-bold text-ink">Historial</h2>
          <div className="mt-4 space-y-2">
            {cashMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between rounded-lg bg-stone-50 p-3">
                <div>
                  <p className="font-bold capitalize text-ink">{movement.type}</p>
                  <p className="text-sm text-stone-500">{movement.note} · {shortTime(movement.createdAt)}</p>
                </div>
                <strong className={movement.type === 'egreso' ? 'text-rose-700' : 'text-brand-700'}>{money(movement.amount)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
