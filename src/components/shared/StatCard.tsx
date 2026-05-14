import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: 'primary' | 'secondary' | 'success' | 'muted';
  icon?: React.ReactNode;
  subtext?: string;
}

const accentColors = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  muted: 'text-foreground',
};

const glowColors = {
  primary: 'shadow-glow',
  secondary: 'shadow-glow-coral',
  success: '',
  muted: '',
};

export function StatCard({ label, value, accent = 'muted', icon, subtext }: StatCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-border bg-gradient-card p-6 shadow-card transition-all hover:scale-[1.02]',
      glowColors[accent],
    )}>
      <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-gradient-stat opacity-40 blur-2xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          {icon && <div className={cn('opacity-60', accentColors[accent])}>{icon}</div>}
        </div>
        <p className={cn('mt-3 text-4xl font-bold tracking-tight', accentColors[accent])}>{value}</p>
        {subtext && <p className="mt-2 text-xs text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  );
}
