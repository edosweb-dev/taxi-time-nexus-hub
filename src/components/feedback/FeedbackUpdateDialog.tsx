import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useFeedback } from '@/hooks/useFeedback';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';

interface Feedback {
  id: string;
  tipo: string;
  pagina: string;
  messaggio: string;
  email: string | null;
  status: string;
  admin_comment: string | null;
  created_at: string;
}

interface FeedbackUpdateDialogProps {
  feedback: Feedback | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function FeedbackUpdateDialog({ 
  feedback, 
  open, 
  onOpenChange, 
  onUpdate 
}: FeedbackUpdateDialogProps) {
  const [status, setStatus] = useState(feedback?.status || 'nuovo');
  const [adminComment, setAdminComment] = useState(feedback?.admin_comment || '');
  const { updateFeedback, isUpdating } = useFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback) return;

    try {
      await updateFeedback(feedback.id, {
        status,
        admin_comment: adminComment || undefined,
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestisci Feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dettagli Feedback */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status attuale:</span>
              <FeedbackStatusBadge status={feedback.status} />
            </div>
            <div>
              <span className="font-medium">Tipo:</span> {feedback.tipo}
            </div>
            <div>
              <span className="font-medium">Pagina:</span> {feedback.pagina}
            </div>
            <div>
              <span className="font-medium">Messaggio:</span>
              <p className="mt-1 text-sm">{feedback.messaggio}</p>
            </div>
            {feedback.email && (
              <div>
                <span className="font-medium">Email:</span> {feedback.email}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Nuovo Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuovo">Nuovo</SelectItem>
                  <SelectItem value="in_lavorazione">In Lavorazione</SelectItem>
                  <SelectItem value="risolto">Risolto</SelectItem>
                  <SelectItem value="chiuso">Chiuso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_comment">Commento Admin</Label>
              <Textarea
                id="admin_comment"
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Aggiungi un commento o note per questo feedback..."
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Aggiornamento...' : 'Aggiorna Feedback'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}