import { StatoServizio } from "@/lib/types/servizi";

export const STATUS_STYLES = {
  bozza: { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    border: 'border-gray-300',
    icon: '⚪',
  },
  da_assegnare: { 
    bg: 'bg-yellow-100', 
    text: 'text-yellow-800', 
    border: 'border-yellow-300',
    icon: '🟡',
  },
  assegnato: { 
    bg: 'bg-blue-100', 
    text: 'text-blue-800', 
    border: 'border-blue-300',
    icon: '🔵',
  },
  completato: { 
    bg: 'bg-green-100', 
    text: 'text-green-800', 
    border: 'border-green-300',
    icon: '🟢',
  },
  consuntivato: { 
    bg: 'bg-purple-100', 
    text: 'text-purple-800', 
    border: 'border-purple-300',
    icon: '🟣',
  },
  annullato: { 
    bg: 'bg-red-100', 
    text: 'text-red-800', 
    border: 'border-red-300',
    icon: '🔴',
  },
} as const;

export function getStatusBadgeStyle(stato: StatoServizio) {
  return STATUS_STYLES[stato] || STATUS_STYLES.bozza;
}

export function getStatusLabel(stato: StatoServizio) {
  const labels: Record<StatoServizio, string> = {
    bozza: 'BOZZA',
    da_assegnare: 'DA ASSEGNARE',
    assegnato: 'ASSEGNATO',
    completato: 'COMPLETATO',
    consuntivato: 'CONSUNTIVATO',
    annullato: 'ANNULLATO',
    non_accettato: 'NON ACCETTATO',
  };
  return labels[stato] || stato.toUpperCase();
}
