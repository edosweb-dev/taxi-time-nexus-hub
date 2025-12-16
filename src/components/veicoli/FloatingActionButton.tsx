import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  className 
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        // Fixed positioning
        "fixed bottom-24 right-4 z-50",
        // Size: 56x56px
        "h-14 w-14 rounded-full",
        // Styling
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/25",
        "hover:shadow-xl hover:scale-105",
        "active:scale-95",
        "transition-all duration-150",
        // Desktop
        "md:bottom-8 md:right-8",
        className
      )}
      aria-label="Aggiungi veicolo"
    >
      <Plus className="h-6 w-6" strokeWidth={2.5} />
    </Button>
  );
}
