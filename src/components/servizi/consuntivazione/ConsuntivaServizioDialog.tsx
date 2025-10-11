
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { ConsuntivaServizioForm } from "./ConsuntivaServizioForm";
import { consuntivaServizio } from "@/lib/api/servizi";
import { Profile } from "@/lib/types";
import { ConsuntivaServizioFormData } from "../hooks/useConsuntivaServizioForm";

interface ConsuntivaServizioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  isContanti: boolean;
  incassoRicevuto?: number;
  oreLavorate?: number;
  users: Profile[];
  onComplete: () => void;
}

export function ConsuntivaServizioDialog({
  open,
  onOpenChange,
  servizioId,
  isContanti,
  incassoRicevuto = 0,
  oreLavorate = 0,
  users,
  onComplete,
}: ConsuntivaServizioDialogProps) {
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (users) {
      const filteredUsers = users
        .filter(user => user.role === 'admin' || user.role === 'socio')
        .map(user => ({
          id: user.id,
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.id,
        }));
      setAdminUsers(filteredUsers);
    }
  }, [users]);

  async function onSubmit(data: ConsuntivaServizioFormData) {
    try {
      const result = await consuntivaServizio({
        id: servizioId,
        incasso_previsto: data.incasso_previsto,
        ore_finali: data.ore_finali,
        consegna_contanti_a: isContanti ? data.consegna_contanti_a : undefined,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Servizio consuntivato con successo");
      onOpenChange(false);
      onComplete();
    } catch (error: any) {
      toast.error(`Errore: ${error.message || "Si è verificato un errore"}`);
    }
  }

  // Create a mock servizio object with the necessary fields for the form
  const servizio = {
    id: servizioId,
    tipo_cliente: 'azienda' as const,
    incasso_previsto: incassoRicevuto,
    ore_finali: oreLavorate,
    metodo_pagamento: isContanti ? 'Contanti' : '',
    // Add other required fields with placeholder values
    azienda_id: '',
    referente_id: '',
    data_servizio: '',
    orario_servizio: '',
    indirizzo_presa: '',
    indirizzo_destinazione: '',
    stato: 'completato' as const,
    created_at: '',
    created_by: '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Consuntiva servizio</DialogTitle>
        </DialogHeader>
        
        <ConsuntivaServizioForm
          servizio={servizio}
          adminUsers={adminUsers}
          isContanti={isContanti}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
