import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, X, Edit, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { ModificaSpesaSheet } from './ModificaSpesaSheet';
import { EliminaSpesaDialog } from './EliminaSpesaDialog';
import { useAuth } from '@/contexts/AuthContext';

interface SpesaDetailSheetProps {
  spesa: {
    id: string;
    causale: string;
    importo: number;
    data_spesa: string;
    note?: string | null;
    stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
    user_id: string;
    approved_by_profile?: {
      first_name: string | null;
      last_name: string | null;
    };
    approved_at?: string | null;
    note_revisione?: string | null;
    registered_by_profile?: {
      first_name: string | null;
      last_name: string | null;
    };
    created_at: string;
  } | null;
  open: boolean;
  onClose: () => void;
}

export function SpesaDetailSheet({ spesa, open, onClose }: SpesaDetailSheetProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [modificaOpen, setModificaOpen] = useState(false);
  const [eliminaOpen, setEliminaOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!spesa) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getBadgeClasses = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
      case 'in_revisione':
        return 'bg-yellow-100 text-yellow-800';
      case 'approvata':
        return 'bg-green-100 text-green-800';
      case 'non_autorizzata':
        return 'bg-red-100 text-red-800';
      default:
        return '';
    }
  };

  const getBadgeIcon = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
      case 'in_revisione':
        return '🟡';
      case 'approvata':
        return '✅';
      case 'non_autorizzata':
        return '❌';
      default:
        return '';
    }
  };

  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'in_attesa':
        return 'IN ATTESA';
      case 'in_revisione':
        return 'IN REVISIONE';
      case 'approvata':
        return 'APPROVATA';
      case 'non_autorizzata':
        return 'RIFIUTATA';
      default:
        return stato.toUpperCase();
    }
  };

  const canEdit = spesa.stato === 'in_attesa' && spesa.user_id === user?.id;

  const handleModificaClose = () => {
    setModificaOpen(false);
  };

  const handleEliminaClose = (deleted: boolean) => {
    setEliminaOpen(false);
    if (deleted) {
      onClose();
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">Dettaglio Spesa</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Badge Stato */}
      <Badge className={cn("gap-1 text-sm", getBadgeClasses(spesa.stato))}>
        <span>{getBadgeIcon(spesa.stato)}</span>
        <span>{getStatoLabel(spesa.stato)}</span>
      </Badge>

      {/* Importo Principale */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">💰 TOTALE</p>
        <p className="text-3xl font-bold">{formatCurrency(spesa.importo)}</p>
      </div>

      {/* Informazioni */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-semibold flex items-center gap-2">
          <span>📋</span>
          INFORMAZIONI
        </h3>

        <div className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">📅 Data</p>
            <p className="font-medium">
              {format(parseISO(spesa.data_spesa), 'dd MMMM yyyy', { locale: it })}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground">📝 Causale</p>
            <p className="font-medium">{spesa.causale}</p>
          </div>

          {spesa.note && (
            <div>
              <p className="text-muted-foreground">📄 Note</p>
              <p className="font-medium">{spesa.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Approvazione */}
      {spesa.stato === 'approvata' && spesa.approved_by_profile && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold flex items-center gap-2 text-green-600">
            <span>✅</span>
            APPROVATA
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-muted-foreground">Approvata da</p>
              <p className="font-medium">
                {spesa.approved_by_profile.first_name} {spesa.approved_by_profile.last_name}
              </p>
            </div>
            {spesa.approved_at && (
              <div>
                <p className="text-muted-foreground">Data approvazione</p>
                <p className="font-medium">
                  {format(parseISO(spesa.approved_at), 'dd MMMM yyyy', { locale: it })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Rifiuto */}
      {spesa.stato === 'non_autorizzata' && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="font-semibold flex items-center gap-2 text-red-600">
            <span>❌</span>
            RIFIUTATA
          </h3>
          {spesa.note_revisione && (
            <div className="text-sm">
              <p className="text-muted-foreground">Motivo rifiuto</p>
              <p className="font-medium italic">"{spesa.note_revisione}"</p>
            </div>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-3 pt-4 border-t">
        <h3 className="font-semibold flex items-center gap-2">
          <span>👤</span>
          REGISTRATA DA
        </h3>
        <div className="text-sm">
          {spesa.registered_by_profile ? (
            <p className="font-medium">
              {spesa.registered_by_profile.first_name} {spesa.registered_by_profile.last_name}
            </p>
          ) : (
            <p className="font-medium">Tu</p>
          )}
          <p className="text-muted-foreground">
            {format(parseISO(spesa.created_at), 'dd/MM/yyyy', { locale: it })}
          </p>
        </div>
      </div>

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setModificaOpen(true)}
            className="flex-1 gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifica
          </Button>
          <Button
            variant="destructive"
            onClick={() => setEliminaOpen(true)}
            className="flex-1 gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Elimina
          </Button>
        </div>
      )}

      {/* Modifica Sheet */}
      <ModificaSpesaSheet
        spesa={spesa}
        open={modificaOpen}
        onClose={handleModificaClose}
      />

      {/* Elimina Dialog */}
      <EliminaSpesaDialog
        spesa={spesa}
        open={eliminaOpen}
        onClose={handleEliminaClose}
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] px-4 pb-8 overflow-y-auto">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
}
