
import { useState, useEffect } from 'react';
import { Servizio } from '@/lib/types/servizi';

interface UseConducenteEsternoFormProps {
  servizio: Servizio;
}

interface UseConducenteEsternoFormReturn {
  conducenteEsternoNome: string;
  setConducenteEsternoNome: (value: string) => void;
  conducenteEsternoEmail: string;
  setConducenteEsternoEmail: (value: string) => void;
  isValid: boolean;
}

export function useConducenteEsternoForm({ servizio }: UseConducenteEsternoFormProps): UseConducenteEsternoFormReturn {
  const [conducenteEsternoNome, setConducenteEsternoNome] = useState<string>('');
  const [conducenteEsternoEmail, setConducenteEsternoEmail] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);

  // Initialize values from servizio
  useEffect(() => {
    setConducenteEsternoNome(servizio.conducente_esterno_nome || '');
    setConducenteEsternoEmail(servizio.conducente_esterno_email || '');
  }, [servizio]);

  // Validate form
  useEffect(() => {
    // Validation rule: name must be present
    setIsValid(!!conducenteEsternoNome.trim());
    
    // Additional email validation if email is provided
    if (conducenteEsternoEmail && !validateEmail(conducenteEsternoEmail)) {
      setIsValid(false);
    }
  }, [conducenteEsternoNome, conducenteEsternoEmail]);

  return {
    conducenteEsternoNome,
    setConducenteEsternoNome,
    conducenteEsternoEmail,
    setConducenteEsternoEmail,
    isValid
  };
}

// Email validation helper
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
