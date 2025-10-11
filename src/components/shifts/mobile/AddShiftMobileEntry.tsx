import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShiftInsertTypeModal } from './ShiftInsertTypeModal';
import { SingleShiftForm } from './SingleShiftForm';
import { BatchShiftWizard } from './BatchShiftWizard';

export function AddShiftMobileEntry() {
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [singleFormOpen, setSingleFormOpen] = useState(false);
  const [batchWizardOpen, setBatchWizardOpen] = useState(false);

  const handleSelectType = (type: 'single' | 'batch') => {
    console.log('[AddShiftMobileEntry] Selected type:', type);
    
    // Chiudi modal scelta
    setTypeModalOpen(false);
    
    // Apri form corretto
    if (type === 'single') {
      setSingleFormOpen(true);
    } else {
      setBatchWizardOpen(true);
    }
  };

  const handleCloseSingleForm = (open: boolean) => {
    setSingleFormOpen(open);
    // Se chiude form, riapri scelta tipo? NO, torna a nulla
  };

  const handleCloseBatchWizard = (open: boolean) => {
    setBatchWizardOpen(open);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
        onClick={() => setTypeModalOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Modal Scelta Tipo */}
      <ShiftInsertTypeModal
        open={typeModalOpen}
        onOpenChange={setTypeModalOpen}
        onSelectType={handleSelectType}
      />

      {/* Form Singolo */}
      <SingleShiftForm
        open={singleFormOpen}
        onOpenChange={handleCloseSingleForm}
      />

      {/* Wizard Batch */}
      <BatchShiftWizard
        open={batchWizardOpen}
        onOpenChange={handleCloseBatchWizard}
      />
    </>
  );
}