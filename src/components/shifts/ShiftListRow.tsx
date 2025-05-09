
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { FileText, Trash2 } from 'lucide-react';
import { Shift } from './types';
import { getShiftTypeIcon, getShiftTypeBadge, getShiftTimeDisplay } from './utils/shiftDisplayUtils';

interface ShiftListRowProps {
  shift: Shift;
  isAdminOrSocio: boolean;
  onSelectShift: (shift: Shift) => void;
  onDeleteShift?: (id: string) => void;
}

export function ShiftListRow({ 
  shift, 
  isAdminOrSocio, 
  onSelectShift,
  onDeleteShift 
}: ShiftListRowProps) {
  return (
    <TableRow key={shift.id}>
      <TableCell>
        {format(parseISO(shift.shift_date), 'dd/MM/yyyy')}
      </TableCell>
      
      {isAdminOrSocio && (
        <TableCell>
          {shift.user_first_name} {shift.user_last_name}
        </TableCell>
      )}
      
      <TableCell>
        <div className="flex items-center gap-2">
          {getShiftTypeIcon(shift.shift_type)}
          {getShiftTypeBadge(shift)}
        </div>
      </TableCell>
      
      <TableCell>{getShiftTimeDisplay(shift)}</TableCell>
      
      <TableCell>
        {shift.notes ? (
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {shift.notes}
            </span>
          </div>
        ) : null}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectShift(shift)}
          >
            Dettagli
          </Button>
          
          {/* Delete button - only shown for admin/socio users */}
          {isAdminOrSocio && onDeleteShift && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDeleteShift(shift.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
