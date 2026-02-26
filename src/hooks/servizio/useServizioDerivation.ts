import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ServizioFormMode, ServizioFormData } from './useServizioForm';

interface PasseggeroData {
  presa_tipo?: 'personalizzato' | 'passeggero' | 'aeroporto';
  destinazione_tipo?: 'personalizzato' | 'passeggero' | 'aeroporto';
  cliente?: {
    indirizzo?: string;
    citta?: string;
    cap?: string;
    lat?: number;
    lng?: number;
  };
  presa_personalizzata?: string;
  destinazione_personalizzata?: string;
}

interface UseServizioDerivationOptions {
  mode: ServizioFormMode;
  form: UseFormReturn<ServizioFormData>;
  passeggeri: PasseggeroData[];
}

/**
 * Derives addresses from passenger data
 * 
 * CRITICAL RULES:
 * 1. ABSOLUTE GUARD: Zero derivation in edit mode
 * 2. Only derives if field is currently empty
 * 3. Only runs when passeggeri change in create mode
 */
export const useServizioDerivation = ({
  mode,
  form,
  passeggeri,
}: UseServizioDerivationOptions): void => {
  
  useEffect(() => {
    // ✅ ABSOLUTE GUARD: Zero derivation in edit mode
    if (mode === 'edit') {
      console.log('[useServizioDerivation] ⛔ Skipped - edit mode never derives');
      return;
    }
    
    console.log('[useServizioDerivation] Running in create mode');
    
    if (!passeggeri || passeggeri.length === 0) {
      console.log('[useServizioDerivation] No passengers to derive from');
      return;
    }
    
    const primoPasseggero = passeggeri[0];
    
    // ===== DERIVE PARTENZA =====
    const currentPartenza = form.getValues('indirizzo_presa');
    
    if (!currentPartenza) {
      console.log('[useServizioDerivation] Partenza field is empty, checking derivation...');
      
      if (primoPasseggero.presa_tipo === 'passeggero' && primoPasseggero.cliente?.indirizzo) {
        const indirizzo = primoPasseggero.cliente.indirizzo;
        const lat = primoPasseggero.cliente.lat;
        const lng = primoPasseggero.cliente.lng;
        
        console.log('[useServizioDerivation] ✅ Setting partenza from passenger:', indirizzo);
        
        form.setValue('indirizzo_presa', indirizzo, { shouldValidate: true });
        if (lat) form.setValue('indirizzo_presa_lat', lat);
        if (lng) form.setValue('indirizzo_presa_lng', lng);
      } else if (primoPasseggero.presa_tipo === 'personalizzato' && primoPasseggero.presa_personalizzata) {
        console.log('[useServizioDerivation] ✅ Setting partenza from custom:', primoPasseggero.presa_personalizzata);
        form.setValue('indirizzo_presa', primoPasseggero.presa_personalizzata, { shouldValidate: true });
      } else {
        console.log('[useServizioDerivation] ⚠️ Cannot derive partenza - no valid source');
      }
    } else {
      console.log('[useServizioDerivation] ⏭️ Partenza already has value, skipping:', currentPartenza);
    }
    
    // ===== DERIVE DESTINAZIONE =====
    const currentDestinazione = form.getValues('indirizzo_destinazione');
    
    if (!currentDestinazione) {
      console.log('[useServizioDerivation] Destinazione field is empty, checking derivation...');
      
      if (primoPasseggero.destinazione_tipo === 'passeggero' && primoPasseggero.cliente?.indirizzo) {
        const indirizzo = primoPasseggero.cliente.indirizzo;
        const lat = primoPasseggero.cliente.lat;
        const lng = primoPasseggero.cliente.lng;
        
        console.log('[useServizioDerivation] ✅ Setting destinazione from passenger:', indirizzo);
        
        form.setValue('indirizzo_destinazione', indirizzo, { shouldValidate: true });
        if (lat) form.setValue('indirizzo_destinazione_lat', lat);
        if (lng) form.setValue('indirizzo_destinazione_lng', lng);
      } else if (primoPasseggero.destinazione_tipo === 'personalizzato' && primoPasseggero.destinazione_personalizzata) {
        console.log('[useServizioDerivation] ✅ Setting destinazione from custom:', primoPasseggero.destinazione_personalizzata);
        form.setValue('indirizzo_destinazione', primoPasseggero.destinazione_personalizzata, { shouldValidate: true });
      } else {
        console.log('[useServizioDerivation] ⚠️ Cannot derive destinazione - no valid source');
      }
    } else {
      console.log('[useServizioDerivation] ⏭️ Destinazione already has value, skipping:', currentDestinazione);
    }
    
  }, [mode, passeggeri, form]);
};
