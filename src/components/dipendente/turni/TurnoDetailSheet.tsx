import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ArrowLeft, X, Edit, Trash2 } from 'lucide-react';
import { Shift } from '@/lib/utils/turniHelpers';
import { getTurnoBadge, formatItalianDate, getShiftDuration } from '@/lib/utils/turniHelpers';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface TurnoDetailSheetProps {
  turno: Shift | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (turno: Shift) => void;
  onDelete?: (turno: Shift) => void;
}

export function TurnoDetailSheet({
  turno,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: TurnoDetailSheetProps) {
  const { profile } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!turno) return null;

  const badge = getTurnoBadge(turno);
  const duration = getShiftDuration(turno);
  const shiftDate = new Date(turno.shift_date);
  const canEdit = profile?.id === turno.created_by;

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">
            Turno del {format(shiftDate, 'd MMMM', { locale: it })}
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Badge tipo turno */}
      <Badge className={`${badge.className} text-base px-4 py-1.5`}>
        {badge.emoji} {badge.label}
      </Badge>

      {/* Dettagli */}
      <Card className="p-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data:</span>
            <span className="font-medium capitalize">
              {formatItalianDate(shiftDate)}
            </span>
          </div>

          {turno.start_time && turno.end_time && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Orario:</span>
              <span className="font-medium">
                {turno.start_time.slice(0, 5)} - {turno.end_time.slice(0, 5)}
              </span>
            </div>
          )}

          {duration > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Durata:</span>
              <span className="font-medium">{duration} ore</span>
            </div>
          )}
        </div>
      </Card>

      {/* Note */}
      {turno.notes && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-2">NOTE</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {turno.notes}
          </p>
        </Card>
      )}

      {/* Creato da */}
      {turno.created_by && (
        <Card className="p-4">
          <h3 className="font-semibold text-sm mb-2">CREATO DA</h3>
          <p className="text-sm text-muted-foreground">
            {canEdit ? 'Me' : 'Amministratore'}
            {turno.created_at && (
              <span className="block text-xs mt-1">
                {format(new Date(turno.created_at), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}
              </span>
            )}
          </p>
        </Card>
      )}

      {/* Actions */}
      {canEdit && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit?.(turno)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete?.(turno)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      )}

      {!canEdit && (
        <p className="text-xs text-muted-foreground text-center italic">
          Questo turno è stato creato dall'amministratore e non può essere modificato
        </p>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] px-4 pb-8">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {content}
      </DialogContent>
    </Dialog>
  );
}
