
import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash, 
  ArrowUpDown,
  Users 
} from 'lucide-react';
import { Stipendio } from '@/lib/api/stipendi';
import { formatCurrency } from '@/lib/utils';

interface TabellaStipendi {
  stipendi: Stipendio[];
  isLoading: boolean;
  selectedTab: 'tutti' | 'dipendenti' | 'soci';
  onViewDetails: (stipendio: Stipendio) => void;
  onEdit: (stipendio: Stipendio) => void;
  onChangeStatus: (stipendio: Stipendio, newStatus: string) => void;
  onDelete: (stipendio: Stipendio) => void;
}

type SortField = 'nome' | 'km_ore' | 'base_lordo' | 'detrazioni' | 'aggiunte' | 'netto' | 'percentuale';
type SortDirection = 'asc' | 'desc';

export function TabellaStipendi({
  stipendi,
  isLoading,
  selectedTab,
  onViewDetails,
  onEdit,
  onChangeStatus,
  onDelete
}: TabellaStipendi) {
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Calcola totale per percentuali (solo per soci)
  const totaleSoci = useMemo(() => {
    if (selectedTab !== 'soci') return 0;
    return stipendi
      .filter(s => s.tipo_calcolo === 'socio')
      .reduce((sum, s) => sum + (Number(s.totale_netto) || 0), 0);
  }, [stipendi, selectedTab]);

  // Funzione di ordinamento
  const sortedStipendi = useMemo(() => {
    return [...stipendi].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'nome':
          aValue = `${a.user?.first_name || ''} ${a.user?.last_name || ''}`.trim();
          bValue = `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.trim();
          break;
        case 'km_ore':
          aValue = a.tipo_calcolo === 'socio' ? (a.totale_km || 0) : (a.totale_ore_lavorate || 0);
          bValue = b.tipo_calcolo === 'socio' ? (b.totale_km || 0) : (b.totale_ore_lavorate || 0);
          break;
        case 'base_lordo':
          aValue = Number(a.totale_lordo) || 0;
          bValue = Number(b.totale_lordo) || 0;
          break;
        case 'detrazioni':
          aValue = (Number(a.totale_spese) || 0) + (Number(a.totale_prelievi) || 0);
          bValue = (Number(b.totale_spese) || 0) + (Number(b.totale_prelievi) || 0);
          break;
        case 'aggiunte':
          aValue = (Number(a.incassi_da_dipendenti) || 0) + (Number(a.riporto_mese_precedente) || 0);
          bValue = (Number(b.incassi_da_dipendenti) || 0) + (Number(b.riporto_mese_precedente) || 0);
          break;
        case 'netto':
          aValue = Number(a.totale_netto) || 0;
          bValue = Number(b.totale_netto) || 0;
          break;
        case 'percentuale':
          if (totaleSoci > 0) {
            aValue = ((Number(a.totale_netto) || 0) / totaleSoci) * 100;
            bValue = ((Number(b.totale_netto) || 0) / totaleSoci) * 100;
          } else {
            aValue = 0;
            bValue = 0;
          }
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [stipendi, sortField, sortDirection, totaleSoci]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  const getRuoloBadge = (ruolo: string) => {
    return ruolo === 'dipendente' ? (
      <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
        Dipendente
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
        Socio
      </Badge>
    );
  };

  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'bozza':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Bozza</Badge>;
      case 'confermato':
        return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">Confermato</Badge>;
      case 'pagato':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Pagato</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const getStatusOptions = (currentStatus: string) => {
    const options = ['bozza', 'confermato', 'pagato'];
    return options.filter(status => status !== currentStatus);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (sortedStipendi.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nessun stipendio trovato</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Non ci sono stipendi per i filtri selezionati.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('nome')}
                className="h-8 p-0 hover:bg-transparent"
              >
                Nome
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>Ruolo</TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('km_ore')}
                className="h-8 p-0 hover:bg-transparent"
              >
                KM/Ore
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('base_lordo')}
                className="h-8 p-0 hover:bg-transparent"
              >
                Base Lordo
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('detrazioni')}
                className="h-8 p-0 hover:bg-transparent"
              >
                Detrazioni
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('aggiunte')}
                className="h-8 p-0 hover:bg-transparent"
              >
                Aggiunte
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleSort('netto')}
                className="h-8 p-0 hover:bg-transparent"
              >
                Netto
                <ArrowUpDown className="ml-2 h-3 w-3" />
              </Button>
            </TableHead>
            {selectedTab === 'soci' && (
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleSort('percentuale')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  % su Totale
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
            )}
            <TableHead>Stato</TableHead>
            <TableHead className="w-[50px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStipendi.map((stipendio) => {
            const detrazioni = (Number(stipendio.totale_spese) || 0) + (Number(stipendio.totale_prelievi) || 0);
            const aggiunte = (Number(stipendio.incassi_da_dipendenti) || 0) + (Number(stipendio.riporto_mese_precedente) || 0);
            const percentuale = totaleSoci > 0 ? ((Number(stipendio.totale_netto) || 0) / totaleSoci) * 100 : 0;

            return (
              <TableRow key={stipendio.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(stipendio.user?.first_name, stipendio.user?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {stipendio.user?.first_name} {stipendio.user?.last_name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getRuoloBadge(stipendio.tipo_calcolo)}
                </TableCell>
                <TableCell>
                  {stipendio.tipo_calcolo === 'socio' ? (
                    <span>{stipendio.totale_km || 0} km</span>
                  ) : (
                    <span>{stipendio.totale_ore_lavorate || 0} ore</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {formatCurrency(Number(stipendio.totale_lordo) || 0)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-red-600 font-medium">
                    -{formatCurrency(detrazioni)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-green-600 font-medium">
                    +{formatCurrency(aggiunte)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-bold text-lg">
                    {formatCurrency(Number(stipendio.totale_netto) || 0)}
                  </span>
                </TableCell>
                {selectedTab === 'soci' && (
                  <TableCell>
                    <span className="font-medium">
                      {percentuale.toFixed(1)}%
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  {getStatoBadge(stipendio.stato)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(stipendio)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Visualizza dettaglio
                      </DropdownMenuItem>
                      {stipendio.stato === 'bozza' && (
                        <DropdownMenuItem onClick={() => onEdit(stipendio)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifica
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          Cambia stato
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {getStatusOptions(stipendio.stato).map((status) => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={() => onChangeStatus(stipendio, status)}
                            >
                              {status === 'bozza' && 'Bozza'}
                              {status === 'confermato' && 'Confermato'}
                              {status === 'pagato' && 'Pagato'}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      {stipendio.stato === 'bozza' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => onDelete(stipendio)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Elimina
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
