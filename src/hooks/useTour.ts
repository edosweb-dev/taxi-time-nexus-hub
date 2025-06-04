
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function useTour() {
  const { profile } = useAuth();
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    if (profile) {
      const firstLoginKey = `first_login_completed_${profile.id}`;
      const hasCompletedFirstLogin = localStorage.getItem(firstLoginKey) === 'true';
      
      if (!hasCompletedFirstLogin) {
        setIsFirstLogin(true);
        localStorage.setItem(firstLoginKey, 'true');
      }
    }
  }, [profile]);

  const markTourAsCompleted = (tourKey: string) => {
    if (profile) {
      const storageKey = `tour_completed_${tourKey}_${profile.id}`;
      localStorage.setItem(storageKey, 'true');
    }
  };

  const resetTour = (tourKey: string) => {
    if (profile) {
      const storageKey = `tour_completed_${tourKey}_${profile.id}`;
      localStorage.removeItem(storageKey);
    }
  };

  const isTourCompleted = (tourKey: string): boolean => {
    if (!profile) return true;
    const storageKey = `tour_completed_${tourKey}_${profile.id}`;
    return localStorage.getItem(storageKey) === 'true';
  };

  return {
    isFirstLogin,
    markTourAsCompleted,
    resetTour,
    isTourCompleted,
  };
}
