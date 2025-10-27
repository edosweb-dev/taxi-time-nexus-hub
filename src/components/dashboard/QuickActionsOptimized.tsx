import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { InserimentoServizioModal } from '@/components/servizi/InserimentoServizioModal';

export function QuickActionsOptimized() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <div className="quick-actions">
        <h3 className="quick-actions-title">Azioni Rapide</h3>
        <div className="quick-actions-grid">
          <Button
            variant="default"
            onClick={() => setShowModal(true)}
            className="quick-action-button"
          >
            <Plus className="quick-action-icon" />
            Nuovo Servizio
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/calendario-servizi')}
            className="quick-action-button"
          >
            <Calendar className="quick-action-icon" />
            Calendario
          </Button>
        </div>
      </div>
      
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}