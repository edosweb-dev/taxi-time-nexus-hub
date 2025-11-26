import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SingleShiftForm } from './SingleShiftForm';

export function AddShiftMobileEntry() {
  const [singleFormOpen, setSingleFormOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <Button
        size="lg"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
        onClick={() => setSingleFormOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Form Singolo */}
      <SingleShiftForm
        open={singleFormOpen}
        onOpenChange={setSingleFormOpen}
      />
    </>
  );
}