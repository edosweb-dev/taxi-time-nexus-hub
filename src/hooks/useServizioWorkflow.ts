import { useMemo } from 'react';
import { StatoServizio } from '@/lib/types/servizi';

export type UserRole = 'admin' | 'socio' | 'dipendente' | 'cliente';
export type SectionPriority = 'critical' | 'important' | 'secondary';

export interface SectionConfig {
  id: string;
  title: string;
  isVisible: boolean;
  isAutoOpen: boolean;
  priority: SectionPriority;
}

interface WorkflowConfig {
  sections: SectionConfig[];
  autoOpenSections: string[];
  visibleSections: string[];
}

/**
 * Hook che determina la configurazione ottimale delle sezioni
 * in base allo stato del servizio e al ruolo dell'utente
 */
export function useServizioWorkflow(
  stato: StatoServizio,
  userRole: UserRole,
  hasPasseggeri: boolean = false,
  hasNote: boolean = false
): WorkflowConfig {
  return useMemo(() => {
    const isAdmin = userRole === 'admin' || userRole === 'socio';
    const isDriver = userRole === 'dipendente';
    
    // Configuration matrix basata su stato e ruolo
    const config = getWorkflowConfig(stato, isAdmin, isDriver, hasPasseggeri, hasNote);
    
    return {
      sections: config,
      autoOpenSections: config.filter(s => s.isAutoOpen).map(s => s.id),
      visibleSections: config.filter(s => s.isVisible).map(s => s.id),
    };
  }, [stato, userRole, hasPasseggeri, hasNote]);
}

function getWorkflowConfig(
  stato: StatoServizio,
  isAdmin: boolean,
  isDriver: boolean,
  hasPasseggeri: boolean,
  hasNote: boolean
): SectionConfig[] {
  
  // Default sections configuration
  const sections: SectionConfig[] = [
    {
      id: 'operational',
      title: 'Dettagli Operativi',
      isVisible: true,
      isAutoOpen: false,
      priority: 'important',
    },
    {
      id: 'financial',
      title: 'Informazioni Finanziarie',
      isVisible: true,
      isAutoOpen: false,
      priority: 'secondary',
    },
    {
      id: 'passengers',
      title: 'Passeggeri',
      isVisible: hasPasseggeri,
      isAutoOpen: false,
      priority: 'important',
    },
    {
      id: 'notes',
      title: 'Note del Servizio',
      isVisible: hasNote,
      isAutoOpen: false,
      priority: 'secondary',
    },
    {
      id: 'history',
      title: 'Storico Modifiche',
      isVisible: true,
      isAutoOpen: false,
      priority: 'secondary',
    },
  ];

  // Apply context-aware rules based on stato
  switch (stato) {
    case 'da_assegnare':
      if (isAdmin) {
        // Admin needs to assign service - focus on operational details
        return sections.map(s => {
          if (s.id === 'operational') {
            return { ...s, isAutoOpen: true, priority: 'critical' };
          }
          if (s.id === 'financial' || s.id === 'history') {
            return { ...s, isVisible: false }; // Hide non-essential
          }
          return s;
        });
      }
      break;

    case 'assegnato':
      if (isDriver) {
        // Driver needs route and passenger info
        return sections.map(s => {
          if (s.id === 'operational') {
            return { ...s, isAutoOpen: true, priority: 'critical' };
          }
          if (s.id === 'passengers' && hasPasseggeri) {
            return { ...s, isAutoOpen: true, priority: 'critical' };
          }
          if (s.id === 'notes' && hasNote) {
            return { ...s, isVisible: true, isAutoOpen: true, priority: 'important' };
          }
          if (s.id === 'financial') {
            return { ...s, isVisible: false }; // Not driver's concern
          }
          return s;
        });
      } else if (isAdmin) {
        // Admin monitoring assigned service
        return sections.map(s => {
          if (s.id === 'operational') {
            return { ...s, isAutoOpen: true, priority: 'important' };
          }
          if (s.id === 'financial' || s.id === 'history') {
            return { ...s, isVisible: true, priority: 'secondary' };
          }
          return s;
        });
      }
      break;

    case 'completato':
      if (isAdmin) {
        // Admin needs to review and verify
        return sections.map(s => {
          if (s.id === 'operational') {
            return { ...s, isAutoOpen: true, priority: 'critical' };
          }
          if (s.id === 'financial') {
            return { ...s, isVisible: true, isAutoOpen: true, priority: 'critical' };
          }
          if (s.id === 'history') {
            return { ...s, isVisible: true, priority: 'important' };
          }
          return s;
        });
      } else {
        // Non-admin: show all but only operational open
        return sections.map(s => {
          if (s.id === 'operational') {
            return { ...s, isAutoOpen: true, priority: 'important' };
          }
          return s;
        });
      }
      break;

    case 'consuntivato':
      // All sections visible, financial and history open
      return sections.map(s => {
        if (s.id === 'financial') {
          return { ...s, isVisible: true, isAutoOpen: true, priority: 'critical' };
        }
        if (s.id === 'history') {
          return { ...s, isVisible: true, isAutoOpen: true, priority: 'important' };
        }
        if (s.id === 'operational') {
          return { ...s, isVisible: true, priority: 'important' };
        }
        return { ...s, isVisible: true };
      });

    case 'annullato':
    case 'non_accettato':
      // Show minimal info, focus on history
      return sections.map(s => {
        if (s.id === 'history') {
          return { ...s, isVisible: true, isAutoOpen: true, priority: 'important' };
        }
        if (s.id === 'operational') {
          return { ...s, isVisible: true, isAutoOpen: false, priority: 'secondary' };
        }
        if (s.id === 'financial') {
          return { ...s, isVisible: isAdmin }; // Only admin sees financial on cancelled
        }
        return { ...s, isVisible: false };
      });

    default:
      // Default fallback - operational open
      return sections.map(s => 
        s.id === 'operational' 
          ? { ...s, isAutoOpen: true, priority: 'important' }
          : s
      );
  }

  // Fallback to default configuration
  return sections.map(s => 
    s.id === 'operational' 
      ? { ...s, isAutoOpen: true, priority: 'important' }
      : s
  );
}

/**
 * Get priority color classes for visual indicators
 */
export function getPriorityStyles(priority: SectionPriority) {
  switch (priority) {
    case 'critical':
      return {
        border: 'border-l-4 border-primary',
        bg: 'bg-primary/5',
        badge: 'bg-primary/20 text-primary',
      };
    case 'important':
      return {
        border: 'border-l-4 border-blue-500',
        bg: 'bg-blue-50/50 dark:bg-blue-950/20',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      };
    case 'secondary':
      return {
        border: 'border-l border-border',
        bg: 'bg-muted/30',
        badge: 'bg-muted text-muted-foreground',
      };
  }
}
