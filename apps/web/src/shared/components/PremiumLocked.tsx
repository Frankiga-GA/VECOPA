import { Copy, Crown, Mail, Smartphone, TicketCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { useVecopaStore } from '../store/useVecopaStore';

export function PremiumLocked({ moduleName }: { moduleName: string }) {
  const user = useVecopaStore((state) => state.user);
  const billingConfig = useVecopaStore((state) => state.billingConfig);
  const requestUpgrade = useVecopaStore((state) => state.requestUpgrade);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const paymentPayload = useMemo(
    () =>
      [
        'VECOPA',
        billingConfig.yapeHolder,
        billingConfig.yapeNumber,
        billingConfig.currency,
        billingConfig.premiumPrice.toFixed(2),
        billingConfig.referencePrefix,
      ].join('|'),
    [billingConfig],
  );

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(paymentPayload, { width: 280, margin: 1 })
      .then((dataUrl) => {
        if (active) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [paymentPayload]);

  const handleCopy = async () => {
    if (!billingConfig.yapeNumber) return;
    await navigator.clipboard.writeText(billingConfig.yapeNumber);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await requestUpgrade({
        userId: user.id,
        userEmail: user.email,
        businessName: user.businessName ?? user.name,
        requestedPlan: 'premium',
        note: paymentNote.trim() || `Pago premium desde modulo ${moduleName}`,
        paymentMethod: 'YAPE',
        paymentAmount: billingConfig.premiumPrice,
        paymentReference: paymentReference.trim(),
        paymentNote: paymentNote.trim(),
        paidAt: new Date().toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel p-5 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <Crown size={20} />
        </div>
        <div>
          <p className="text-lg font-black text-ink">{moduleName} bloqueado</p>
          <p className="text-sm text-stone-500">Tu plan actual no incluye este modulo.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-brand-700">Pago por Yape</p>
              <p className="mt-1 text-sm text-stone-500">Escanea el QR o copia el numero.</p>
            </div>
            <Smartphone size={18} className="text-brand-700" />
          </div>

          <div className="mt-4 flex items-center justify-center rounded-lg bg-stone-50 p-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR de pago Vecopa" className="h-56 w-56 rounded-lg bg-white p-2" />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-white text-sm text-stone-400">
                QR no disponible
              </div>
            )}
          </div>

          <button className="secondary-button mt-4 w-full" type="button" onClick={handleCopy}>
            <Copy size={18} />
            {copied ? 'Copiado' : 'Copiar numero'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Solicita el plan premium con el super admin y realiza el pago por Yape con los datos mostrados abajo.
            </p>
            <div className="mt-3 grid gap-2 text-sm text-amber-900/90 sm:grid-cols-2">
              <InfoRow label="Monto" value={money(billingConfig.premiumPrice)} />
              <InfoRow label="Numero" value={billingConfig.yapeNumber || 'Sin configurar'} />
              <InfoRow label="Titular" value={billingConfig.yapeHolder || 'Sin configurar'} />
              <InfoRow label="Referencia" value={billingConfig.referencePrefix || 'Sin configurar'} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Referencia de Yape" value={paymentReference} onChange={setPaymentReference} placeholder="YAP-123456" />
            <Field
              label="Detalle opcional"
              value={paymentNote}
              onChange={setPaymentNote}
              placeholder="Deposito por plan premium"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="primary-button" type="button" onClick={handleSubmit} disabled={submitting}>
              <TicketCheck size={18} />
              {submitting ? 'Enviando...' : 'Ya realice el pago'}
            </button>
            <a className="secondary-button" href={`mailto:${billingConfig.supportEmail}`}>
              <Mail size={18} />
              Contactar super admin
            </a>
          </div>

          <p className="text-xs text-stone-500">
            La activacion del plan premium se confirmara manualmente por el super admin despues de revisar la referencia y el pago recibido.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2">
      <span className="font-semibold text-amber-900/80">{label}</span>
      <span className="font-bold text-amber-950">{value}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</span>
      <input className="field" value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function money(value: number) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}
