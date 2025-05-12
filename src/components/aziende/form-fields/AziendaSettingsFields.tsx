
import { Control } from "react-hook-form";

interface AziendaSettingsFieldsProps {
  control: Control<any>;
}

export function AziendaSettingsFields({ control }: AziendaSettingsFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Le impostazioni per la firma digitale sono state rimosse */}
      <p className="text-muted-foreground text-sm">
        Impostazioni aggiuntive dell'azienda saranno disponibili in futuro.
      </p>
    </div>
  );
}
