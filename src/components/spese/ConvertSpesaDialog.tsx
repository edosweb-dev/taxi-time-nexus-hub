
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { MetodoPagamentoSpesa } from "@/lib/types/spese";
import { getMetodiPagamento, convertSpesaToMovimento } from "@/lib/api/spese";

interface ConvertSpesaDialogProps {
  spesaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversionComplete: () => void;
}

export function ConvertSpesaDialog({ 
  spesaId, 
  open, 
  onOpenChange, 
  onConversionComplete 
}: ConvertSpesaDialogProps) {
  const [metodiPagamento, setMetodiPagamento] = useState<MetodoPagamentoSpesa[]>([]);
  const [selectedMetodo, setSelectedMetodo] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadMetodiPagamento();
    }
  }, [open]);

  const loadMetodiPagamento = async () => {
    setIsLoading(true);
    try {
      const metodi = await getMetodiPagamento();
      setMetodiPagamento(metodi);
      if (metodi.length > 0) {
        setSelectedMetodo(metodi[0].id);
      }
    } catch (error) {
      console.error("Errore nel caricamento dei metodi di pagamento:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i metodi di pagamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!selectedMetodo) {
      toast({
        title: "Errore",
        description: "Seleziona un metodo di pagamento.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await convertSpesaToMovimento(spesaId, selectedMetodo);
      toast({
        title: "Conversione completata",
        description: "La spesa è stata convertita in un movimento aziendale.",
      });
      onConversionComplete();
      onOpenChange(false);
    } catch (error) {
      console.error("Errore durante la conversione:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la conversione.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Converti in Spesa Aziendale</DialogTitle>
          <DialogDescription>
            Questa operazione convertirà la spesa personale in una spesa aziendale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="metodo-pagamento">Metodo di Pagamento</Label>
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Caricamento metodi di pagamento...</span>
              </div>
            ) : (
              <Select
                value={selectedMetodo}
                onValueChange={setSelectedMetodo}
                disabled={metodiPagamento.length === 0}
              >
                <SelectTrigger id="metodo-pagamento">
                  <SelectValue placeholder="Seleziona un metodo" />
                </SelectTrigger>
                <SelectContent>
                  {metodiPagamento.map((metodo) => (
                    <SelectItem key={metodo.id} value={metodo.id}>
                      {metodo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button onClick={handleConvert} disabled={isLoading || isSubmitting || !selectedMetodo}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Conversione...
              </>
            ) : (
              "Converti"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
