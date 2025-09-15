import React, { useState } from 'react';
import { ShiftFormData } from '../types';
import { ModeSelector } from './ModeSelector';
import { MobileStepShiftForm } from './MobileStepShiftForm';
import { MobileBatchShiftForm } from './MobileBatchShiftForm';

interface MobileShiftSelectorProps {
  onSubmit: (data: ShiftFormData | ShiftFormData[]) => Promise<void>;
  onCancel: () => void;
  isAdminOrSocio: boolean;
  defaultDate?: Date | null;
  defaultUserId?: string | null;
  selectedShift?: any;
}

type ModeType = 'single' | 'batch' | null;

export function MobileShiftSelector({
  onSubmit,
  onCancel,
  isAdminOrSocio,
  defaultDate,
  defaultUserId,
  selectedShift
}: MobileShiftSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<ModeType>(
    selectedShift ? 'single' : null // If editing, go directly to single mode
  );

  const handleModeSelect = (mode: ModeType) => {
    setSelectedMode(mode);
  };

  const handleSingleSubmit = async (data: ShiftFormData) => {
    await onSubmit(data);
  };

  const handleBatchSubmit = async (shifts: ShiftFormData[]) => {
    // For batch, we submit all shifts individually
    for (const shift of shifts) {
      await onSubmit(shift);
    }
  };

  const handleBack = () => {
    if (selectedShift) {
      // If editing, cancel directly
      onCancel();
    } else {
      // Go back to mode selection
      setSelectedMode(null);
    }
  };

  // Show mode selector if no mode selected and not editing
  if (!selectedMode && !selectedShift) {
    return (
      <ModeSelector
        onSelectMode={handleModeSelect}
        onCancel={onCancel}
      />
    );
  }

  // Show single shift form
  if (selectedMode === 'single' || selectedShift) {
    return (
      <MobileStepShiftForm
        onSubmit={handleSingleSubmit}
        onCancel={handleBack}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={defaultDate}
        defaultUserId={defaultUserId}
        selectedShift={selectedShift}
      />
    );
  }

  // Show batch shift form
  if (selectedMode === 'batch') {
    return (
      <MobileBatchShiftForm
        onSubmit={handleBatchSubmit}
        onCancel={handleBack}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={defaultDate}
      />
    );
  }

  return null;
}