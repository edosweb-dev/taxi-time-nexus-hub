import { useEffect, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface UseDraftSaveProps {
  form: UseFormReturn<any>;
  draftKey: string;
  enabled?: boolean;
  debounceMs?: number;
}

const DRAFT_EXPIRY_DAYS = 7;

interface DraftData {
  data: any;
  timestamp: number;
}

export function useDraftSave({ 
  form, 
  draftKey, 
  enabled = true,
  debounceMs = 3000 
}: UseDraftSaveProps) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Save draft to localStorage
  const saveDraft = (data: any) => {
    if (!enabled) return;
    
    const draftData: DraftData = {
      data,
      timestamp: Date.now(),
    };
    
    try {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  // Load draft from localStorage
  const loadDraft = (): any | null => {
    if (!enabled) return null;
    
    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return null;

      const draftData: DraftData = JSON.parse(saved);
      
      // Check if draft has expired
      const expiryTime = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (Date.now() - draftData.timestamp > expiryTime) {
        clearDraft();
        return null;
      }

      return draftData.data;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  // Check if draft exists
  const hasDraft = (): boolean => {
    return loadDraft() !== null;
  };

  // Auto-save on form changes
  useEffect(() => {
    if (!enabled) return;

    const subscription = form.watch((data) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for debounced save
      timeoutRef.current = setTimeout(() => {
        if (form.formState.isDirty) {
          saveDraft(data);
        }
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [form, enabled, debounceMs, draftKey]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
}
