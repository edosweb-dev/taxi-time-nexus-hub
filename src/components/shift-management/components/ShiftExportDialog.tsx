import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Download, FileSpreadsheet } from 'lucide-react';
import { useShifts } from '@/components/shifts/ShiftContext';
import { useUsers } from '@/hooks/useUsers';
import { toast } from '@/components/ui/sonner';

interface ShiftExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDate: Date;
}

export function ShiftExportDialog({ open, onOpenChange, currentDate }: ShiftExportDialogProps) {
  const [exportMonth, setExportMonth] = useState<Date>(currentDate);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  
  const { shifts } = useShifts();
  const { users } = useUsers();

  // Filtra solo utenti che possono avere turni
  const workingUsers = users.filter(user => 
    user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente'
  );

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Filtra i turni per il mese selezionato
      const startOfMonth = new Date(exportMonth.getFullYear(), exportMonth.getMonth(), 1);
      const endOfMonth = new Date(exportMonth.getFullYear(), exportMonth.getMonth() + 1, 0);
      
      const filteredShifts = shifts.filter(shift => {
        const shiftDate = new Date(shift.shift_date);
        const inDateRange = shiftDate >= startOfMonth && shiftDate <= endOfMonth;
        const matchesUser = selectedUserId === 'all' || shift.user_id === selectedUserId;
        return inDateRange && matchesUser;
      });

      if (filteredShifts.length === 0) {
        toast.error('Nessun turno trovato per i criteri selezionati');
        return;
      }

      if (exportFormat === 'csv') {
        await exportToCSV(filteredShifts);
      } else {
        await exportToPDF(filteredShifts);
      }
      
      toast.success('Report esportato con successo');
      onOpenChange(false);
    } catch (error) {
      console.error('Error exporting shifts:', error);
      toast.error('Errore durante l\'esportazione del report');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async (shiftsData: any[]) => {
    const csvHeader = 'Data,Utente,Tipo Turno,Ora Inizio,Ora Fine,Note\n';
    const csvRows = shiftsData.map(shift => {
      const user = users.find(u => u.id === shift.user_id);
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utente sconosciuto';
      
      return [
        format(new Date(shift.shift_date), 'dd/MM/yyyy'),
        userName,
        getShiftTypeLabel(shift.shift_type, shift.half_day_type),
        shift.start_time || '',
        shift.end_time || '',
        shift.notes || ''
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `turni_${format(exportMonth, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async (shiftsData: any[]) => {
    // Implementazione base PDF - potresti voler usare jsPDF o react-pdf
    toast.info('Funzionalità PDF in arrivo - usa il formato CSV per ora');
  };

  const getShiftTypeLabel = (type: string, halfDayType?: string) => {
    switch (type) {
      case 'full_day': return 'Giornata intera';
      case 'half_day': return halfDayType === 'morning' ? 'Mezza giornata (mattina)' : 'Mezza giornata (pomeriggio)';
      case 'specific_hours': return 'Orario specifico';
      case 'sick_leave': return 'Malattia';
      case 'unavailable': return 'Non disponibile';
      default: return type;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Esporta Report Turni
          </DialogTitle>
          <DialogDescription>
            Seleziona il mese e l'utente per esportare un report dettagliato dei turni.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selezione mese */}
          <div className="space-y-2">
            <Label>Mese di riferimento</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !exportMonth && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {exportMonth ? format(exportMonth, 'MMMM yyyy', { locale: it }) : 'Seleziona mese'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={exportMonth}
                  onSelect={(date) => date && setExportMonth(date)}
                  locale={it}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Selezione utente */}
          <div className="space-y-2">
            <Label>Utente</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona utente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti gli utenti</SelectItem>
                {workingUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color || '#6B7280' }}
                      />
                      {user.first_name} {user.last_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Formato esportazione */}
          <div className="space-y-2">
            <Label>Formato</Label>
            <Select value={exportFormat} onValueChange={(value: 'csv' | 'pdf') => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Esportazione...' : 'Esporta Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}