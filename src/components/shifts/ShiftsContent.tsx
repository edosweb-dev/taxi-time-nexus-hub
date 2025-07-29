import { useState } from 'react';
import { ShiftGridView } from './grid/ShiftGridView';
import { BatchShiftForm } from './BatchShiftForm';
import { UserFilterDropdown } from './filters/UserFilterDropdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, ChevronLeft, ChevronRight, Copy, Download, Undo, Redo, Calendar } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

interface ShiftsContentProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftsContent({
  currentMonth,
  onMonthChange,
  isAdminOrSocio
}: ShiftsContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const handlePreviousMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  const handleUsersChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  return (
    <div className="space-y-6">
      {/* Batch Shift Form */}
      {isDialogOpen && (
        <BatchShiftForm 
          currentMonth={currentMonth}
          onClose={() => setIsDialogOpen(false)}
        />
      )}

      {/* Main Grid Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Integrated Toolbar */}
          <div className="border-b bg-muted/20 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Month Navigation */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="min-w-[180px] text-center">
                    <h2 className="text-base font-semibold text-primary">
                      {format(currentMonth, 'MMMM yyyy', { locale: it })}
                    </h2>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Oggi
                </Button>
              </div>

              {/* Actions and Filters */}
              <div className="flex items-center gap-2">
                <UserFilterDropdown 
                  onSelectUsers={handleUsersChange}
                  selectedUserIds={selectedUserIds}
                />
                
                <Separator orientation="vertical" className="h-6" />
                
                {isAdminOrSocio && (
                  <>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" />
                      Copia
                    </Button>
                    
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Esporta
                    </Button>
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    <Button variant="outline" size="sm" title="Annulla">
                      <Undo className="h-4 w-4" />
                    </Button>
                    
                    <Button variant="outline" size="sm" title="Ripeti">
                      <Redo className="h-4 w-4" />
                    </Button>
                    
                    <Button size="sm" onClick={() => setIsDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Inserisci turni
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Grid View */}
          <ShiftGridView 
            currentMonth={currentMonth}
            selectedUserIds={selectedUserIds}
          />
        </CardContent>
      </Card>

    </div>
  );
}