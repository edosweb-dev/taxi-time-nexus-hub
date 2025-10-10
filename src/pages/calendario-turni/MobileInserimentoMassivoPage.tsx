import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InserimentoMassivoForm } from '@/components/calendario-turni/shared/InserimentoMassivoForm';
import { ShiftCreationProgressDialog } from '@/components/shifts/dialogs/ShiftCreationProgressDialog';

export default function MobileInserimentoMassivoPage() {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());
  
  // Progress states
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [totalShifts, setTotalShifts] = useState(0);
  const [createdShifts, setCreatedShifts] = useState(0);
  const [errorShifts, setErrorShifts] = useState(0);
  const [isCreationComplete, setIsCreationComplete] = useState(false);

  const handleCancel = () => {
    navigate('/calendario-turni');
  };

  const handleStartProgress = (total: number) => {
    setTotalShifts(total);
    setCreatedShifts(0);
    setErrorShifts(0);
    setIsCreationComplete(false);
    setShowProgressDialog(true);
  };

  const handleUpdateProgress = (created: number, errors: number) => {
    setCreatedShifts(created);
    setErrorShifts(errors);
  };

  const handleCompleteProgress = () => {
    setIsCreationComplete(true);
    // Auto-navigate back dopo successo
    setTimeout(() => {
      navigate('/calendario-turni');
    }, 1500);
  };

  const handleProgressDialogClose = () => {
    setShowProgressDialog(false);
    navigate('/calendario-turni');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Fisso */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Inserimento Massivo</h1>
            <p className="text-xs text-muted-foreground">
              Configura turni per più dipendenti
            </p>
          </div>
        </div>
      </div>

      {/* Form Scrollabile */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <InserimentoMassivoForm
            currentDate={currentDate}
            onCancel={handleCancel}
            onStartProgress={handleStartProgress}
            onUpdateProgress={handleUpdateProgress}
            onCompleteProgress={handleCompleteProgress}
            showCancelButton={false}
          />
        </div>
      </div>

      {/* Progress Dialog */}
      {showProgressDialog && (
        <ShiftCreationProgressDialog
          open={showProgressDialog}
          onOpenChange={setShowProgressDialog}
          totalShifts={totalShifts}
          createdShifts={createdShifts}
          errorShifts={errorShifts}
          isComplete={isCreationComplete}
          onClose={handleProgressDialogClose}
        />
      )}
    </div>
  );
}
