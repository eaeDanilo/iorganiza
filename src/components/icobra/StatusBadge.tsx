import { Badge } from "@/components/ui/badge";
import type { EmprestimoStatus, ParcelaStatus } from "@/lib/icobra/types";

export function ParcelaStatusBadge({ status }: { status: ParcelaStatus }) {
  if (status === "pago") return <Badge variant="success">Pago</Badge>;
  if (status === "atrasado") return <Badge variant="destructive">Atrasado</Badge>;
  return <Badge variant="warning">Pendente</Badge>;
}

export function EmprestimoStatusBadge({
  status,
  temAtraso,
}: {
  status: EmprestimoStatus;
  temAtraso?: boolean;
}) {
  if (status === "quitado") return <Badge variant="success">Quitado</Badge>;
  if (temAtraso) return <Badge variant="destructive">Com atraso</Badge>;
  return <Badge variant="default">Ativo</Badge>;
}
