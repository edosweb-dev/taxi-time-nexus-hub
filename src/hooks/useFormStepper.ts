import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

interface Step {
  id: number;
  title: string;
  fields: string[];
}

interface UseFormStepperProps {
  steps: Step[];
  form: UseFormReturn<any>;
  onStepChange?: (step: number) => void;
}

export function useFormStepper({ steps, form, onStepChange }: UseFormStepperProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(() => {
    const stepFromUrl = parseInt(searchParams.get('step') || '1');
    return stepFromUrl >= 1 && stepFromUrl <= steps.length ? stepFromUrl : 1;
  });
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([1]));

  // Sync step with URL
  useEffect(() => {
    const stepFromUrl = parseInt(searchParams.get('step') || '1');
    if (stepFromUrl !== currentStep && stepFromUrl >= 1 && stepFromUrl <= steps.length) {
      setCurrentStep(stepFromUrl);
    }
  }, [searchParams, currentStep, steps.length]);

  // Update URL when step changes
  const updateStep = (step: number) => {
    setCurrentStep(step);
    setSearchParams({ step: step.toString() }, { replace: true });
    onStepChange?.(step);
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const currentStepData = steps[currentStep - 1];
    if (!currentStepData) return false;

    const isValid = await form.trigger(currentStepData.fields);
    
    if (isValid) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    return isValid;
  };

  const goToNextStep = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid && currentStep < steps.length) {
      const nextStep = currentStep + 1;
      updateStep(nextStep);
      setCompletedSteps(prev => new Set([...prev, nextStep]));
    }
    
    return isValid;
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // Can only navigate to completed steps or next step after current
    if (completedSteps.has(step) || step === currentStep + 1) {
      updateStep(step);
    }
  };

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === steps.length;
  const progress = (currentStep / steps.length) * 100;

  return {
    currentStep,
    completedSteps,
    isFirstStep,
    isLastStep,
    progress,
    validateCurrentStep,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    totalSteps: steps.length,
  };
}
