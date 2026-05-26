import { Crown, Lock, Mail, Store, UserPlus } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVecopaStore } from '../../shared/store/useVecopaStore';
import type { AccountPlan } from '../../shared/types';

type Mode = 'login' | 'register';

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [plan, setPlan] = useState<AccountPlan>('free');
  const [email, setEmail] = useState('superadmin@vecopa.pe');
  const [password, setPassword] = useState('SuperAdmin123!');
  const [businessName, setBusinessName] = useState('Vecopa Demo');
  const [error, setError] = useState('');
  const login = useVecopaStore((state) => state.login);
  const register = useVecopaStore((state) => state.register);
  const loading = useVecopaStore((state) => state.loading);
  const storeError = useVecopaStore((state) => state.error);
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    const ok =
      mode === 'login'
        ? await login({ email, password })
        : await register({ email, password, plan, businessName });

    if (!ok) {
      setError(storeError ?? 'No se pudo completar la operacion');
      return;
    }

    navigate('/');
  };

  return (
    <main className="grid min-h-screen bg-[#f6f7f4] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-5 py-10">
        <form className="panel w-full max-w-md p-5 sm:p-8" onSubmit={submit}>
          <div className="mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink text-xl font-black text-white">V</div>
            <h1 className="mt-5 text-3xl font-black text-ink">Vecopa</h1>
            <p className="mt-2 text-sm text-stone-500">Gestion HORECA desde navegador, lista para celulares, tablets y caja.</p>
          </div>

          <div className="mb-5 flex rounded-lg border border-stone-200 bg-stone-50 p-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white text-ink shadow-sm' : 'text-stone-500'}`}
              onClick={() => setMode('login')}
            >
              Ingresar
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm font-bold ${mode === 'register' ? 'bg-white text-ink shadow-sm' : 'text-stone-500'}`}
              onClick={() => setMode('register')}
            >
              Registrarse
            </button>
          </div>

          {mode === 'register' ? (
            <div className="mb-5 rounded-lg border border-brand-200 bg-brand-50 p-4">
              <p className="text-sm font-bold text-brand-900">Elige tu plan</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`rounded-lg border p-3 text-left ${plan === 'free' ? 'border-brand-600 bg-white' : 'border-stone-200 bg-white/70'}`}
                  onClick={() => setPlan('free')}
                >
                  <p className="text-sm font-bold text-ink">Gratis</p>
                  <p className="mt-1 text-xs text-stone-500">Empieza con modulos basicos y candados visibles.</p>
                </button>
                <button
                  type="button"
                  className={`rounded-lg border p-3 text-left ${plan === 'premium' ? 'border-brand-600 bg-white' : 'border-stone-200 bg-white/70'}`}
                  onClick={() => setPlan('premium')}
                >
                  <p className="text-sm font-bold text-ink">Premium</p>
                  <p className="mt-1 text-xs text-stone-500">Todo desbloqueado desde el primer dia.</p>
                </button>
              </div>
            </div>
          ) : null}

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Correo</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input className="field pl-10" value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
            </div>
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-stone-700">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
              <input className="field pl-10" value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
            </div>
          </label>

          {mode === 'register' ? (
            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-semibold text-stone-700">Nombre del negocio</span>
              <div className="relative">
                <Store className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input className="field pl-10" value={businessName} onChange={(event) => setBusinessName(event.target.value)} type="text" />
              </div>
            </label>
          ) : null}

          {error || storeError ? <p className="mb-4 rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error || storeError}</p> : null}

          <button className="primary-button w-full" type="submit" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Entrar al POS' : 'Crear cuenta'}
          </button>

          <div className="mt-5 space-y-2 text-xs text-stone-500">
            <p className="flex items-center gap-2 font-semibold text-brand-700">
              <Crown size={14} /> Super admin: superadmin@vecopa.pe
            </p>
            <p>Si registras una cuenta gratuita, veras todos los modulos pero algunos quedaran bloqueados con aviso premium.</p>
            <p>Si eliges premium, las funcionalidades quedan desbloqueadas desde el inicio.</p>
          </div>
        </form>
      </section>

      <section className="hidden min-h-screen bg-ink p-8 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-bold uppercase text-brand-100">MVP SaaS HORECA</p>
          <h2 className="mt-4 text-5xl font-black leading-tight">Ventas, mesas, caja y pagos QR en una sola web app.</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {['Yape y Plin', 'Caja diaria', 'Pedidos tactiles', 'Reportes'].map((item) => (
            <div key={item} className="rounded-lg border border-white/10 bg-white/10 p-5 text-lg font-bold">
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
