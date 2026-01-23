
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { ConsuntivaServizioForm } from "./ConsuntivaServizioForm";
import { consuntivaServizio } from "@/lib/api/servizi";
import { Profile } from "@/lib/types";
import { ConsuntivaServizioFormData } from "../hooks/useConsuntivaServizioForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch servizio REALE dal database
  const { data: servizio, isLoading } = useQuery({
    queryKey: ['servizio-consuntiva', servizioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select(`
          *,
          azienda:aziende(id, nome),
          assegnato:profiles!assegnato_a(id, first_name, last_name, role)
        `)
        .eq('id', servizioId)
        .single();
      
      if (error) throw error;
      return data as any;
    },
    enabled: open,
  });

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
        incasso_ricevuto: data.incasso_ricevuto,
        ore_effettive: data.ore_effettive,
        ore_sosta: data.ore_sosta,
        consegna_contanti_a: servizio?.metodo_pagamento === 'Contanti' ? data.consegna_contanti_a : undefined,
        km_totali: data.km_totali,
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

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Consuntiva servizio</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            Caricamento...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!servizio) {
    return null;
  }

  // ✅ Determina se mostrare campo "Consegna contanti a"
  // Lo mostriamo SOLO se: pagamento è Contanti E assegnato è un dipendente
  const isContiPayment = servizio.metodo_pagamento === 'Contanti';
  const assegnatoRole = servizio.assegnato?.role;
  const requiresConsegnaContanti = isContiPayment && assegnatoRole === 'dipendente';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Consuntiva servizio</DialogTitle>
        </DialogHeader>
        
        <ConsuntivaServizioForm
          servizio={servizio}
          adminUsers={adminUsers}
          requiresConsegnaContanti={requiresConsegnaContanti}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
