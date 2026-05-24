import { cn } from "@/lib/utils";
import type { EmprestimoUsage } from "@/lib/limits";

interface Props {
  usage: EmprestimoUsage;
}

export function EmprestimoUsageBadge({ usage }: Props) {
  const { count, max, atLimit } = usage;
  const pct = Math.min((count / max) * 100, 100);

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={cn(
          "text-xs tabular-nums",
          atLimit ? "text-yellow-500" : "text-muted-foreground"
        )}
      >
        {count} / {max} empréstimos
      </span>
      <div className="h-1 w-20 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            atLimit ? "bg-yellow-500" : "bg-primary/50"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
