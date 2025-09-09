import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';

interface MobileServiziHeaderProps {
  isAdminOrSocio: boolean;
  onNavigateToNewServizio: () => void;
}

export function MobileServiziHeader({ 
  isAdminOrSocio, 
  onNavigateToNewServizio 
}: MobileServiziHeaderProps) {
  const { headingClass } = useResponsiveStyles();
  
  return (
    <div className="bg-primary text-primary-foreground w-full p-4">
      <div className="flex items-center justify-between">
        <h1 className={`${headingClass} font-bold`}>Servizi</h1>
        {isAdminOrSocio && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onNavigateToNewServizio}
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo
          </Button>
        )}
      </div>
    </div>
  );
}