import { useFormContext } from "react-hook-form";
import { AziendaSelectField } from "../AziendaSelectField";
import { ReferenteSelectField } from "../ReferenteSelectField";
import { ServizioFormData } from "@/lib/types/servizi";

export function ClienteAziendaFields() {
  const form = useFormContext<ServizioFormData>();
  const aziendaId = form.watch("azienda_id");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AziendaSelectField />
      {aziendaId && <ReferenteSelectField aziendaId={aziendaId} />}
    </div>
  );
}
