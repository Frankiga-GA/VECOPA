import { Crown, Rocket, ShieldCheck, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import { defaultPlanModuleConfig, moduleLabels, type ModuleId, type PlanModuleAccessConfig } from '../../shared/lib/access';
import { useVecopaStore } from '../../shared/store/useVecopaStore';

const modules: ModuleId[] = ['dashboard', 'mesas', 'pedidos', 'productos', 'caja', 'reportes'];

export function PlansPage() {
  const planConfig = useVecopaStore((state) => state.planConfig);
  const updatePlanConfig = useVecopaStore((state) => state.updatePlanConfig);
  const [draft, setDraft] = useState<PlanModuleAccessConfig>(planConfig);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(planConfig);
  }, [planConfig]);

  const summary = useMemo(
    () => ({
      free: draft.freeModules.length,
      premium: draft.premiumModules.length,
    }),
    [draft],
  );

  const assign = (moduleId: ModuleId, plan: 'free' | 'premium') => {
    setDraft((current) => {
      const freeModules = current.freeModules.filter((item) => item !== moduleId);
      const premiumModules = current.premiumModules.filter((item) => item !== moduleId);

      if (plan === 'free') {
        freeModules.push(moduleId);
      } else {
        premiumModules.push(moduleId);
      }

      return { freeModules, premiumModules };
    });
  };

  const save = async () => {
    setSaving(true);
    await updatePlanConfig({
      freeModules: modules.filter((moduleId) => draft.freeModules.includes(moduleId)),
      premiumModules: modules.filter((moduleId) => draft.premiumModules.includes(moduleId)),
    });
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planes"
        eyebrow="Modelo comercial"
        action={
          <button className="primary-button" type="button" onClick={save} disabled={saving}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        }
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Gratis" value={String(summary.free)} tone="amber" icon={ShieldCheck} />
        <StatCard label="Premium" value={String(summary.premium)} tone="green" icon={Crown} />
        <StatCard label="Configuracion" value="Activa" tone="stone" icon={Rocket} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="panel overflow-hidden">
          <div className="border-b border-stone-200 p-4">
            <h2 className="text-lg font-bold text-ink">Asignacion de modulos</h2>
            <p className="text-sm text-stone-500">Cada modulo debe vivir en un solo plan. Cambia la categoria y guarda.</p>
          </div>
          <div className="space-y-3 p-4">
            {modules.map((moduleId) => {
              const currentPlan = draft.freeModules.includes(moduleId) ? 'free' : 'premium';
              return (
                <article key={moduleId} className="rounded-lg border border-stone-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-ink">{moduleLabels[moduleId]}</p>
                      <p className="text-sm text-stone-500">Define si se ofrece en el plan gratis o en el premium.</p>
                    </div>
                    <div className="flex rounded-lg border border-stone-200 bg-stone-50 p-1">
                      <PlanChip
                        label="Gratis"
                        active={currentPlan === 'free'}
                        onClick={() => assign(moduleId, 'free')}
                      />
                      <PlanChip
                        label="Premium"
                        active={currentPlan === 'premium'}
                        onClick={() => assign(moduleId, 'premium')}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <article className="panel p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-ink">Plan Gratis</h2>
                <p className="text-sm text-stone-500">Modulos visibles para cuentas sin pago.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {draft.freeModules.map((moduleId) => (
                <li key={moduleId} className="rounded-lg bg-stone-50 px-3 py-2">
                  {moduleLabels[moduleId]}
                </li>
              ))}
            </ul>
          </article>

          <article className="panel p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <Crown size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-ink">Plan Premium</h2>
                <p className="text-sm text-stone-500">Modulos activados para clientes de pago.</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {draft.premiumModules.map((moduleId) => (
                <li key={moduleId} className="rounded-lg bg-stone-50 px-3 py-2">
                  {moduleLabels[moduleId]}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-lg font-bold text-ink">Configuracion actual</h2>
        <p className="mt-2 text-sm text-stone-500">
          Si no guardas cambios, se mantiene la configuracion almacenada en Firestore.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-stone-950 p-4 text-xs text-stone-100">
{JSON.stringify(draft ?? defaultPlanModuleConfig, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function PlanChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-md px-4 text-sm font-bold transition ${
        active ? 'bg-ink text-white shadow-sm' : 'bg-transparent text-stone-500 hover:text-ink'
      }`}
    >
      {label}
    </button>
  );
}
