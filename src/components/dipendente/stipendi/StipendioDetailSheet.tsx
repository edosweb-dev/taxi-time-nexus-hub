import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface StipendioDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stipendio: {
    id: string;
    mese: number;
    anno: number;
    stato: 'bozza' | 'confermato' | 'pagato';
    totale_netto: number;
    totale_lordo: number;
    base_calcolo: number;
    coefficiente_applicato: number;
    totale_km: number;
    totale_ore_lavorate: number;
    totale_ore_attesa: number;
    totale_spese: number;
    totale_prelievi: number;
    incassi_da_dipendenti: number;
    riporto_mese_precedente: number;
    note?: string | null;
    created_at: string;
    creator_profile?: {
      first_name: string | null;
      last_name: string | null;
    };
  } | null;
}

export function StipendioDetailSheet({
  open,
  onOpenChange,
  stipendio
}: StipendioDetailSheetProps) {
  const isMobile = useIsMobile();

  if (!stipendio) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatMeseAnno = (mese: number, anno: number) => {
    const date = new Date(anno, mese - 1);
    return format(date, 'MMMM yyyy', { locale: it });
  };

  const getBadgeClasses = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'bg-blue-100 text-blue-800';
      case 'pagato':
        return 'bg-green-100 text-green-800';
      default:
        return '';
    }
  };


  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'confermato':
        return 'CONFERMATO';
      case 'pagato':
        return 'PAGATO';
      default:
        return stato.toUpperCase();
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Badge Stato */}
      <div className="flex justify-center">
        <Badge className={cn("text-lg py-2 px-4", getBadgeClasses(stipendio.stato))}>
          {getStatoLabel(stipendio.stato)}
        </Badge>
      </div>

      {/* Totale Netto */}
      <div className="text-center space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">TOTALE NETTO</h3>
        <p className="text-4xl font-bold text-primary">
          {formatCurrency(stipendio.totale_netto)}
        </p>
      </div>

      <Separator />

      {/* Dettagli Calcolo */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">DETTAGLI CALCOLO</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Totale KM:</span>
            <span className="font-medium">{stipendio.totale_km || 0} km</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ore Lavorate:</span>
            <span className="font-medium">{stipendio.totale_ore_lavorate || 0}h</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ore Attesa:</span>
            <span className="font-medium">{stipendio.totale_ore_attesa || 0}h</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Base Calcolo:</span>
            <span className="font-medium">{formatCurrency(stipendio.base_calcolo || 0)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Coefficiente:</span>
            <span className="font-medium">{stipendio.coefficiente_applicato || 1}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Totale Lordo:</span>
            <span className="font-medium">{formatCurrency(stipendio.totale_lordo || 0)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-red-600">
            <span>- Spese:</span>
            <span className="font-medium">{formatCurrency(stipendio.totale_spese || 0)}</span>
          </div>
          
          <div className="flex justify-between text-red-600">
            <span>- Prelievi:</span>
            <span className="font-medium">{formatCurrency(stipendio.totale_prelievi || 0)}</span>
          </div>
          
          <div className="flex justify-between text-green-600">
            <span>+ Incassi:</span>
            <span className="font-medium">{formatCurrency(stipendio.incassi_da_dipendenti || 0)}</span>
          </div>
          
          <div className="flex justify-between text-green-600">
            <span>+ Riporto:</span>
            <span className="font-medium">{formatCurrency(stipendio.riporto_mese_precedente || 0)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-base font-bold">
          <span>= Totale Netto:</span>
          <span className="text-primary">{formatCurrency(stipendio.totale_netto)}</span>
        </div>
      </div>

      {/* Note */}
      {stipendio.note && (
        <>
          <Separator />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">NOTE</h3>
            <p className="text-sm text-muted-foreground">{stipendio.note}</p>
          </div>
        </>
      )}

      {/* Metadata */}
      <Separator />
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">CREATO DA</h3>
        <p className="text-sm text-muted-foreground">
          {stipendio.creator_profile?.first_name} {stipendio.creator_profile?.last_name}
          {' - '}
          {format(new Date(stipendio.created_at), 'dd/MM/yyyy', { locale: it })}
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Stipendio {formatMeseAnno(stipendio.mese, stipendio.anno)}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Stipendio {formatMeseAnno(stipendio.mese, stipendio.anno)}
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
