
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompletaServizioForm } from "./CompletaServizioForm";
import { Profile } from "@/lib/types";

interface CompletaServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  users: Profile[];
}

export function CompletaServizioDialog({
  open,
  onOpenChange,
  servizioId,
  metodoDefault,
  onComplete,
  users,
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
        />
      </DialogContent>
    </Dialog>
  );
}
