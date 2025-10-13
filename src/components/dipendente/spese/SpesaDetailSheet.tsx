import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { ModificaSpesaSheet } from './ModificaSpesaSheet';
import { EliminaSpesaDialog } from './EliminaSpesaDialog';
import { useAuth } from '@/contexts/AuthContext';
import { SpesaStatusBadge } from '@/components/spese/SpesaStatusBadge';

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

  const canEdit = spesa.stato === 'in_attesa' && spesa.user_id === user?.id;

  const handleEdit = () => {
    setModificaOpen(true);
  };

  const handleDelete = () => {
    setEliminaOpen(true);
  };

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
    <>
      <SheetHeader>
        <SheetTitle>Spesa #{spesa.id.slice(0, 8)}</SheetTitle>
      </SheetHeader>

      <div className="space-y-4 mt-4">
        <SpesaStatusBadge stato={spesa.stato} />

        <Card>
          <CardHeader className="font-semibold">Dettagli</CardHeader>
          <CardContent className="space-y-2">
            <div>Importo: €{spesa.importo.toFixed(2)}</div>
            <div>Data: {format(parseISO(spesa.data_spesa), 'dd MMMM yyyy', { locale: it })}</div>
            <div>Causale: {spesa.causale}</div>
            {spesa.note && <div>Note: {spesa.note}</div>}
          </CardContent>
        </Card>

        {spesa.stato === 'in_attesa' && canEdit && (
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="flex-1">✏️ Modifica</Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">🗑️ Elimina</Button>
          </div>
        )}

        {spesa.stato === 'approvata' && spesa.approved_by_profile && spesa.approved_at && (
          <Alert>
            <AlertDescription>
              ✅ Approvata da {spesa.approved_by_profile.first_name}{' '}
              il {format(parseISO(spesa.approved_at), 'dd/MM/yyyy HH:mm')}
            </AlertDescription>
          </Alert>
        )}

        {spesa.stato === 'non_autorizzata' && (
          <Alert variant="destructive">
            <AlertDescription>
              ❌ Rifiutata{spesa.approved_by_profile && ` da ${spesa.approved_by_profile.first_name}`}
              {spesa.note_revisione && (
                <>
                  <br />
                  Motivo: {spesa.note_revisione}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <ModificaSpesaSheet
        spesa={spesa}
        open={modificaOpen}
        onClose={handleModificaClose}
      />

      <EliminaSpesaDialog
        spesa={spesa}
        open={eliminaOpen}
        onClose={handleEliminaClose}
      />
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          {content}
        </SheetContent>
      </Sheet>
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
