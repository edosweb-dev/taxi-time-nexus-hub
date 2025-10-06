import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { MobileTextarea } from "@/components/ui/mobile-input";
import { Mail, FileText } from "lucide-react";
import { NotificheEmailField } from "../NotificheEmailField";
import { ServizioFormData } from "@/lib/types/servizi";

export const Step3ComunicazioneNote = () => {
  const { register } = useFormContext<ServizioFormData>();

  return (
    <Card className="p-6 md:p-8 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Comunicazione
        </h3>
        <NotificheEmailField />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Note Aggiuntive
        </h3>
        <MobileTextarea
          placeholder="Eventuali note aggiuntive..."
          rows={4}
          {...register("note")}
        />
      </div>
    </Card>
  );
};
