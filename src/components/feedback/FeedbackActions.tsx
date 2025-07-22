import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Feedback {
  id: string;
  status: string;
}

interface FeedbackActionsProps {
  feedback: Feedback;
  onEdit: (feedback: Feedback) => void;
  onQuickStatusChange: (feedbackId: string, status: string) => void;
}

export function FeedbackActions({ feedback, onEdit, onQuickStatusChange }: FeedbackActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(feedback)}>
          <Edit className="h-4 w-4 mr-2" />
          Gestisci
        </DropdownMenuItem>
        
        {feedback.status !== 'in_lavorazione' && (
          <DropdownMenuItem 
            onClick={() => onQuickStatusChange(feedback.id, 'in_lavorazione')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Segna in lavorazione
          </DropdownMenuItem>
        )}
        
        {feedback.status !== 'risolto' && (
          <DropdownMenuItem 
            onClick={() => onQuickStatusChange(feedback.id, 'risolto')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Segna come risolto
          </DropdownMenuItem>
        )}
        
        {feedback.status !== 'chiuso' && (
          <DropdownMenuItem 
            onClick={() => onQuickStatusChange(feedback.id, 'chiuso')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Chiudi feedback
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}