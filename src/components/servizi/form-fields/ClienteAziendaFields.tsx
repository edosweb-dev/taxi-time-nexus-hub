import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { AziendaSelectField } from "../AziendaSelectField";
import { ReferenteSelectField } from "../ReferenteSelectField";
import { ServizioFormData } from "@/lib/types/servizi";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";
import { Label } from "@/components/ui/label";

export function ClienteAziendaFields() {
  const form = useFormContext<ServizioFormData>();
  const aziendaId = form.watch("azienda_id");

  // Hook per ottenere profilo utente corrente
  const { data: currentProfile } = useQuery({
    queryKey: ["current-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          role,
          azienda_id,
          first_name,
          last_name,
          aziende:azienda_id (
            id,
            nome
          )
        `)
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Errore fetch profilo:", error);
        return null;
      }
      
      return data;
    },
  });

  const isCliente = currentProfile?.role === 'cliente';

  // Auto-popola azienda_id e referente_id per clienti
  useEffect(() => {
    if (isCliente && currentProfile) {
      form.setValue("azienda_id", currentProfile.azienda_id || '');
      form.setValue("referente_id", currentProfile.id);
    }
  }, [isCliente, currentProfile, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {isCliente ? (
        // Cliente: Campi READ-ONLY
        <>
          <div className="space-y-2">
            <Label>
              Azienda <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {currentProfile?.aziende?.nome || "Caricamento..."}
              </span>
              <Badge variant="secondary" className="ml-auto text-xs">
                La tua azienda
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Referente <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md border">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {currentProfile?.first_name} {currentProfile?.last_name}
              </span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Tu
              </Badge>
            </div>
          </div>
        </>
      ) : (
        // Admin/Socio: Dropdown selezionabili
        <>
          <AziendaSelectField />
          {aziendaId ? (
            <ReferenteSelectField aziendaId={aziendaId} />
          ) : (
            <div className="space-y-2">
              <Label>Referente (opzionale)</Label>
              <div className="h-10 px-3 py-2 bg-muted rounded-md border flex items-center text-sm text-muted-foreground">
                Seleziona prima un'azienda
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
