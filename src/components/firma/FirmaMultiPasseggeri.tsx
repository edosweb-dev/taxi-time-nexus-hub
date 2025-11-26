import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { FirmaPasseggeroStep } from "./FirmaPasseggeroStep";
import { uploadFirmaPasseggero, getFirmePasseggeri, type PasseggeroFirma } from "@/lib/api/servizi/firmaPasseggero";
import { toast } from "@/components/ui/sonner";

interface FirmaMultiPasseggeriProps {
  servizioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function FirmaMultiPasseggeri({
  servizioId,
  open,
  onOpenChange,
  onComplete,
}: FirmaMultiPasseggeriProps) {
  const [passeggeri, setPasseggeri] = useState<PasseggeroFirma[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carica stato firme all'apertura
  useEffect(() => {
    if (open) {
      loadFirme();
    }
  }, [open, servizioId]);

  const loadFirme = async () => {
    setLoading(true);
    try {
      const firme = await getFirmePasseggeri(servizioId);
      setPasseggeri(firme);
      
      // Trova il primo passeggero non firmato
      const primoNonFirmato = firme.findIndex(p => !p.has_signed);
      setCurrentIndex(primoNonFirmato !== -1 ? primoNonFirmato : 0);
    } catch (error) {
      console.error('Errore caricamento firme:', error);
      toast.error('Errore nel caricare i passeggeri');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFirma = async (signatureData: string) => {
    const currentPasseggero = passeggeri[currentIndex];
    if (!currentPasseggero) return;

    setSaving(true);
    try {
      const result = await uploadFirmaPasseggero(
        currentPasseggero.servizio_passeggero_id,
        signatureData
      );

      if (result.success) {
        toast.success(`Firma di ${currentPasseggero.nome_cognome} salvata con successo`);
        
        // Aggiorna lo stato locale
        const updatedPasseggeri = [...passeggeri];
        updatedPasseggeri[currentIndex] = {
          ...currentPasseggero,
          firma_url: result.url || null,
          firma_timestamp: result.timestamp || null,
          has_signed: true,
        };
        setPasseggeri(updatedPasseggeri);

        // Passa al prossimo passeggero o completa
        const prossimoNonFirmato = updatedPasseggeri.findIndex(
          (p, idx) => idx > currentIndex && !p.has_signed
        );

        if (prossimoNonFirmato !== -1) {
          setCurrentIndex(prossimoNonFirmato);
        } else {
          // Tutte le firme raccolte
          const tuttiFirmati = updatedPasseggeri.every(p => p.has_signed);
          if (tuttiFirmati) {
            toast.success('Tutte le firme sono state raccolte con successo!');
            onComplete();
            onOpenChange(false);
          }
        }
      } else {
        toast.error(result.error || 'Errore nel salvare la firma');
      }
    } catch (error) {
      console.error('Errore salvataggio firma:', error);
      toast.error('Errore nel salvare la firma');
    } finally {
      setSaving(false);
    }
  };

  const firmatiFin = passeggeri.filter(p => p.has_signed).length;
  const progressPercentage = passeggeri.length > 0 ? (firmatiFin / passeggeri.length) * 100 : 0;
  const currentPasseggero = passeggeri[currentIndex];

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Raccolta firme passeggeri</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progresso</span>
              <span className="text-muted-foreground">
                {firmatiFin} di {passeggeri.length} firme
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Lista passeggeri */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Stato passeggeri</h3>
            <div className="space-y-1">
              {passeggeri.map((passeggero, index) => (
                <div
                  key={passeggero.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    index === currentIndex
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  {passeggero.has_signed ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{passeggero.nome_cognome}</div>
                    {passeggero.has_signed && passeggero.firma_timestamp && (
                      <div className="text-xs text-muted-foreground">
                        Firmato il {new Date(passeggero.firma_timestamp).toLocaleString('it-IT')}
                      </div>
                    )}
                  </div>
                  {index === currentIndex && !passeggero.has_signed && (
                    <span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                      In corso
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step firma corrente */}
          {currentPasseggero && !currentPasseggero.has_signed && (
            <FirmaPasseggeroStep
              passeggeroNome={currentPasseggero.nome_cognome}
              passeggeroIndex={currentIndex}
              totalPasseggeri={passeggeri.length}
              onSave={handleSaveFirma}
              isLast={currentIndex === passeggeri.length - 1}
            />
          )}

          {/* Azioni */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Annulla
            </Button>
            {firmatiFin === passeggeri.length && (
              <Button
                type="button"
                onClick={() => {
                  onComplete();
                  onOpenChange(false);
                }}
              >
                Completa
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
