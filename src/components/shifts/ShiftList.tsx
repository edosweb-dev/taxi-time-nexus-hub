
import { useState } from 'react';
import { format, parseISO, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  FileText 
} from 'lucide-react';
import { useShifts, Shift } from './ShiftContext';
import { Badge } from '@/components/ui/badge';
import { AddShiftDialog } from './AddShiftDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ShiftListProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftList({ currentMonth, onMonthChange, isAdminOrSocio }: ShiftListProps) {
  const { shifts, isLoading, loadShifts, setSelectedShift } = useShifts();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const getShiftTypeIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'specific_hours':
        return <Clock className="h-4 w-4 text-primary" />;
      case 'full_day':
      case 'half_day':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'sick_leave':
      case 'unavailable':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getShiftTypeBadge = (shift: Shift) => {
    const shiftTypeMap: Record<string, { label: string, variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success'}> = {
      specific_hours: { 
        label: 'Orario specifico', 
        variant: 'default' 
      },
      full_day: { label: 'Giornata intera', variant: 'success' },
      half_day: { 
        label: shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio', 
        variant: 'secondary' 
      },
      sick_leave: { label: 'Malattia', variant: 'destructive' },
      unavailable: { label: 'Non disponibile', variant: 'outline' }
    };
    
    const shiftInfo = shiftTypeMap[shift.shift_type] || { label: shift.shift_type, variant: 'default' };
    
    return (
      <Badge variant={shiftInfo.variant as any}>
        {shiftInfo.label}
      </Badge>
    );
  };

  const getShiftTimeDisplay = (shift: Shift) => {
    switch (shift.shift_type) {
      case 'specific_hours':
        return shift.start_time && shift.end_time 
          ? `${shift.start_time.substring(0, 5)} - ${shift.end_time.substring(0, 5)}` 
          : '';
      case 'full_day':
        return 'Tutto il giorno';
      case 'half_day':
        return shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio';
      case 'sick_leave':
      case 'unavailable':
        const startDate = shift.start_date ? format(parseISO(shift.start_date), 'dd/MM/yyyy') : '';
        const endDate = shift.end_date ? format(parseISO(shift.end_date), 'dd/MM/yyyy') : '';
        return startDate === endDate || !endDate ? startDate : `${startDate} - ${endDate}`;
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento turni...</span>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy', { locale: it })}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onMonthChange(new Date())}
          >
            Oggi
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {shifts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              {isAdminOrSocio && <TableHead>Utente</TableHead>}
              <TableHead>Tipo</TableHead>
              <TableHead>Orario</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-[100px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shifts.sort((a, b) => a.shift_date.localeCompare(b.shift_date)).map((shift) => (
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedShift(shift);
                      setIsAddDialogOpen(true);
                    }}
                  >
                    Dettagli
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Nessun turno trovato per questo mese</p>
          <Button 
            variant="outline"
            className="mt-2" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            Aggiungi turno
          </Button>
        </div>
      )}

      <AddShiftDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
      />
    </div>
  );
}
