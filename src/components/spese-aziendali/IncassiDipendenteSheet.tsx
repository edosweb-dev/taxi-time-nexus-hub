
import React, { useState, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Users, Euro } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface IncassiDipendenteSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IncassiDipendenteSheet({ open, onOpenChange }: IncassiDipendenteSheetProps) {
  const [selectedSpese, setSelectedSpese] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const { speseConvertibili, isLoadingSpeseConvertibili } = useSpeseDipendenti();
  const { convertiSpeseDipendenti } = useSpeseAziendali();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
  };

  const totalSelected = useMemo(() => {
    return speseConvertibili
      .filter(spesa => selectedSpese.includes(spesa.id))
      .reduce((sum, spesa) => sum + Number(spesa.importo), 0);
  }, [speseConvertibili, selectedSpese]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSpese(speseConvertibili.map(spesa => spesa.id));
    } else {
      setSelectedSpese([]);
    }
  };

  const handleSelectSpesa = (spesaId: string, checked: boolean) => {
    if (checked) {
      setSelectedSpese(prev => [...prev, spesaId]);
    } else {
      setSelectedSpese(prev => prev.filter(id => id !== spesaId));
    }
  };

  const handleConvert = () => {
    setShowConfirmDialog(true);
  };

  const confirmConvert = async () => {
    try {
      await convertiSpeseDipendenti.mutateAsync(selectedSpese);
      setSelectedSpese([]);
      setShowConfirmDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Errore durante la conversione:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedSpese([]);
    }
    onOpenChange(newOpen);
  };

  const isAllSelected = selectedSpese.length === speseConvertibili.length && speseConvertibili.length > 0;

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Converti Spese Dipendenti in Incassi
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Seleziona le spese approvate da convertire in incassi aziendali
            </p>
          </SheetHeader>

          <div className="flex-1 mt-6">
            {isLoadingSpeseConvertibili ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Skeleton className="h-4 w-4" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            ) : speseConvertibili.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nessuna spesa da convertire</h3>
                <p className="text-muted-foreground">
                  Tutte le spese approvate sono già state convertite
                </p>
              </div>
            ) : (
              <>
                {/* Header con selezione globale */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="font-medium">Seleziona tutto</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSpese.length} di {speseConvertibili.length} spese selezionate
                  </div>
                </div>

                {/* Lista spese */}
                <div className="space-y-3">
                  {speseConvertibili.map((spesa) => (
                    <div
                      key={spesa.id}
                      className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors hover:bg-gray-50 ${
                        selectedSpese.includes(spesa.id) ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <Checkbox
                        checked={selectedSpese.includes(spesa.id)}
                        onCheckedChange={(checked) => handleSelectSpesa(spesa.id, checked as boolean)}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            {formatDate(spesa.data_spesa)}
                          </span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Approvata
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {spesa.user_profile?.first_name || ''} {spesa.user_profile?.last_name || ''}
                          </span>
                        </div>
                        
                        <p className="text-sm truncate" title={spesa.causale}>
                          {spesa.causale}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(Number(spesa.importo))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer sticky */}
          {speseConvertibili.length > 0 && (
            <div className="border-t pt-4 mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Totale selezionato:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(totalSelected)}
                </span>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleConvert}
                  disabled={selectedSpese.length === 0 || convertiSpeseDipendenti.isPending}
                  className="flex-1"
                >
                  {convertiSpeseDipendenti.isPending ? 'Conversione...' : 'Converti in Incassi'}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog di conferma */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma conversione</AlertDialogTitle>
            <AlertDialogDescription>
              Confermi la conversione di {selectedSpese.length} spese per un totale di{' '}
              <span className="font-bold">{formatCurrency(totalSelected)}</span>?
              <br />
              <br />
              Questa operazione creerà nuovi movimenti di incasso aziendali e non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmConvert}
              disabled={convertiSpeseDipendenti.isPending}
            >
              {convertiSpeseDipendenti.isPending ? 'Conversione...' : 'Conferma'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
