import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = "Aggiungi conducente" }: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 w-16 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all active:scale-90 z-50"
      aria-label={label}
    >
      <Plus className="w-8 h-8" />
    </button>
  );
}
