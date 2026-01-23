
import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "@/components/ui/sonner";
import { ConsuntivaServizioForm } from "./ConsuntivaServizioForm";
import { consuntivaServizio } from "@/lib/api/servizi";
import { Profile } from "@/lib/types";
import { ConsuntivaServizioFormData } from "../hooks/useConsuntivaServizioForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ConsuntivaServizioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  isContanti: boolean;
  incassoRicevuto?: number;
  oreLavorate?: number;
  users: Profile[];
  onComplete: () => void;
}

export function ConsuntivaServizioSheet({
  open,
  onOpenChange,
  servizioId,
  isContanti,
  incassoRicevuto = 0,
  oreLavorate = 0,
  users,
  onComplete,
}: ConsuntivaServizioSheetProps) {
  const [adminUsers, setAdminUsers] = useState<{ id: string; name: string }[]>([]);

  // ✅ Fetch servizio reale dal database invece di usare mock
  const { data: servizio, isLoading } = useQuery({
    queryKey: ['servizio-consuntiva-sheet', servizioId],
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
      return data;
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

  // ✅ Loading state mentre fetchiamo il servizio
  if (isLoading || !servizio) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-[500px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Consuntiva servizio</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex justify-center">
            <p className="text-muted-foreground">Caricamento...</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // ✅ Determina se mostrare campo "Consegna contanti a"
  // Lo mostriamo SOLO se: pagamento è Contanti E assegnato è un dipendente
  const isContiPayment = servizio.metodo_pagamento === 'Contanti';
  const assegnatoRole = servizio.assegnato?.role;
  const requiresConsegnaContanti = isContiPayment && assegnatoRole === 'dipendente';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Consuntiva servizio</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <ConsuntivaServizioForm
            servizio={servizio as any}
            adminUsers={adminUsers}
            requiresConsegnaContanti={requiresConsegnaContanti}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
