import { CreditCard, Hash, Mail, Phone, Settings2, Store, TimerReset } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import type { BillingConfig } from '../../shared/types';

export function ConfigurationPage() {
  const user = useVecopaStore((state) => state.user);
  const billingConfig = useVecopaStore((state) => state.billingConfig);
  const updateBillingConfig = useVecopaStore((state) => state.updateBillingConfig);
  const [draft, setDraft] = useState<BillingConfig>(billingConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(billingConfig);
  }, [billingConfig]);

  const amountLabel = useMemo(() => money(draft.premiumPrice), [draft.premiumPrice]);

  const updateField = <K extends keyof BillingConfig>(field: K, value: BillingConfig[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateBillingConfig({
        ...draft,
        premiumPrice: Number(draft.premiumPrice) || 0,
        licenseDays: Number(draft.licenseDays) || 30,
        yapeNumber: draft.yapeNumber.trim(),
        yapeHolder: draft.yapeHolder.trim(),
        referencePrefix: draft.referencePrefix.trim(),
        supportEmail: draft.supportEmail.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configuracion" eyebrow="Super admin" />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <article className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
              <Settings2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink">Datos globales</h2>
              <p className="text-sm text-stone-500">Parametros base de la cuenta super admin.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="Super admin" value={user?.email ?? 'superadmin@vecopa.pe'} icon={Mail} />
            <Field label="Cuenta" value={user?.businessName ?? 'Vecopa'} icon={Store} />
          </div>
        </article>

        <article className="panel p-5">
          <h2 className="text-lg font-black text-ink">Soporte</h2>
          <p className="mt-2 text-sm text-stone-500">
            Todo upgrade comercial, cambio de plan o ajuste de permisos pasa por esta cuenta.
          </p>
          <a className="primary-button mt-5 w-full" href={`mailto:${billingConfig.supportEmail}`}>
            <Mail size={18} />
            Contactar
          </a>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="panel p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink">Configuracion de cobro</h2>
              <p className="text-sm text-stone-500">Define el precio del plan premium y los datos del Yape destino.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              label="Precio premium"
              icon={Hash}
              value={String(draft.premiumPrice)}
              onChange={(value) => updateField('premiumPrice', Number(value || 0))}
              inputMode="decimal"
              placeholder="49.90"
            />
            <TextField
              label="Dias de licencia"
              icon={TimerReset}
              value={String(draft.licenseDays)}
              onChange={(value) => updateField('licenseDays', Number(value || 0))}
              inputMode="numeric"
              placeholder="30"
            />
            <TextField
              label="Numero Yape"
              icon={Phone}
              value={draft.yapeNumber}
              onChange={(value) => updateField('yapeNumber', value)}
              placeholder="999111222"
            />
            <TextField
              label="Titular Yape"
              icon={Store}
              value={draft.yapeHolder}
              onChange={(value) => updateField('yapeHolder', value)}
              placeholder="Vecopa"
            />
            <TextField
              label="Prefijo de referencia"
              icon={Hash}
              value={draft.referencePrefix}
              onChange={(value) => updateField('referencePrefix', value)}
              placeholder="VECOPA"
            />
            <TextField
              label="Correo soporte"
              icon={Mail}
              value={draft.supportEmail}
              onChange={(value) => updateField('supportEmail', value)}
              placeholder="superadmin@vecopa.pe"
            />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Cobro premium</p>
              <p className="text-2xl font-black text-ink">{amountLabel}</p>
            </div>
            <button className="primary-button" type="button" onClick={save} disabled={saving}>
              <CreditCard size={18} />
              {saving ? 'Guardando...' : 'Guardar configuracion'}
            </button>
          </div>
        </article>

        <article className="panel p-5">
          <h2 className="text-lg font-black text-ink">Resumen activo</h2>
          <p className="mt-2 text-sm text-stone-500">Lo que veran las cuentas gratis al solicitar premium.</p>

          <div className="mt-4 space-y-3">
            <SummaryRow label="Monto" value={amountLabel} />
            <SummaryRow label="Numero" value={draft.yapeNumber || 'Sin configurar'} />
            <SummaryRow label="Titular" value={draft.yapeHolder || 'Sin configurar'} />
            <SummaryRow label="Referencia" value={draft.referencePrefix || 'Sin configurar'} />
            <SummaryRow label="Vigencia" value={`${draft.licenseDays} dias`} />
          </div>

          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">
              Cuando el usuario pague por Yape, el super admin puede validar la referencia y aprobar el upgrade desde
              solicitudes.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Mail;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
        <Icon size={14} />
        {label}
      </div>
      <p className="mt-3 font-semibold text-ink">{value}</p>
    </div>
  );
}

function TextField({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  icon: typeof Mail;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  inputMode?: 'text' | 'decimal' | 'numeric' | 'email';
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
        <Icon size={14} />
        {label}
      </span>
      <input
        className="field"
        value={value}
        placeholder={placeholder}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="text-sm font-semibold text-ink">{value}</span>
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
