import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ApprovaSpesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spesa: {
    id: string;
    causale: string;
    importo: number;
    data_spesa: string;
    note?: string;
    user_profile?: {
      first_name: string | null;
      last_name: string | null;
    };
  } | null;
}

export function ApprovaSpesaDialog({ open, onOpenChange, spesa }: ApprovaSpesaDialogProps) {
  const [noteRevisione, setNoteRevisione] = useState('');
  const { updateSpesaStatus, isUpdatingSpesaStatus } = useSpeseDipendenti();
  const { profile } = useAuth();

  // Solo admin/socio possono vedere questo dialog
  if (!profile || (profile.role !== 'admin' && profile.role !== 'socio')) {
    return null;
  }

  if (!spesa) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Data non valida';
    return format(date, 'dd/MM/yyyy', { locale: it });
  };

  const handleAction = (stato: 'approvata' | 'non_autorizzata' | 'in_revisione') => {
    if (stato === 'in_revisione' && !noteRevisione.trim()) {
      return; // Il pulsante è già disabilitato, ma per sicurezza
    }

    updateSpesaStatus({
      id: spesa.id,
      stato,
      note_revisione: stato === 'in_revisione' ? noteRevisione : undefined
    });

    // Chiudi dialog e reset note
    onOpenChange(false);
    setNoteRevisione('');
  };

  const dipendenteName = spesa.user_profile
    ? `${spesa.user_profile.first_name || ''} ${spesa.user_profile.last_name || ''}`.trim()
    : 'N/A';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>✅ Approva Spesa Dipendente</DialogTitle>
          <DialogDescription>
            Dipendente: <span className="font-semibold text-foreground">{dipendenteName}</span> • {formatCurrency(spesa.importo)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Riepilogo Spesa */}
          <div className="grid gap-3 rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">📅 Data</span>
              <span className="font-medium">{formatDate(spesa.data_spesa)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">💰 Importo</span>
              <span className="font-semibold text-lg">{formatCurrency(spesa.importo)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">📝 Causale</span>
              <span className="font-medium">{spesa.causale}</span>
            </div>
            {spesa.note && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">📄 Note Dipendente</span>
                <span className="text-sm italic">{spesa.note}</span>
              </div>
            )}
          </div>

          {/* Textarea Note Revisione */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Note di Revisione (opzionale per "In Revisione")
            </label>
            <Textarea
              placeholder="Es: Manca ricevuta, fornire documentazione..."
              value={noteRevisione}
              onChange={(e) => setNoteRevisione(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleAction('non_autorizzata')}
            disabled={isUpdatingSpesaStatus}
            className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
          >
            ❌ Rifiuta
          </Button>

          <Button
            variant="secondary"
            onClick={() => handleAction('in_revisione')}
            disabled={isUpdatingSpesaStatus || !noteRevisione.trim()}
            className="bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800"
          >
            🔄 In Revisione
          </Button>

          <Button
            onClick={() => handleAction('approvata')}
            disabled={isUpdatingSpesaStatus}
            className="bg-green-600 hover:bg-green-700"
          >
            ✅ Approva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
