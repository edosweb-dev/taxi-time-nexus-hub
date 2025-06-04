
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50 
                   rounded-none rounded-l-lg shadow-lg 
                   h-28 w-10 p-0 
                   bg-primary hover:bg-primary/90
                   border-l border-t border-b border-primary-foreground/20
                   transition-all duration-200 hover:w-12"
        size="sm"
      >
        <div className="flex flex-col items-center justify-center">
          <span className="text-xs font-medium -rotate-90 whitespace-nowrap text-primary-foreground">
            Feedback
          </span>
        </div>
      </Button>
      
      <FeedbackSheet 
        open={isOpen} 
        onOpenChange={setIsOpen} 
      />
    </>
  );
}
