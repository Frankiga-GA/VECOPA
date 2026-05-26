import { Building2, CalendarClock, ShieldCheck, TriangleAlert, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import type { Business, BusinessEvent } from '../../shared/types';

export function BusinessesPage() {
  const { businesses, businessEvents, renewBusinessLicense, updateBusinessStatus } = useVecopaStore();
  const [selectedBusinessId, setSelectedBusinessId] = useState(businesses[0]?.id ?? '');
  const active = businesses.filter((business) => business.licenseStatus === 'activa').length;
  const expired = businesses.filter((business) => business.licenseStatus === 'vencida').length;
  const suspended = businesses.filter((business) => business.licenseStatus === 'suspendida').length;
  const pendingPayment = businesses.filter((business) => business.paymentStatus === 'pendiente').length;
  const selectedBusiness = businesses.find((business) => business.id === selectedBusinessId) ?? businesses[0];
  const history = useMemo(
    () =>
      businessEvents
        .filter((event) => event.businessId === selectedBusiness?.id)
        .slice()
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 8),
    [businessEvents, selectedBusiness?.id],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Negocios" eyebrow="Plataforma SaaS" />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Activas" value={String(active)} tone="green" icon={ShieldCheck} />
        <StatCard label="Vencidas" value={String(expired)} tone="amber" icon={CalendarClock} />
        <StatCard label="Suspendidas" value={String(suspended)} tone="rose" icon={TriangleAlert} />
        <StatCard label="Pago pendiente" value={String(pendingPayment)} tone="blue" icon={WalletCards} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="panel overflow-hidden">
          <div className="border-b border-stone-200 p-4">
            <h2 className="text-lg font-bold text-ink">Negocios registrados</h2>
            <p className="text-sm text-stone-500">Revisa plan, licencia y estado de pago por negocio.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase text-stone-500">
                <tr>
                  <th className="px-4 py-3">Negocio</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3">Licencia</th>
                  <th className="px-4 py-3">Sucursales</th>
                  <th className="px-4 py-3">Vence</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((business) => (
                  <BusinessRow
                    key={business.id}
                    business={business}
                    selected={selectedBusinessId === business.id}
                    onSelect={() => setSelectedBusinessId(business.id)}
                    onRenew={renewBusinessLicense}
                    onToggleStatus={updateBusinessStatus}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="panel p-4">
          <h2 className="text-lg font-bold text-ink">Historial</h2>
          <p className="text-sm text-stone-500">
            {selectedBusiness ? `Ultimos eventos de ${selectedBusiness.name}` : 'Selecciona un negocio para ver su historial'}
          </p>
          <div className="mt-4 space-y-2">
            {history.length ? (
              history.map((event) => <HistoryItem key={event.id} event={event} />)
            ) : (
              <div className="rounded-lg bg-stone-50 p-4 text-sm text-stone-500">Sin historial disponible.</div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}

function BusinessRow({
  business,
  selected,
  onSelect,
  onRenew,
  onToggleStatus,
}: {
  business: Business;
  selected: boolean;
  onSelect: () => void;
  onRenew: (businessId: string, plan?: Business['plan']) => Promise<void>;
  onToggleStatus: (businessId: string, status: Business['licenseStatus']) => Promise<void>;
}) {
  const licenseColor =
    business.licenseStatus === 'activa'
      ? 'bg-emerald-50 text-emerald-700'
      : business.licenseStatus === 'suspendida'
        ? 'bg-rose-50 text-rose-700'
        : 'bg-amber-50 text-amber-700';

  const paymentColor =
    business.paymentStatus === 'al_dia'
      ? 'bg-emerald-50 text-emerald-700'
      : business.paymentStatus === 'pendiente'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-rose-50 text-rose-700';

  return (
    <tr className={`border-t border-stone-200 ${selected ? 'bg-brand-50/40' : ''}`}>
      <td className="px-4 py-3">
        <button className="flex items-center gap-3 text-left" type="button" onClick={onSelect}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
            <Building2 size={18} />
          </div>
          <div>
            <p className="font-bold text-ink">{business.name}</p>
            <p className="text-xs text-stone-500">{business.ownerEmail}</p>
          </div>
        </button>
      </td>
      <td className="px-4 py-3">
        <span className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-bold uppercase text-stone-600">{business.plan}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${paymentColor}`}>{business.paymentStatus}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`rounded-lg px-3 py-1 text-xs font-bold uppercase ${licenseColor}`}>{business.licenseStatus}</span>
      </td>
      <td className="px-4 py-3 text-stone-700">{business.branchesCount}</td>
      <td className="px-4 py-3 text-stone-700">{new Date(business.licenseEndsAt).toLocaleDateString('es-PE')}</td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="secondary-button" type="button" onClick={() => onRenew(business.id, 'premium')}>
            Renovar
          </button>
          {business.licenseStatus === 'activa' ? (
            <button className="secondary-button" type="button" onClick={() => onToggleStatus(business.id, 'suspendida')}>
              Suspender
            </button>
          ) : (
            <button className="primary-button" type="button" onClick={() => onToggleStatus(business.id, 'activa')}>
              Reactivar
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function HistoryItem({ event }: { event: BusinessEvent }) {
  const tone =
    event.kind === 'suspension'
      ? 'text-rose-700 bg-rose-50'
      : event.kind === 'renovacion' || event.kind === 'upgrade_aprobado' || event.kind === 'pago_registrado'
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-amber-700 bg-amber-50';

  return (
    <article className="rounded-lg border border-stone-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`inline-flex rounded-lg px-2 py-1 text-[11px] font-black uppercase ${tone}`}>{event.kind}</p>
          <p className="mt-2 text-sm font-semibold text-ink">{eventLabel(event.kind)}</p>
          {event.note ? <p className="mt-1 text-sm text-stone-500">{event.note}</p> : null}
        </div>
        <p className="text-xs text-stone-400">{new Date(event.createdAt).toLocaleString('es-PE')}</p>
      </div>
    </article>
  );
}

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
