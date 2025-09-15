import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Users, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ShiftFormData, ShiftType, HalfDayType } from '../types';
import { validateBatchShifts, createBatchShifts } from '../utils/batchValidation';
import { BatchStep1Users } from './batch-steps/BatchStep1Users';
import { BatchStep2DateRange } from './batch-steps/BatchStep2DateRange';
import { BatchStep3ShiftType } from './batch-steps/BatchStep3ShiftType';
import { BatchStep4Preview } from './batch-steps/BatchStep4Preview';

const batchShiftSchema = z.object({
  selectedUsers: z.array(z.string()).min(1, 'Seleziona almeno un utente'),
  startDate: z.date({ required_error: 'Seleziona una data di inizio' }),
  endDate: z.date({ required_error: 'Seleziona una data di fine' }),
  selectedDays: z.array(z.number()).min(1, 'Seleziona almeno un giorno'),
  shiftType: z.enum(['specific_hours', 'full_day', 'half_day'] as const),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  halfDayType: z.enum(['morning', 'afternoon'] as const).optional(),
  notes: z.string().optional()
}).refine((data) => {
  if (data.shiftType === 'specific_hours') {
    return data.startTime && data.endTime;
  }
  return true;
}, {
  message: "Orari di inizio e fine sono richiesti per turni a ore specifiche",
  path: ["startTime"]
}).refine((data) => {
  if (data.shiftType === 'half_day') {
    return data.halfDayType;
  }
  return true;
}, {
  message: "Seleziona mattina o pomeriggio per mezze giornate",
  path: ["halfDayType"]
});

type BatchShiftFormValues = z.infer<typeof batchShiftSchema>;

interface MobileBatchShiftFormProps {
  onSubmit: (shifts: ShiftFormData[]) => Promise<void>;
  onCancel: () => void;
  isAdminOrSocio: boolean;
  defaultDate?: Date | null;
}

const STEPS = [
  { id: 1, title: "Utenti", description: "Seleziona i dipendenti", icon: Users },
  { id: 2, title: "Periodo", description: "Date e giorni", icon: Calendar },
  { id: 3, title: "Tipo Turno", description: "Modalità di lavoro", icon: Clock },
  { id: 4, title: "Anteprima", description: "Verifica e conferma", icon: FileText }
];

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
}

export function MobileBatchShiftForm({
  onSubmit,
  onCancel,
  isAdminOrSocio,
  defaultDate
}: MobileBatchShiftFormProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [generatedShifts, setGeneratedShifts] = useState<ShiftFormData[]>([]);

  const form = useForm<BatchShiftFormValues>({
    resolver: zodResolver(batchShiftSchema),
    defaultValues: {
      selectedUsers: [],
      startDate: defaultDate || new Date(),
      endDate: defaultDate || new Date(),
      selectedDays: [1, 2, 3, 4, 5], // Monday to Friday by default
      shiftType: 'full_day',
      startTime: '09:00',
      endTime: '17:00',
      halfDayType: 'morning',
      notes: ''
    }
  });

  const { watch, trigger } = form;
  const watchedValues = watch();

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

  const validateCurrentStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return await trigger('selectedUsers');
      case 2:
        return await trigger(['startDate', 'endDate', 'selectedDays']);
      case 3:
        const fields: (keyof BatchShiftFormValues)[] = ['shiftType'];
        if (watchedValues.shiftType === 'specific_hours') {
          fields.push('startTime', 'endTime');
        }
        if (watchedValues.shiftType === 'half_day') {
          fields.push('halfDayType');
        }
        return await trigger(fields);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const generateShiftsPreview = () => {
    const { selectedUsers, startDate, endDate, selectedDays, shiftType, startTime, endTime, halfDayType, notes } = watchedValues;
    
    const shifts: ShiftFormData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay(); // Convert Sunday (0) to 7
      
      if (selectedDays.includes(dayOfWeek)) {
        selectedUsers.forEach(userId => {
          shifts.push({
            user_id: userId,
            shift_date: new Date(currentDate),
            shift_type: shiftType as ShiftType,
            start_time: shiftType === 'specific_hours' ? startTime || null : null,
            end_time: shiftType === 'specific_hours' ? endTime || null : null,
            half_day_type: shiftType === 'half_day' ? halfDayType as HalfDayType : null,
            start_date: null,
            end_date: null,
            notes: notes || null
          });
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setGeneratedShifts(shifts);
    return shifts;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    
    if (!isValid) {
      switch (currentStep) {
        case 1:
          toast.error('Seleziona almeno un utente');
          break;
        case 2:
          toast.error('Controlla le date e i giorni selezionati');
          break;
        case 3:
          if (watchedValues.shiftType === 'specific_hours' && (!watchedValues.startTime || !watchedValues.endTime)) {
            toast.error('Inserisci gli orari di inizio e fine');
          } else if (watchedValues.shiftType === 'half_day' && !watchedValues.halfDayType) {
            toast.error('Seleziona mattina o pomeriggio');
          }
          break;
      }
      return;
    }

    if (currentStep === 3) {
      // Generate preview on step 3 completion
      generateShiftsPreview();
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      const shifts = generatedShifts.length > 0 ? generatedShifts : generateShiftsPreview();
      
      if (shifts.length === 0) {
        toast.error('Nessun turno da creare');
        return;
      }

      // Validate shifts
      const validation = await validateBatchShifts(shifts);
      
      if (validation.invalidShifts.length > 0) {
        toast.error(`${validation.invalidShifts.length} turni non validi rilevati`);
        return;
      }

      await onSubmit(shifts);
      
    } catch (error) {
      console.error('Error submitting batch shifts:', error);
      toast.error('Errore nella creazione dei turni');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep - 1];
  const StepIcon = currentStepData.icon;

  return (
    <div className="mobile-batch-form">
      {/* Progress Header */}
      <Card className="border-b rounded-b-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">{currentStepData.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">{currentStep} di {STEPS.length}</span>
            <Progress value={progress} className="flex-1 h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentStep === 1 && (
          <BatchStep1Users 
            control={form.control}
            users={users}
            isAdminOrSocio={isAdminOrSocio}
          />
        )}
        {currentStep === 2 && (
          <BatchStep2DateRange 
            control={form.control}
          />
        )}
        {currentStep === 3 && (
          <BatchStep3ShiftType 
            control={form.control}
            watchShiftType={watchedValues.shiftType}
          />
        )}
        {currentStep === 4 && (
          <BatchStep4Preview 
            shifts={generatedShifts}
            users={users}
            onRegenerate={generateShiftsPreview}
          />
        )}
      </div>

      {/* Navigation */}
      <Card className="border-t rounded-t-none">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={currentStep === 1 ? onCancel : handlePrev}
              disabled={isLoading}
              className="flex-1"
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
              type="button"
              onClick={currentStep === STEPS.length ? handleSubmit : handleNext}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                "Creazione..."
              ) : currentStep === STEPS.length ? (
                `Crea ${generatedShifts.length} Turni`
              ) : (
                <>
                  Avanti
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}