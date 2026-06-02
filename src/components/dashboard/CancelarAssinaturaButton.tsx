"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface CancelarAssinaturaButtonProps {
  subscriptionId: string;
  saaName: string;
  periodEnd: string | null;
}

export function CancelarAssinaturaButton({ subscriptionId, saaName, periodEnd }: CancelarAssinaturaButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/subscriptions/${subscriptionId}/cancel`, {
          method: "POST",
          headers: { accept: "application/json" },
        });
        if (!res.ok) throw new Error();
        toast.success("Cancelamento agendado. Acesso mantido até o fim do período.");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Erro ao cancelar. Tente novamente.");
      }
    });
  }

  return (
    <>
      <Button variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(true)}>
        Cancelar
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar <strong>{saaName}</strong>?
              {periodEnd && (
                <span className="mt-2 block">
                  Você manterá acesso até <strong>{formatDate(periodEnd)}</strong>.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isPending}>Manter assinatura</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Cancelando..." : "Confirmar cancelamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
