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
        // Fixed positioning - bottom-6 right-6
        "fixed bottom-6 right-6 z-50",
        // Size: 64x64px for prominent touch target
        "h-16 w-16 rounded-2xl",
        // Styling
        "bg-primary text-primary-foreground",
        "shadow-2xl shadow-primary/50",
        "hover:shadow-3xl hover:scale-110",
        "active:scale-95",
        "transition-all duration-200",
        // Ensure above mobile nav (if present)
        "md:bottom-8 md:right-8",
        className
      )}
      aria-label="Aggiungi veicolo"
    >
      <Plus className="h-8 w-8" strokeWidth={2.5} />
    </Button>
  );
}
