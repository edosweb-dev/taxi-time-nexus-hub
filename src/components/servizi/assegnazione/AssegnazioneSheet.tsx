
// This component has been replaced by AssignmentPopup for better mobile optimization
import { AssignmentPopup } from './AssignmentPopup';
import { Servizio } from '@/lib/types/servizi';

interface AssegnazioneSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  servizio: Servizio;
}

/**
 * @deprecated Use AssignmentPopup instead - this component has been refactored for better mobile UX
 */
export function AssegnazioneSheet(props: AssegnazioneSheetProps) {
  console.warn('[AssegnazioneSheet] This component is deprecated. Use AssignmentPopup instead.');
  return <AssignmentPopup {...props} />;
}
