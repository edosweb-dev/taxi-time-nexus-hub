import React from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function QuickActionsOptimized() {
  const navigate = useNavigate();
  
  return (
    <div className="quick-actions">
      <h3 className="quick-actions-title">Azioni Rapide</h3>
      <div className="quick-actions-grid">
        <Button
          variant="default"
          onClick={() => navigate('/servizi/crea')}
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
  );
}