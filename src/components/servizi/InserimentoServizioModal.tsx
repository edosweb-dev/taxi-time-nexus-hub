import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, ClipboardList } from "lucide-react";
import { useNavigate } from "react-router-dom";

type InserimentoServizioModalProps = {
  open: boolean;
  onClose: () => void;
};

export const InserimentoServizioModal = ({ open, onClose }: InserimentoServizioModalProps) => {
  const navigate = useNavigate();

  const handleVeloce = () => {
    navigate("/nuovo-servizio?mode=veloce");
    onClose();
  };

  const handleCompleto = () => {
    navigate("/nuovo-servizio?mode=completo");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuovo Servizio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground mb-6">
            Scegli il tipo di inserimento:
          </p>
          
          {/* Inserimento Veloce */}
          <div className="border rounded-lg p-4 hover:border-primary transition-colors">
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
          <div className="border rounded-lg p-4 hover:border-primary transition-colors">
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
      </DialogContent>
    </Dialog>
  );
};
