import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { shiftFormSchema, type ShiftFormValues } from '../dialogs/ShiftFormSchema';
import { ShiftFormData } from '../types';
import { Step1UserAndDate } from './steps/Step1UserAndDate';
import { Step2ShiftType } from './steps/Step2ShiftType';
import { Step3Times } from './steps/Step3Times';
import { Step4Notes } from './steps/Step4Notes';

interface MobileStepShiftFormProps {
  onSubmit: (data: ShiftFormData) => Promise<void>;
  onCancel: () => void;
  isAdminOrSocio: boolean;
  defaultDate?: Date | null;
  defaultUserId?: string | null;
  selectedShift?: any;
}

// Helper function to determine which steps are required based on shift type
const getRequiredSteps = (shiftType: string) => {
  const steps = [
    { id: 1, title: "Utente e Data", description: "Chi e quando" },
    { id: 2, title: "Tipo Turno", description: "Modalità di lavoro" },
    { id: 3, title: "Note", description: "Informazioni extra" }
  ];
  
  return steps;
};

interface User {
  id: string; 
  first_name: string | null; 
  last_name: string | null;
}

export function MobileStepShiftForm({ 
  onSubmit, 
  onCancel, 
  isAdminOrSocio,
  defaultDate,
  defaultUserId,
  selectedShift
}: MobileStepShiftFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const isEditing = !!selectedShift;

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      user_id: defaultUserId || user?.id || '',
      shift_date: defaultDate || new Date(),
      shift_type: 'full_day',
      start_time: null,
      end_time: null,
      half_day_type: null,
      start_date: null,
      end_date: null,
      notes: ''
    }
  });

  const { watch, trigger, setValue } = form;
  const watchedValues = watch();
  const shiftType = watch('shift_type');
  
  // Calculate required steps dynamically based on shift type
  const requiredSteps = getRequiredSteps(shiftType);
  const totalSteps = requiredSteps.length;

  // Fetch users if admin or socio
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (isAdminOrSocio) {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, role')
            .in('role', ['admin', 'socio', 'dipendente'])
            .order('first_name');

          if (error) throw error;
          setUsers(data || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Errore nel caricamento degli utenti');
      }
    };

    fetchUsers();
  }, [isAdminOrSocio]);

  // Set form values when selected shift changes
  useEffect(() => {
    if (selectedShift) {
      form.reset({
        user_id: selectedShift.user_id,
        shift_date: new Date(selectedShift.shift_date),
        shift_type: selectedShift.shift_type,
        start_time: selectedShift.start_time || undefined,
        end_time: selectedShift.end_time || undefined,
        half_day_type: selectedShift.half_day_type,
        start_date: selectedShift.start_date ? new Date(selectedShift.start_date) : null,
        end_date: selectedShift.end_date ? new Date(selectedShift.end_date) : null,
        notes: selectedShift.notes || ''
      });
    }
  }, [selectedShift, form]);

  // Handle shift type change
  useEffect(() => {
    if (shiftType !== 'half_day') {
      setValue('half_day_type', null);
    }
  }, [shiftType, setValue]);

  const validateCurrentStep = async () => {
    const currentStepConfig = requiredSteps[currentStep - 1];
    
    switch (currentStepConfig.id) {
      case 1:
        const step1Fields = isAdminOrSocio ? ['user_id', 'shift_date'] : ['shift_date'];
        return await trigger(step1Fields as any);
      case 2:
        const step2Fields = ['shift_type'];
        if (watchedValues.shift_type === 'half_day') {
          step2Fields.push('half_day_type');
        }
        return await trigger(step2Fields as any);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      const currentStepConfig = requiredSteps[currentStep - 1];
      
      // Show specific validation errors based on step ID
      switch (currentStepConfig.id) {
        case 1:
          if (isAdminOrSocio && !watchedValues.user_id) {
            toast.error('Seleziona un utente');
          } else if (!watchedValues.shift_date) {
            toast.error('Seleziona una data');
          }
          break;
        case 2:
          if (watchedValues.shift_type === 'half_day' && !watchedValues.half_day_type) {
            toast.error('Seleziona mattina o pomeriggio');
          }
          break;
        case 3:
          // Note step - no specific validation
          break;
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: ShiftFormValues) => {
    console.log('🚀 [MobileStepShiftForm] Submit triggered!', { currentStep, totalSteps, data });
    
    // Validate entire form before submitting
    const isValid = await form.trigger();
    if (!isValid) {
      console.log('❌ [MobileStepShiftForm] Form validation failed');
      toast.error('Completa tutti i campi obbligatori');
      return;
    }

    // Additional validation
    if (data.shift_type === 'half_day' && !data.half_day_type) {
      console.log('❌ [MobileStepShiftForm] Half day type validation failed');
      toast.error('Seleziona mattina o pomeriggio');
      return;
    }

    try {
      setIsLoading(true);
      
      const formData: ShiftFormData = {
        user_id: data.user_id,
        shift_date: data.shift_date,
        shift_type: data.shift_type,
        start_time: null,
        end_time: null,
        half_day_type: data.shift_type === 'half_day' ? data.half_day_type : null,
        start_date: null,
        end_date: null,
        notes: data.notes
      };

      console.log('📝 [MobileStepShiftForm] Form data:', formData);
      console.log('🔄 [MobileStepShiftForm] Calling onSubmit API...');
      await onSubmit(formData);
      console.log('✅ [MobileStepShiftForm] Submit successful!');
      
    } catch (error) {
      console.error('❌ [MobileStepShiftForm] Error submitting shift:', error);
      toast.error('Errore nel salvataggio del turno');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mobile-step-form">
      {/* Progress Header */}
      <div className="step-header">
        <div className="step-info">
          <h3 className="step-title">{requiredSteps[currentStep - 1].title}</h3>
          <p className="step-description">{requiredSteps[currentStep - 1].description}</p>
        </div>
        <div className="step-progress">
          <span className="step-counter">{currentStep} di {totalSteps}</span>
          <Progress value={progress} className="w-full mt-2" />
        </div>
      </div>

      {/* Form Content + Navigation */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="step-content">
        {requiredSteps[currentStep - 1].id === 1 && (
          <Step1UserAndDate 
            control={form.control} 
            users={users} 
            isAdminOrSocio={isAdminOrSocio} 
          />
        )}
        {requiredSteps[currentStep - 1].id === 2 && (
          <Step2ShiftType 
            control={form.control} 
            watchShiftType={shiftType} 
          />
        )}
        {requiredSteps[currentStep - 1].id === 3 && (
          <Step3Times 
            control={form.control} 
            watchShiftType={shiftType} 
          />
        )}
        {requiredSteps[currentStep - 1].id === 4 && (
          <Step4Notes control={form.control} />
        )}

        {/* Navigation - NOW INSIDE FORM */}
        <div className="step-navigation">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : handlePrev}
            className="nav-button"
            disabled={isLoading}
          >
            {currentStep === 1 ? (
              "Annulla"
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Indietro
              </>
            )}
          </Button>

          <Button
            type={currentStep === totalSteps ? "submit" : "button"}
            onClick={currentStep === totalSteps ? undefined : handleNext}
            className="nav-button"
            disabled={isLoading}
          >
            {isLoading ? (
              "Salvataggio..."
            ) : currentStep === totalSteps ? (
              isEditing ? "Aggiorna Turno" : "Salva Turno"
            ) : (
              <>
                Avanti
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}