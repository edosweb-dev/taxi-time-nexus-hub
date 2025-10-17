import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Eye, Euro } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePagamentiStipendi, PagamentoStipendio } from '@/hooks/usePagamentiStipendi';
import { formatCurrency } from '@/lib/utils';
import { getInitials } from '@/components/stipendi/TabellaStipendi/utils';

interface PagamentiStipendiTableProps {
  filtri?: {
    anno?: number;
    mese?: number;
    dipendenteId?: string;
    stato?: 'pagato' | 'annullato';
  };
  onViewDetails?: (pagamento: PagamentoStipendio) => void;
}

interface ViewProps {
  pagamenti: PagamentoStipendio[];
  onViewDetails?: (pagamento: PagamentoStipendio) => void;
}

// Formatta mese/anno in italiano
const formatMeseAnno = (mese: number, anno: number): string => {
  const date = new Date(anno, mese - 1, 1);
  return format(date, 'MMMM yyyy', { locale: it });
};

// Formatta data in formato italiano
const formatData = (dateString: string): string => {
  return format(new Date(dateString), 'dd/MM/yyyy');
};

// Badge per stato pagamento
const getStatoPagamentoBadge = (stato: 'pagato' | 'annullato') => {
  return stato === 'pagato' ? (
    <Badge variant="success">
      Pagato
    </Badge>
  ) : (
    <Badge variant="destructive">
      Annullato
    </Badge>
  );
};

function LoadingState() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 border rounded-lg">
      <Euro className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Nessun pagamento trovato</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Non ci sono pagamenti per i filtri selezionati.
      </p>
    </div>
  );
}

function DesktopView({ pagamenti, onViewDetails }: ViewProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Dipendente</TableHead>
            <TableHead>Periodo</TableHead>
            <TableHead className="text-right">Importo</TableHead>
            <TableHead>Data Pagamento</TableHead>
            <TableHead>Modalità</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pagamenti.map((pagamento) => (
            <TableRow key={pagamento.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar 
                    className="h-8 w-8" 
                    style={{ backgroundColor: pagamento.profiles?.color || '#6366f1' }}
                  >
                    <AvatarFallback className="text-white text-xs">
                      {getInitials(
                        pagamento.profiles?.first_name, 
                        pagamento.profiles?.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">
                    {pagamento.profiles?.first_name} {pagamento.profiles?.last_name}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {formatMeseAnno(pagamento.mese, pagamento.anno)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(pagamento.importo)}
              </TableCell>
              <TableCell>
                {formatData(pagamento.data_pagamento)}
              </TableCell>
              <TableCell>
                {pagamento.modalita_pagamenti?.nome || 'N/A'}
              </TableCell>
              <TableCell>
                {getStatoPagamentoBadge(pagamento.stato)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(pagamento)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Dettagli
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function MobileView({ pagamenti, onViewDetails }: ViewProps) {
  return (
    <div className="space-y-3">
      {pagamenti.map((pagamento) => (
        <Card key={pagamento.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar 
                  className="h-10 w-10"
                  style={{ backgroundColor: pagamento.profiles?.color || '#6366f1' }}
                >
                  <AvatarFallback className="text-white">
                    {getInitials(
                      pagamento.profiles?.first_name,
                      pagamento.profiles?.last_name
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {pagamento.profiles?.first_name} {pagamento.profiles?.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatMeseAnno(pagamento.mese, pagamento.anno)}
                  </div>
                </div>
              </div>
              {getStatoPagamentoBadge(pagamento.stato)}
            </div>
          </CardHeader>
          
          <CardContent className="pb-3 space-y-2">
            <div className="flex items-center gap-2">
              <Euro className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {formatCurrency(pagamento.importo)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Data:</span>
                <div className="font-medium">
                  {formatData(pagamento.data_pagamento)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Modalità:</span>
                <div className="font-medium">
                  {pagamento.modalita_pagamenti?.nome || 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onViewDetails?.(pagamento)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Visualizza Dettagli
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export function PagamentiStipendiTable({ 
  filtri, 
  onViewDetails 
}: PagamentiStipendiTableProps) {
  const isMobile = useIsMobile();
  const { data: pagamenti, isLoading } = usePagamentiStipendi(filtri);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!pagamenti || pagamenti.length === 0) {
    return <EmptyState />;
  }

  return isMobile ? (
    <MobileView pagamenti={pagamenti} onViewDetails={onViewDetails} />
  ) : (
    <DesktopView pagamenti={pagamenti} onViewDetails={onViewDetails} />
  );
}
