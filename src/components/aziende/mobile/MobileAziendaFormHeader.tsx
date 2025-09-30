import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileAziendaFormHeaderProps {
  title: string;
  onBack: () => void;
}

export function MobileAziendaFormHeader({ title, onBack }: MobileAziendaFormHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background border-b">
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0 min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-base truncate">{title}</h1>
        </div>
      </div>
    </div>
  );
}
