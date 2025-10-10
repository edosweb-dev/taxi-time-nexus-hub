
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompletaServizioForm } from "./CompletaServizioForm";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";

interface CompletaServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  users: Profile[];
  servizio: Servizio;
}

export function CompletaServizioDialog({
  open,
  onOpenChange,
  servizioId,
  metodoDefault,
  onComplete,
  users,
  servizio,
}: CompletaServizioDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Completa servizio</DialogTitle>
        </DialogHeader>
        
        <CompletaServizioForm 
          servizioId={servizioId}
          metodoDefault={metodoDefault}
          onComplete={onComplete}
          onOpenChange={onOpenChange}
          users={users}
          open={open}
          servizio={servizio}
        />
      </DialogContent>
    </Dialog>
  );
}
