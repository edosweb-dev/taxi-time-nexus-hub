import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';
import { InserimentoServizioModal } from '../InserimentoServizioModal';
import { useAuth } from '@/contexts/AuthContext';

interface MobileServiziHeaderProps {
  isAdminOrSocio: boolean;
  onNavigateToNewServizio: () => void;
}

export function MobileServiziHeader({ 
  isAdminOrSocio, 
  onNavigateToNewServizio 
}: MobileServiziHeaderProps) {
  const { headingClass } = useResponsiveStyles();
  const { profile } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setShowModal(true);
  };
  
  return (
    <>
      <div className="w-full max-w-none bg-primary text-primary-foreground p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <h1 className={`${headingClass} font-bold`}>Servizi</h1>
          {isAdminOrSocio && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClick}
              className="text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuovo
            </Button>
          )}
        </div>
      </div>
      
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}