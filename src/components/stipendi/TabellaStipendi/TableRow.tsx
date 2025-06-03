
import { TableCell, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Stipendio } from '@/lib/api/stipendi';
import { formatCurrency } from '@/lib/utils';
import { getInitials, getRuoloBadge, getStatoBadge } from './utils';
import { ActionMenu } from './ActionMenu';

interface StipendioTableRowProps {
  stipendio: Stipendio;
  selectedTab: 'tutti' | 'dipendenti' | 'soci';
  totaleSoci: number;
  onViewDetails: (stipendio: Stipendio) => void;
  onEdit: (stipendio: Stipendio) => void;
  onChangeStatus: (stipendio: Stipendio, newStatus: string) => void;
  onDelete: (stipendio: Stipendio) => void;
}

export function StipendioTableRow({
  stipendio,
  selectedTab,
  totaleSoci,
  onViewDetails,
  onEdit,
  onChangeStatus,
  onDelete
}: StipendioTableRowProps) {
  const detrazioni = (Number(stipendio.totale_spese) || 0) + (Number(stipendio.totale_prelievi) || 0);
  const aggiunte = (Number(stipendio.incassi_da_dipendenti) || 0) + (Number(stipendio.riporto_mese_precedente) || 0);
  const percentuale = totaleSoci > 0 ? ((Number(stipendio.totale_netto) || 0) / totaleSoci) * 100 : 0;

  return (
    <TableRow className="hover:bg-muted/50">
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
        <ActionMenu
          stipendio={stipendio}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onChangeStatus={onChangeStatus}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}
