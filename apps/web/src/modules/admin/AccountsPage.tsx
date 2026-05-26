import { UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import type { AccountPlan, Role } from '../../shared/types';

export function AccountsPage() {
  const { users, updateUserPlan, updateUserRole } = useVecopaStore();
  const [savingId, setSavingId] = useState('');

  const stats = useMemo(
    () => ({
      total: users.length,
      free: users.filter((user) => user.plan === 'free').length,
      premium: users.filter((user) => user.plan === 'premium').length,
    }),
    [users],
  );

  const update = async (userId: string, plan: AccountPlan, role: Role) => {
    setSavingId(userId);
    await Promise.all([updateUserPlan(userId, plan), updateUserRole(userId, role)]);
    setSavingId('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Cuentas" eyebrow="Super admin" />
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Usuarios" value={String(stats.total)} tone="stone" icon={UsersRound} />
        <StatCard label="Gratis" value={String(stats.free)} tone="amber" icon={UsersRound} />
        <StatCard label="Premium" value={String(stats.premium)} tone="green" icon={UsersRound} />
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-stone-200 p-4">
          <h2 className="text-lg font-bold text-ink">Gestión de usuarios</h2>
          <p className="text-sm text-stone-500">Cambia el plan o rol de cada cuenta desde aquí.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase text-stone-500">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Negocio</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Accion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  saving={savingId === user.id}
                  onSave={update}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function UserRow({
  user,
  saving,
  onSave,
}: {
  user: { id: string; name: string; email: string; businessName?: string; plan: AccountPlan; role: Role };
  saving: boolean;
  onSave: (userId: string, plan: AccountPlan, role: Role) => Promise<void>;
}) {
  const [plan, setPlan] = useState<AccountPlan>(user.plan);
  const [role, setRole] = useState<Role>(user.role);

  return (
    <tr className="border-t border-stone-200">
      <td className="px-4 py-3">
        <p className="font-bold text-ink">{user.name}</p>
        <p className="text-xs text-stone-500">{user.email}</p>
      </td>
      <td className="px-4 py-3 text-stone-700">{user.businessName ?? 'Sin nombre'}</td>
      <td className="px-4 py-3">
        <select className="field max-w-40" value={role} onChange={(event) => setRole(event.target.value as Role)}>
          <option value="super_admin">Super admin</option>
          <option value="administrador">Administrador</option>
          <option value="cajero">Cajero</option>
          <option value="mozo">Mozo</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select className="field max-w-32" value={plan} onChange={(event) => setPlan(event.target.value as AccountPlan)}>
          <option value="free">Gratis</option>
          <option value="premium">Premium</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <button className="secondary-button" type="button" onClick={() => onSave(user.id, plan, role)} disabled={saving}>
          {saving ? 'Guardando...' : 'Actualizar'}
        </button>
      </td>
    </tr>
  );
}
