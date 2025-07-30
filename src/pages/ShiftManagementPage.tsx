import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Users } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { useUsers } from '@/hooks/useUsers';
import { ShiftCalendar } from '@/components/shifts/ShiftCalendar';
import { ShiftDialog } from '@/components/shifts/ShiftDialog';
import { BatchShiftForm } from '@/components/shifts/BatchShiftForm';
import { Shift, CreateShiftData, UpdateShiftData } from '@/types/shifts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';

export default function ShiftManagementPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>();

  const { shifts, loading, fetchShifts, createShift, updateShift, deleteShift, createBatchShifts } = useShifts();
  const { users, isLoading: usersLoading } = useUsers();

  // Filter only employees (admin, socio, dipendente)
  const employees = users.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role));

  useEffect(() => {
    const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    fetchShifts({ start_date: startDate, end_date: endDate });
  }, [currentDate, fetchShifts]);

  const handleCreateShift = (date?: Date) => {
    setDefaultDate(date);
    setSelectedShift(null);
    setShowShiftDialog(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setShowShiftDialog(true);
  };

  const handleShiftSubmit = async (data: CreateShiftData | UpdateShiftData) => {
    try {
      if ('id' in data) {
        await updateShift(data);
      } else {
        await createShift(data);
      }
      setShowShiftDialog(false);
      setSelectedShift(null);
      setDefaultDate(undefined);
    } catch (error) {
      console.error('Error saving shift:', error);
    }
  };

  const handleBatchSubmit = async (shiftsData: CreateShiftData[]) => {
    try {
      await createBatchShifts(shiftsData);
      setShowBatchDialog(false);
    } catch (error) {
      console.error('Error creating batch shifts:', error);
    }
  };

  if (usersLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestione Turni</h1>
            <p className="text-muted-foreground">
              Gestisci i turni di lavoro dei dipendenti
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleCreateShift()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo turno
            </Button>
            <Dialog open={showBatchDialog} onOpenChange={setShowBatchDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Turni multipli
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Crea turni multipli</DialogTitle>
                </DialogHeader>
                <BatchShiftForm
                  onSubmit={handleBatchSubmit}
                  users={employees}
                  loading={loading}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="calendar" className="w-full">
          <TabsList>
            <TabsTrigger value="calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="list">
              <Users className="h-4 w-4 mr-2" />
              Lista turni
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            <ShiftCalendar
              shifts={shifts}
              users={employees}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onCreateShift={handleCreateShift}
              onEditShift={handleEditShift}
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista turni</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Caricamento turni...</p>
                  </div>
                ) : shifts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nessun turno trovato per questo periodo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {shifts.map(shift => {
                      const user = employees.find(u => u.id === shift.user_id);
                      return (
                        <div
                          key={shift.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleEditShift(shift)}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: user?.color || '#3B82F6' }}
                            />
                            <div>
                              <p className="font-medium">
                                {user?.first_name} {user?.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(shift.shift_date), 'dd/MM/yyyy')} - {shift.shift_type}
                                {shift.start_time && shift.end_time && (
                                  <span> ({shift.start_time} - {shift.end_time})</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <ShiftDialog
          open={showShiftDialog}
          onOpenChange={setShowShiftDialog}
          onSubmit={handleShiftSubmit}
          users={employees}
          shift={selectedShift}
          defaultDate={defaultDate}
          loading={loading}
        />
      </div>
    </MainLayout>
  );
}