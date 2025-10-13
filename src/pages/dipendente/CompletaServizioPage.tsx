import { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DipendenteLayout } from '@/components/layouts/DipendenteLayout';
import { useServizioDettaglio } from '@/hooks/dipendente/useServizioDettaglio';
import { useCompletaServizio } from '@/hooks/dipendente/useCompletaServizio';
import { RiepilogoServizio } from '@/components/dipendente/servizi/completamento/RiepilogoServizio';
import { FirmaDigitaleCanvas, FirmaCanvasRef } from '@/components/dipendente/servizi/completamento/FirmaDigitaleCanvas';
import { NoteCompletamento } from '@/components/dipendente/servizi/completamento/NoteCompletamento';
import { ConfermaCompletamento } from '@/components/dipendente/servizi/completamento/ConfermaCompletamento';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CompletaServizioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const firmaCanvasRef = useRef<FirmaCanvasRef>(null);

  const { servizio, passeggeri, isLoading } = useServizioDettaglio(id);
  const { completaServizio, isCompleting } = useCompletaServizio();

  const [noteCompletamento, setNoteCompletamento] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [firmaError, setFirmaError] = useState('');
  const [confermaError, setConfermaError] = useState('');
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Check if service can be completed
  useEffect(() => {
    if (!isLoading && servizio && servizio.stato !== 'assegnato') {
      toast.error('Questo servizio non può essere completato');
      navigate(`/dipendente/servizi-assegnati/${id}`);
    }
  }, [servizio, isLoading, id, navigate]);

  // Save notes to sessionStorage
  useEffect(() => {
    if (id && noteCompletamento) {
      sessionStorage.setItem(`note-completamento-${id}`, noteCompletamento);
    }
  }, [noteCompletamento, id]);

  // Restore notes from sessionStorage
  useEffect(() => {
    if (id) {
      const saved = sessionStorage.getItem(`note-completamento-${id}`);
      if (saved) {
        setNoteCompletamento(saved);
      }
    }
  }, [id]);

  const handleBack = () => {
    if (!isSignatureEmpty) {
      setShowExitDialog(true);
    } else {
      navigate(`/dipendente/servizi-assegnati/${id}`);
    }
  };

  const handleClose = () => {
    if (!isSignatureEmpty) {
      setShowExitDialog(true);
    } else {
      navigate('/dipendente/servizi-assegnati');
    }
  };

  const handleConfirmExit = () => {
    if (id) {
      sessionStorage.removeItem(`note-completamento-${id}`);
    }
    setShowExitDialog(false);
    navigate('/dipendente/servizi-assegnati');
  };

  const handleCompleta = async () => {
    if (!id || !servizio) return;

    // Reset errors
    setFirmaError('');
    setConfermaError('');

    // Validation
    let hasError = false;

    if (isSignatureEmpty || !firmaCanvasRef.current || firmaCanvasRef.current.isEmpty()) {
      setFirmaError('La firma è obbligatoria');
      hasError = true;
    }

    if (!isConfirmed) {
      setConfermaError('Devi confermare i dati');
      hasError = true;
    }

    if (hasError) {
      toast.error('Completa tutti i campi obbligatori');
      return;
    }

    try {
      // Get signature as dataURL
      const firmaDataURL = firmaCanvasRef.current!.toDataURL('image/png');

      // Complete service
      await completaServizio({
        servizioId: id,
        firmaDataURL,
        noteCompletamento: noteCompletamento || undefined,
      });

      // Clear sessionStorage
      sessionStorage.removeItem(`note-completamento-${id}`);

      // Navigate to detail
      navigate(`/dipendente/servizi-assegnati/${id}`);
    } catch (error) {
      console.error('Error completing service:', error);
    }
  };

  if (isLoading) {
    return (
      <DipendenteLayout>
        <div className="space-y-6 p-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </DipendenteLayout>
    );
  }

  if (!servizio) {
    return (
      <DipendenteLayout>
        <div className="p-4">
          <p>Servizio non trovato</p>
        </div>
      </DipendenteLayout>
    );
  }

  return (
    <DipendenteLayout>
      <div className="space-y-6 p-4 max-w-3xl mx-auto pb-24 md:pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Completa Servizio</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <RiepilogoServizio 
            servizio={servizio} 
            passeggeriCount={passeggeri.length}
          />

          <FirmaDigitaleCanvas
            ref={firmaCanvasRef}
            onSignatureChange={setIsSignatureEmpty}
            error={firmaError}
          />

          <NoteCompletamento
            value={noteCompletamento}
            onChange={setNoteCompletamento}
          />

          <ConfermaCompletamento
            checked={isConfirmed}
            onCheckedChange={setIsConfirmed}
            onAnnulla={handleBack}
            onCompleta={handleCompleta}
            isLoading={isCompleting}
            error={confermaError}
          />
        </div>

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Vuoi uscire?</AlertDialogTitle>
              <AlertDialogDescription>
                La firma inserita verrà persa. Sei sicuro di voler uscire?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmExit}>
                Esci
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DipendenteLayout>
  );
}
