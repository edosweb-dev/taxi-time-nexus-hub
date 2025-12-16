import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AziendaQuickForm, AziendaQuickFormData } from "./AziendaQuickForm";
import { AziendaFormData } from "@/lib/api/aziende";

interface AziendaQuickDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AziendaFormData) => void;
  isSubmitting: boolean;
}

export function AziendaQuickDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: AziendaQuickDialogProps) {
  const isMobile = useIsMobile();

  const handleFormSubmit = (data: AziendaQuickFormData) => {
    // Convert quick form data to full AziendaFormData
    const fullData: AziendaFormData = {
      nome: data.nome,
      partita_iva: data.partita_iva,
      email: data.email || null,
      telefono: data.telefono || null,
      // Optional fields with defaults
      indirizzo: null,
      citta: null,
      pec: null,
      sdi: null,
      provvigione: false,
      provvigione_tipo: null,
      provvigione_valore: null,
      firma_digitale_attiva: false,
    };
    onSubmit(fullData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const title = "Nuova Azienda";
  const description = "Inserisci i dati essenziali. Potrai completare il profilo in seguito.";

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] overflow-y-auto rounded-t-xl"
        >
          <SheetHeader className="text-left pb-4">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <AziendaQuickForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <AziendaQuickForm
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
