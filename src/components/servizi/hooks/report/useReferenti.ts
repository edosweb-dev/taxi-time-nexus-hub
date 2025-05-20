
import { useState, useEffect } from 'react';
import { useUsers } from '@/hooks/useUsers';

export const useReferenti = (aziendaId: string | null) => {
  const [referenti, setReferenti] = useState<any[]>([]);
  const [selectedAziendaId, setSelectedAziendaId] = useState<string>('');
  const { users } = useUsers();

  useEffect(() => {
    if (aziendaId) {
      setSelectedAziendaId(aziendaId);
      
      // Get all referenti (clients) for this azienda
      const filteredReferenti = users.filter(user => 
        user.role === 'cliente' && user.azienda_id === aziendaId
      );
      setReferenti(filteredReferenti);
    }
  }, [aziendaId, users]);

  return {
    referenti,
    selectedAziendaId
  };
};
