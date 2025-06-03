
import React, { useState, useMemo } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Stipendio } from '@/lib/api/stipendi';
import { LoadingState } from './TabellaStipendi/LoadingState';
import { EmptyState } from './TabellaStipendi/EmptyState';
import { TableHeaderSection } from './TabellaStipendi/TableHeader';
import { StipendioTableRow } from './TabellaStipendi/TableRow';
import { SortField, SortDirection } from './TabellaStipendi/utils';

interface TabellaStipendi {
  stipendi: Stipendio[];
  isLoading: boolean;
  selectedTab: 'tutti' | 'dipendenti' | 'soci';
  onViewDetails: (stipendio: Stipendio) => void;
  onEdit: (stipendio: Stipendio) => void;
  onChangeStatus: (stipendio: Stipendio, newStatus: string) => void;
  onDelete: (stipendio: Stipendio) => void;
}

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

  // Loading skeleton
  if (isLoading) {
    return <LoadingState />;
  }

  // Empty state
  if (sortedStipendi.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeaderSection
          selectedTab={selectedTab}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <TableBody>
          {sortedStipendi.map((stipendio) => (
            <StipendioTableRow
              key={stipendio.id}
              stipendio={stipendio}
              selectedTab={selectedTab}
              totaleSoci={totaleSoci}
              onViewDetails={onViewDetails}
              onEdit={onEdit}
              onChangeStatus={onChangeStatus}
              onDelete={onDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
