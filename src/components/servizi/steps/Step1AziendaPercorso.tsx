import { useFormContext, useWatch } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MobileInput } from "@/components/ui/mobile-input";
import { Building2, Calendar, MapPin } from "lucide-react";
import { AziendaSelectField } from "../AziendaSelectField";
import { ReferenteSelectField } from "../ReferenteSelectField";
import { ServizioFormData } from "@/lib/types/servizi";

export const Step1AziendaPercorso = () => {
  const { register, control } = useFormContext<ServizioFormData>();
  const aziendaId = useWatch({ control, name: "azienda_id" });

  return (
    <Card className="p-6 md:p-8 space-y-8">
      {/* SEZIONE 1: Azienda e Contatto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Azienda e Contatto
        </h3>
        <AziendaSelectField />
        {aziendaId && <ReferenteSelectField aziendaId={aziendaId} />}
      </div>

      {/* SEZIONE 2: Data e Orario */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Data e Orario
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data servizio *</Label>
            <MobileInput 
              type="date" 
              {...register("data_servizio")} 
            />
          </div>
          <div className="space-y-2">
            <Label>Orario servizio *</Label>
            <MobileInput 
              type="time" 
              {...register("orario_servizio")} 
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Numero commessa</Label>
          <MobileInput 
            placeholder="ES-2024-001" 
            {...register("numero_commessa")} 
          />
        </div>
      </div>

      {/* SEZIONE 3: Percorso */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Percorso
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Partenza</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Città</Label>
              <MobileInput 
                placeholder="Milano" 
                {...register("citta_presa")} 
              />
            </div>
            <div className="space-y-2">
              <Label>Indirizzo di presa *</Label>
              <MobileInput 
                placeholder="Via Roma 123" 
                {...register("indirizzo_presa")} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Destinazione</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Città</Label>
              <MobileInput 
                placeholder="Ferno" 
                {...register("citta_destinazione")} 
              />
            </div>
            <div className="space-y-2">
              <Label>Indirizzo di destinazione *</Label>
              <MobileInput 
                placeholder="Aeroporto Malpensa" 
                {...register("indirizzo_destinazione")} 
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
