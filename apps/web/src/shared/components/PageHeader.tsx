import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({ title, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-brand-700">{eyebrow}</p> : null}
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

