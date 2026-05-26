import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  tone: 'green' | 'blue' | 'rose' | 'amber' | 'stone';
  icon: LucideIcon;
}

const tones = {
  green: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  rose: 'bg-rose-50 text-rose-700',
  amber: 'bg-amber-50 text-amber-700',
  stone: 'bg-stone-100 text-stone-700',
};

export function StatCard({ label, value, tone, icon: Icon }: StatCardProps) {
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-stone-500">{label}</span>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      <strong className="mt-4 block text-2xl font-bold text-ink">{value}</strong>
    </div>
  );
}

