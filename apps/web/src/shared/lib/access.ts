import type { AccountPlan, Role } from '../types';

export type ModuleId = 'dashboard' | 'mesas' | 'pedidos' | 'productos' | 'caja' | 'reportes';
export type SuperAdminModuleId = 'negocios' | 'cuentas' | 'solicitudes' | 'planes' | 'configuracion';

export interface PlanModuleAccessConfig {
  freeModules: ModuleId[];
  premiumModules: ModuleId[];
}

export const moduleLabels: Record<ModuleId, string> = {
  dashboard: 'Dashboard',
  mesas: 'Mesas',
  pedidos: 'Pedidos',
  productos: 'Productos',
  caja: 'Caja',
  reportes: 'Reportes',
};

export const superAdminModuleLabels: Record<SuperAdminModuleId, string> = {
  negocios: 'Negocios',
  cuentas: 'Cuentas',
  solicitudes: 'Solicitudes',
  planes: 'Planes',
  configuracion: 'Configuracion',
};

export const defaultPlanModuleAccess: Record<AccountPlan, ModuleId[]> = {
  free: ['dashboard', 'mesas', 'pedidos', 'productos'],
  premium: ['dashboard', 'mesas', 'pedidos', 'productos', 'caja', 'reportes'],
};

export const defaultPlanModuleConfig: PlanModuleAccessConfig = {
  freeModules: defaultPlanModuleAccess.free,
  premiumModules: defaultPlanModuleAccess.premium.filter((moduleId) => !defaultPlanModuleAccess.free.includes(moduleId)),
};

export const resolveModuleAccess = (config: PlanModuleAccessConfig = defaultPlanModuleConfig) => ({
  free: config.freeModules,
  premium: config.premiumModules,
});

export const isModuleLocked = (
  plan: AccountPlan,
  moduleId: ModuleId,
  config: PlanModuleAccessConfig = defaultPlanModuleConfig,
) => !resolveModuleAccess(config)[plan].includes(moduleId);

export const isSuperAdminModule = (role: Role, moduleId: string) =>
  role === 'super_admin' && moduleId in superAdminModuleLabels;

export const roleLabel = (role: Role) =>
  role === 'super_admin'
    ? 'Super Admin'
    : role === 'administrador'
      ? 'Administrador'
      : role === 'cajero'
        ? 'Cajero'
        : 'Mozo';
