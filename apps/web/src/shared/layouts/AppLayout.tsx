import {
  BarChart3,
  Building2,
  Boxes,
  ClipboardList,
  Crown,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelsTopLeft,
  ReceiptText,
  Lock,
  Settings2,
  ShieldCheck,
  UsersRound,
  FileClock,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useVecopaStore } from '../store/useVecopaStore';
import { isModuleLocked, moduleLabels, superAdminModuleLabels, type ModuleId, type SuperAdminModuleId, roleLabel } from '../lib/access';
import type { Role } from '../types';

const navItems = [
  { id: 'dashboard' as ModuleId, to: '/', icon: LayoutDashboard },
  { id: 'mesas' as ModuleId, to: '/mesas', icon: PanelsTopLeft },
  { id: 'pedidos' as ModuleId, to: '/pedidos', icon: ClipboardList },
  { id: 'productos' as ModuleId, to: '/productos', icon: Boxes },
  { id: 'caja' as ModuleId, to: '/caja', icon: ReceiptText },
  { id: 'reportes' as ModuleId, to: '/reportes', icon: BarChart3 },
];

const superAdminNavItems = [
  { id: 'negocios' as SuperAdminModuleId, to: '/admin/negocios', icon: Building2 },
  { id: 'cuentas' as SuperAdminModuleId, to: '/admin/cuentas', icon: UsersRound },
  { id: 'solicitudes' as SuperAdminModuleId, to: '/admin/solicitudes', icon: FileClock },
  { id: 'planes' as SuperAdminModuleId, to: '/admin/planes', icon: ShieldCheck },
  { id: 'configuracion' as SuperAdminModuleId, to: '/admin/configuracion', icon: Settings2 },
];

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [open, setOpen] = useState(false);
  const user = useVecopaStore((state) => state.user);
  const planConfig = useVecopaStore((state) => state.planConfig);
  const logout = useVecopaStore((state) => state.logout);
  const lockedNotice = user ? (moduleId: ModuleId) => isModuleLocked(user.plan, moduleId, planConfig) : () => false;
  const isSuperAdmin = user?.role === 'super_admin';
  const visibleNavItems = isSuperAdmin ? [navItems[0]] : navItems;

  const navigation = (
    <nav className="flex flex-1 flex-col gap-1">
      {visibleNavItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
              isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
            }`
          }
        >
          <item.icon size={20} />
          <span className="flex-1 text-left">{moduleLabels[item.id]}</span>
          {user && lockedNotice(item.id) ? <Lock size={14} className="opacity-80" /> : null}
        </NavLink>
      ))}
      {isSuperAdmin ? (
        <div className="mt-5 border-t border-stone-200 pt-4">
          <p className="mb-2 px-3 text-[11px] font-black uppercase tracking-[0.18em] text-brand-700">
            Super Admin
          </p>
          {superAdminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                  isActive ? 'bg-ink text-white shadow-sm' : 'text-stone-600 hover:bg-stone-100 hover:text-ink'
                }`
              }
            >
              <item.icon size={20} />
              <span className="flex-1 text-left">{superAdminModuleLabels[item.id]}</span>
              <Crown size={14} className="opacity-80" />
            </NavLink>
          ))}
        </div>
      ) : null}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f7f4] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-stone-200 bg-white px-4 py-5 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-8 flex flex-1 flex-col">{navigation}</div>
        <UserCard name={user?.name ?? ''} role={user?.role ?? 'administrador'} plan={user?.plan ?? 'free'} onLogout={logout} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur lg:hidden">
        <Brand compact />
        <button className="icon-button" type="button" aria-label="Abrir menu" onClick={() => setOpen(true)}>
          <Menu size={21} />
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="flex h-full w-[min(86vw,320px)] flex-col bg-white p-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Brand />
              <button className="icon-button" type="button" aria-label="Cerrar menu" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-8 flex flex-1 flex-col">{navigation}</div>
            <UserCard name={user?.name ?? ''} role={user?.role ?? 'administrador'} plan={user?.plan ?? 'free'} onLogout={logout} />
          </aside>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-lg font-black text-white">V</div>
      {!compact ? (
        <div>
          <p className="text-lg font-black leading-tight text-ink">Vecopa</p>
          <p className="text-xs font-semibold text-brand-700">HORECA POS</p>
        </div>
      ) : (
        <p className="text-lg font-black text-ink">Vecopa</p>
      )}
    </div>
  );
}

function UserCard({
  name,
  role,
  plan,
  onLogout,
}: {
  name: string;
  role: Role;
  plan: 'free' | 'premium';
  onLogout: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
      <p className="truncate text-sm font-bold text-ink">{name}</p>
      <p className="text-xs capitalize text-stone-500">{roleLabel(role)} · {plan === 'premium' ? 'Premium' : 'Gratis'}</p>
      <button className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-stone-700" type="button" onClick={onLogout}>
        <LogOut size={17} />
        Salir
      </button>
    </div>
  );
}
