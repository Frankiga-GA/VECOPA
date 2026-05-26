import { CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import { useVecopaStore } from '../../shared/store/useVecopaStore';

export function RequestsPage() {
  const { upgradeRequests, approveUpgradeRequest, rejectUpgradeRequest } = useVecopaStore();
  const pending = upgradeRequests.filter((request) => request.status === 'pendiente');
  const approved = upgradeRequests.filter((request) => request.status === 'aprobada');
  const rejected = upgradeRequests.filter((request) => request.status === 'rechazada');

  return (
    <div className="space-y-6">
      <PageHeader title="Solicitudes" eyebrow="Upgrade center" />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Pendientes" value={String(pending.length)} tone="amber" icon={CheckCircle2} />
        <StatCard label="Aprobadas" value={String(approved.length)} tone="green" icon={CheckCircle2} />
        <StatCard label="Rechazadas" value={String(rejected.length)} tone="rose" icon={XCircle} />
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-stone-200 p-4">
          <h2 className="text-lg font-bold text-ink">Solicitudes de premium</h2>
          <p className="text-sm text-stone-500">Aprueba o rechaza la solicitud y actualiza el plan de la cuenta.</p>
        </div>
        <div className="space-y-3 p-4">
          {upgradeRequests.map((request) => (
            <article key={request.id} className="rounded-lg border border-stone-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-bold text-ink">{request.businessName}</p>
                  <p className="text-sm text-stone-500">{request.userEmail}</p>
                  <p className="mt-1 text-sm text-stone-600">Plan solicitado: {request.requestedPlan}</p>
                  {request.paymentMethod ? (
                    <p className="mt-1 text-sm text-stone-600">
                      Pago: {request.paymentMethod}
                      {request.paymentAmount ? ` · ${money(request.paymentAmount)}` : ''}
                      {request.paymentReference ? ` · Ref: ${request.paymentReference}` : ''}
                    </p>
                  ) : null}
                  {request.note ? <p className="mt-1 text-sm text-stone-500">{request.note}</p> : null}
                </div>
                <span className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-600">
                  {request.status}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <button className="primary-button" type="button" onClick={() => approveUpgradeRequest(request.id)}>
                  Aprobar
                </button>
                <button className="secondary-button" type="button" onClick={() => rejectUpgradeRequest(request.id)}>
                  Rechazar
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}
