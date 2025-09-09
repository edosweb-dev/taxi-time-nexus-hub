import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileServiziHeaderProps {
  isAdminOrSocio: boolean;
  onNavigateToNewServizio: () => void;
}

export function MobileServiziHeader({ 
  isAdminOrSocio, 
  onNavigateToNewServizio 
}: MobileServiziHeaderProps) {
  return (
    <div className="bg-primary text-primary-foreground px-3 py-3 sm:px-4 sm:py-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold">Servizi</h1>
        {isAdminOrSocio && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onNavigateToNewServizio}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 h-auto"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            Nuovo
          </Button>
        )}
      </div>
    </div>
  );
}