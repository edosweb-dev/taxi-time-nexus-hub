
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AziendaForm } from "./AziendaForm";
import { Azienda } from "@/lib/types";
import { AziendaFormData } from "@/lib/api/aziende";

interface AziendaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AziendaFormData) => void;
  azienda: Azienda | null;
  isSubmitting: boolean;
}

export function AziendaDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  azienda,
  isSubmitting,
}: AziendaDialogProps) {
  if (isOpen) {
    console.log("AziendaDialog opened with data:", azienda);
  }

  const handleAziendaFormSubmit = (data: AziendaFormData) => {
    console.log("AziendaDialog - Form submitted with data:", data);
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {azienda ? "Modifica Azienda" : "Crea Nuova Azienda"}
          </DialogTitle>
          <DialogDescription>
            {azienda 
              ? "Modifica i dettagli dell'azienda esistente."
              : "Inserisci i dettagli della nuova azienda."}
          </DialogDescription>
        </DialogHeader>
        <AziendaForm
          azienda={azienda}
          onSubmit={handleAziendaFormSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
