import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useVecopaStore } from '../store/useVecopaStore';

export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const user = useVecopaStore((state) => state.user);

  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
