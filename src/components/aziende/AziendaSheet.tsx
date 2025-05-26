
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AziendaForm } from "./AziendaForm";
import { Azienda } from "@/lib/types";
import { AziendaFormData } from "@/lib/api/aziende";

interface AziendaSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AziendaFormData) => void;
  azienda: Azienda | null;
  isSubmitting: boolean;
}

export function AziendaSheet({
  isOpen,
  onOpenChange,
  onSubmit,
  azienda,
  isSubmitting,
}: AziendaSheetProps) {
  if (isOpen) {
    console.log("AziendaSheet opened with data:", azienda);
  }

  const handleAziendaFormSubmit = (data: AziendaFormData) => {
    console.log("AziendaSheet - Form submitted with data:", data);
    onSubmit(data);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {azienda ? "Modifica Azienda" : "Crea Nuova Azienda"}
          </SheetTitle>
          <SheetDescription>
            {azienda 
              ? "Modifica i dettagli dell'azienda esistente."
              : "Inserisci i dettagli della nuova azienda."}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <AziendaForm
            azienda={azienda}
            onSubmit={handleAziendaFormSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
