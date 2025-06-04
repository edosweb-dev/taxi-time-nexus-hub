
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full shadow-lg"
        size="lg"
      >
        <MessageCircle className="h-5 w-5 mr-2" />
        Feedback
      </Button>
      
      <FeedbackDialog 
        open={isOpen} 
        onOpenChange={setIsOpen} 
      />
    </>
  );
}
