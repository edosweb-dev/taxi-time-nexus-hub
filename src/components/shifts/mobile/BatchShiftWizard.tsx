import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Step components
import { BatchStep1Users } from './batch-steps/BatchStep1Users';
import { BatchStep2Month } from './batch-steps/BatchStep2Month';
import { BatchStep3Period } from './batch-steps/BatchStep3Period';
import { BatchStep4Weekdays } from './batch-steps/BatchStep4Weekdays';
import { BatchStep5TypeConfirm } from './batch-steps/BatchStep5TypeConfirm';

interface BatchShiftWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchShiftWizard({ open, onOpenChange }: BatchShiftWizardProps) {
  const isMobile = useIsMobile();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BatchShiftFormData>>({
    user_ids: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    period_type: 'full_month',
    weekdays: [1, 2, 3, 4, 5], // Lun-Ven default
    shift_type: 'full_day',
    half_day_type: undefined,
    notes: ''
  });

  const updateFormData = (data: Partial<BatchShiftFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    // Validazione step corrente
    const isValid = validateCurrentStep();
    if (!isValid) {
      return;
    }
    
    console.log(`[BatchShiftWizard] Moving to step ${currentStep + 1}`);
    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    console.log(`[BatchShiftWizard] Moving back to step ${currentStep - 1}`);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const validateCurrentStep = (): boolean => {
    console.log(`[BatchShiftWizard] Validating step ${currentStep}`, formData);
    
    switch (currentStep) {
      case 1: // Users
        if (formData.user_ids!.length === 0) {
          toast.error('Seleziona almeno un dipendente');
          return false;
        }
        return true;
      
      case 2: // Month
        if (!formData.month || !formData.year) {
          toast.error('Seleziona mese e anno');
          return false;
        }
        return true;
      
      case 3: // Period
        if (formData.period_type === 'single_week' && !formData.week) {
          toast.error('Seleziona la settimana');
          return false;
        }
        if (formData.period_type === 'multiple_weeks' && (!formData.weeks || formData.weeks.length === 0)) {
          toast.error('Seleziona almeno una settimana');
          return false;
        }
        return true;
      
      case 4: // Weekdays
        if (formData.weekdays!.length === 0) {
          toast.error('Seleziona almeno un giorno');
          return false;
        }
        return true;
      
      case 5: // Type
        if (!formData.shift_type) {
          toast.error('Seleziona tipo turno');
          return false;
        }
        if (formData.shift_type === 'half_day' && !formData.half_day_type) {
          toast.error('Seleziona mattina o pomeriggio');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error('Utente non autenticato');
      return;
    }

    console.log('🚀 [BatchShiftWizard] Submit triggered', formData);
    setIsSubmitting(true);

    try {
      // Genera array di date da inserire
      const dates = generateDates(formData);
      console.log(`📅 [BatchShiftWizard] Generated ${dates.length} dates`, dates);

      // Crea array di shift da inserire
      const shiftsToInsert = [];
      for (const userId of formData.user_ids!) {
        for (const date of dates) {
          shiftsToInsert.push({
            user_id: userId,
            shift_date: date,
            shift_type: formData.shift_type!,
            half_day_type: formData.half_day_type || null,
            notes: formData.notes || null,
            created_by: currentUser.id,
            updated_by: currentUser.id
          });
        }
      }

      console.log(`🔄 [BatchShiftWizard] Inserting ${shiftsToInsert.length} shifts...`);

      const { data: result, error } = await supabase
        .from('shifts')
        .insert(shiftsToInsert)
        .select();

      if (error) throw error;

      console.log('✅ [BatchShiftWizard] Success!', result);
      toast.success(`${shiftsToInsert.length} turni creati con successo!`);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['shifts'] });

      // Reset and close
      setFormData({
        user_ids: [],
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        period_type: 'full_month',
        weekdays: [1, 2, 3, 4, 5],
        shift_type: 'full_day',
        half_day_type: undefined,
        notes: ''
      });
      setCurrentStep(1);
      onOpenChange(false);
    } catch (error: any) {
      console.error('❌ [BatchShiftWizard] Error:', error);
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper per generare date
  const generateDates = (data: Partial<BatchShiftFormData>): string[] => {
    const dates: string[] = [];
    const { month, year, period_type, week, weeks, weekdays } = data;
    
    // Determina range di date
    let startDate: Date;
    let endDate: Date;

    if (period_type === 'full_month') {
      startDate = new Date(year!, month! - 1, 1);
      endDate = new Date(year!, month!, 0); // Ultimo giorno del mese
    } else if (period_type === 'single_week') {
      // Calcola inizio/fine settimana
      const firstDay = new Date(year!, month! - 1, 1);
      const weekStart = new Date(firstDay);
      weekStart.setDate(firstDay.getDate() + (week! - 1) * 7);
      startDate = weekStart;
      endDate = new Date(weekStart);
      endDate.setDate(weekStart.getDate() + 6);
    } else { // multiple_weeks
      // Per ogni settimana in weeks[], genera date
      for (const w of weeks!) {
        const firstDay = new Date(year!, month! - 1, 1);
        const weekStart = new Date(firstDay);
        weekStart.setDate(firstDay.getDate() + (w - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        // Genera date per questa settimana
        for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
          const dayOfWeek = d.getDay();
          if (weekdays!.includes(dayOfWeek)) {
            dates.push(format(new Date(d), 'yyyy-MM-dd'));
          }
        }
      }
      return dates;
    }

    // Genera date per range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (weekdays!.includes(dayOfWeek)) {
        dates.push(format(new Date(d), 'yyyy-MM-dd'));
      }
    }

    return dates;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BatchStep1Users formData={formData} onChange={updateFormData} />;
      case 2:
        return <BatchStep2Month formData={formData} onChange={updateFormData} />;
      case 3:
        return <BatchStep3Period formData={formData} onChange={updateFormData} />;
      case 4:
        return <BatchStep4Weekdays formData={formData} onChange={updateFormData} />;
      case 5:
        return <BatchStep5TypeConfirm 
          formData={formData} 
          onChange={updateFormData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />;
      default:
        return null;
    }
  };

  const content = (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} di 5</span>
          <span>{currentStep * 20}%</span>
        </div>
        <Progress value={currentStep * 20} />
      </div>

      {/* Step Content */}
      <div className="min-h-[300px]">
        {renderStep()}
      </div>

      {/* Navigation (solo step 1-4, step 5 ha submit interno) */}
      {currentStep < 5 && (
        <div className="flex gap-3 pt-4">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Indietro
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            className={currentStep === 1 ? 'w-full' : 'flex-1'}
          >
            Avanti
          </Button>
        </div>
      )}

      {/* Step 5: Submit button */}
      {currentStep === 5 && (
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            className="flex-1"
            disabled={isSubmitting}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creazione...
              </>
            ) : (
              'Crea Turni'
            )}
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Inserimento Massivo Turni</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto max-h-[80vh]">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Inserimento Massivo Turni</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[70vh]">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
}
