import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import { batchShiftSchema, type BatchShiftFormData } from '@/lib/schemas/shifts';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';

// Step components (creeremo dopo)
// import { BatchStep1Users } from './batch-steps/BatchStep1Users';
// import { BatchStep2Month } from './batch-steps/BatchStep2Month';
// import { BatchStep3Period } from './batch-steps/BatchStep3Period';
// import { BatchStep4Weekdays } from './batch-steps/BatchStep4Weekdays';
// import { BatchStep5TypeConfirm } from './batch-steps/BatchStep5TypeConfirm';

interface BatchShiftWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BatchShiftWizard({
  open,
  onOpenChange
}: BatchShiftWizardProps) {
  const isMobile = useIsMobile();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BatchShiftFormData>({
    resolver: zodResolver(batchShiftSchema),
    defaultValues: {
      user_ids: [],
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      period_type: 'full_month',
      week: undefined,
      weeks: undefined,
      weekdays: [1, 2, 3, 4, 5], // Lun-Ven default
      shift_type: 'full_day',
      half_day_type: undefined,
      notes: ''
    }
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Validazione per step specifico
  const validateCurrentStep = async (): Promise<boolean> => {
    console.log(`[BatchWizard] Validating step ${currentStep}`);
    
    const values = form.getValues();
    
    switch (currentStep) {
      case 1: // Users
        if (values.user_ids.length === 0) {
          toast.error('Seleziona almeno un dipendente');
          return false;
        }
        break;
      
      case 2: // Month
        if (!values.month || !values.year) {
          toast.error('Seleziona mese e anno');
          return false;
        }
        break;
      
      case 3: // Period
        if (values.period_type === 'single_week' && !values.week) {
          toast.error('Seleziona la settimana');
          return false;
        }
        if (values.period_type === 'multiple_weeks' && (!values.weeks || values.weeks.length === 0)) {
          toast.error('Seleziona almeno una settimana');
          return false;
        }
        break;
      
      case 4: // Weekdays
        if (values.weekdays.length === 0) {
          toast.error('Seleziona almeno un giorno della settimana');
          return false;
        }
        break;
      
      case 5: // Type & Confirm
        if (!values.shift_type) {
          toast.error('Seleziona un tipo di turno');
          return false;
        }
        if (values.shift_type === 'half_day' && !values.half_day_type) {
          toast.error('Seleziona Mattina o Pomeriggio');
          return false;
        }
        break;
    }
    
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    
    console.log(`[BatchWizard] Moving to step ${currentStep + 1}`);
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    console.log(`[BatchWizard] Moving back to step ${currentStep - 1}`);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: BatchShiftFormData) => {
    if (!currentUser) {
      toast.error('Devi essere autenticato');
      return;
    }

    console.log('🚀 [BatchWizard] Submit triggered!', data);
    setIsSubmitting(true);

    try {
      // TODO: Implementare logica generazione turni batch
      // Per ora placeholder
      
      // 1. Calcola le date da generare in base a:
      //    - month/year
      //    - period_type + week/weeks
      //    - weekdays
      
      // 2. Per ogni user_id + data combinazione:
      //    - Crea shift record
      
      // 3. Batch insert
      
      console.log('🔄 [BatchWizard] Generating shifts...');
      
      // Placeholder: simula success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('✅ [BatchWizard] Batch creation successful!');
      
      toast.success('Turni creati con successo!');
      
      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      
      // Reset e chiudi
      form.reset();
      setCurrentStep(1);
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ [BatchWizard] Error:', error);
      toast.error(`Errore: ${error.message || 'Impossibile creare i turni'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    // TODO: Renderizzare step components
    // Per ora placeholder
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Step {currentStep} component</p>
        <p className="text-sm mt-2">
          (Step components in via di sviluppo)
        </p>
      </div>
    );

    // switch (currentStep) {
    //   case 1:
    //     return <BatchStep1Users form={form} />;
    //   case 2:
    //     return <BatchStep2Month form={form} />;
    //   case 3:
    //     return <BatchStep3Period form={form} />;
    //   case 4:
    //     return <BatchStep4Weekdays form={form} />;
    //   case 5:
    //     return <BatchStep5TypeConfirm form={form} />;
    //   default:
    //     return null;
    // }
  };

  const wizardContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Step {currentStep} di {totalSteps}</span>
            <span className="text-muted-foreground">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Indietro
            </Button>
          )}
          
          <div className="flex-1" />
          
          {currentStep < totalSteps ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Avanti
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creazione...
                </>
              ) : (
                'Crea Turni'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );

  // Mobile: Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Inserimento Massivo</DrawerTitle>
            <DrawerDescription>
              Crea turni per più dipendenti in un periodo
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {wizardContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Inserimento Massivo</DialogTitle>
          <DialogDescription>
            Crea turni per più dipendenti in un periodo
          </DialogDescription>
        </DialogHeader>
        {wizardContent}
      </DialogContent>
    </Dialog>
  );
}
