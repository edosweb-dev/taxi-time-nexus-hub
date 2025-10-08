import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Zap, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

type InserimentoServizioModalProps = {
  open: boolean;
  onClose: () => void;
};

export const InserimentoServizioModal = ({ open, onClose }: InserimentoServizioModalProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleVeloce = () => {
    navigate("/nuovo-servizio?mode=veloce");
    onClose();
  };

  const handleCompleto = () => {
    navigate("/nuovo-servizio?mode=completo");
    onClose();
  };

  // Shared content component (DRY)
  const ModalContent = () => (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-6">
        Scegli il tipo di inserimento:
      </p>
      
      {/* Inserimento Veloce */}
      <div className="border rounded-lg p-4 hover:border-primary transition-colors min-h-[88px] active:scale-[0.98]">
        <div className="flex items-start gap-3 mb-3">
          <Zap className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Inserimento Veloce</h4>
            <p className="text-sm text-muted-foreground">
              Crea una bozza con i dati essenziali. Potrai completare in seguito.
            </p>
          </div>
        </div>
        <Button 
          onClick={handleVeloce}
          variant="outline"
          className="w-full"
        >
          Inserimento Veloce →
        </Button>
      </div>
      
      {/* Inserimento Completo */}
      <div className="border rounded-lg p-4 hover:border-primary transition-colors min-h-[88px] active:scale-[0.98]">
        <div className="flex items-start gap-3 mb-3">
          <ClipboardList className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1">Inserimento Completo</h4>
            <p className="text-sm text-muted-foreground">
              Compila tutti i dettagli del servizio inclusi passeggeri.
            </p>
          </div>
        </div>
        <Button 
          onClick={handleCompleto}
          className="w-full"
        >
          Inserimento Completo →
        </Button>
      </div>
    </div>
  );

  // Mobile: Sheet drawer from bottom
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-[20px]">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl">Nuovo Servizio</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 overflow-y-auto max-h-[calc(85vh-80px)]">
            <ModalContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop/Tablet: Centered dialog
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuovo Servizio</DialogTitle>
        </DialogHeader>
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
};
