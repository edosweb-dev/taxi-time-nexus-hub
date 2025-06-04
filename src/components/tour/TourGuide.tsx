
import React, { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, HelpCircle } from 'lucide-react';

interface TourGuideProps {
  steps: Step[];
  tourKey: string;
  autoStart?: boolean;
}

export function TourGuide({ steps, tourKey, autoStart = false }: TourGuideProps) {
  const { profile } = useAuth();
  const [runTour, setRunTour] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  const storageKey = `tour_completed_${tourKey}_${profile?.id}`;

  useEffect(() => {
    const completed = localStorage.getItem(storageKey) === 'true';
    setTourCompleted(completed);
    
    if (autoStart && !completed && profile) {
      // Avvia il tour dopo un breve delay per permettere il caricamento della pagina
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey, autoStart, profile]);

  const handleTourCallback = (data: CallBackProps) => {
    const { status, type } = data;
    
    if (['step:after', 'error:target_not_found'].includes(type)) {
      // Aggiorna l'indice dello step
    }
    
    if (['finished', 'skipped'].includes(status)) {
      setRunTour(false);
      localStorage.setItem(storageKey, 'true');
      setTourCompleted(true);
    }
  };

  const startTour = () => {
    setRunTour(true);
  };

  const resetTour = () => {
    localStorage.removeItem(storageKey);
    setTourCompleted(false);
    setRunTour(true);
  };

  return (
    <>
      <Joyride
        steps={steps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleTourCallback}
        styles={{
          options: {
            primaryColor: 'hsl(var(--primary))',
            backgroundColor: 'hsl(var(--background))',
            textColor: 'hsl(var(--foreground))',
            overlayColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
          },
          tooltip: {
            borderRadius: '8px',
            fontSize: '14px',
          },
          buttonNext: {
            backgroundColor: 'hsl(var(--primary))',
            borderRadius: '6px',
            fontSize: '14px',
            padding: '8px 16px',
          },
          buttonBack: {
            color: 'hsl(var(--muted-foreground))',
            fontSize: '14px',
            padding: '8px 16px',
          },
          buttonSkip: {
            color: 'hsl(var(--muted-foreground))',
            fontSize: '14px',
          },
        }}
        locale={{
          back: 'Indietro',
          close: 'Chiudi',
          last: 'Fine',
          next: 'Avanti',
          open: 'Apri finestra',
          skip: 'Salta tour',
        }}
      />
      
      {/* Floating help button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={tourCompleted ? resetTour : startTour}
          className="rounded-full h-12 w-12 shadow-lg"
          variant="default"
          title={tourCompleted ? 'Riavvia tour guidato' : 'Avvia tour guidato'}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
