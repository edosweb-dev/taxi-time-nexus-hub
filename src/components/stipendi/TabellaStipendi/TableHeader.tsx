
import {
  TableHead,
  TableHeader as TableHeaderComponent,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { SortField, SortDirection } from './utils';

interface TableHeaderProps {
  selectedTab: 'tutti' | 'dipendenti' | 'soci';
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}

export function TableHeaderSection({ selectedTab, sortField, sortDirection, onSort }: TableHeaderProps) {
  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => onSort(field)}
      className="h-8 p-0 hover:bg-transparent"
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  return (
    <TableHeaderComponent>
      <TableRow>
        <TableHead>
          <SortButton field="nome">Nome</SortButton>
        </TableHead>
        <TableHead>Ruolo</TableHead>
        <TableHead>
          <SortButton field="km_ore">KM/Ore</SortButton>
        </TableHead>
        <TableHead>
          <SortButton field="base_lordo">Base Lordo</SortButton>
        </TableHead>
        <TableHead>
          <SortButton field="detrazioni">Detrazioni</SortButton>
        </TableHead>
        <TableHead>
          <SortButton field="aggiunte">Aggiunte</SortButton>
        </TableHead>
        <TableHead>
          <SortButton field="netto">Netto</SortButton>
        </TableHead>
        {selectedTab === 'soci' && (
          <TableHead>
            <SortButton field="percentuale">% su Totale</SortButton>
          </TableHead>
        )}
        <TableHead>Stato</TableHead>
        <TableHead className="w-[50px]">Azioni</TableHead>
      </TableRow>
    </TableHeaderComponent>
  );
}
