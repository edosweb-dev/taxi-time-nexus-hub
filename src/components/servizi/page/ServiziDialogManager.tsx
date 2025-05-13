
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Servizio } from "@/lib/types/servizi";
import { useUsers } from "@/hooks/useUsers";
import { AssegnazioneDialog } from "../AssegnazioneDialog";
import { CompletaServizioDialog } from "../CompletaServizioDialog";
import { FirmaServizio } from "../../firma/FirmaServizio";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

interface ServiziDialogManagerProps {
  onRefetch: (options?: RefetchOptions) => Promise<QueryObserverResult<Servizio[], Error>>;
}

export const ServiziDialogManager = ({ onRefetch }: ServiziDialogManagerProps) => {
  const navigate = useNavigate();
  const { users } = useUsers();
  
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [showAssegnazioneDialog, setShowAssegnazioneDialog] = useState(false);
  const [showCompletaDialog, setShowCompletaDialog] = useState(false);
  const [showFirmaDialog, setShowFirmaDialog] = useState(false);
  
  const handleSelectServizio = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowAssegnazioneDialog(true);
  };
  
  const handleCompleta = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowCompletaDialog(true);
  };
  
  const handleFirma = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowFirmaDialog(true);
  };
  
  const handleDialogClose = () => {
    setShowAssegnazioneDialog(false);
    setShowCompletaDialog(false);
    setShowFirmaDialog(false);
    setSelectedServizio(null);
    onRefetch();
  };

  return (
    <>
      {selectedServizio && (
        <>
          <AssegnazioneDialog
            servizio={selectedServizio}
            users={users.filter(u => u.role === 'dipendente' || u.role === 'socio')}
            open={showAssegnazioneDialog}
            onOpenChange={setShowAssegnazioneDialog}
            onClose={handleDialogClose}
          />
          
          <CompletaServizioDialog
            servizioId={selectedServizio.id}
            metodoDefault={selectedServizio.metodo_pagamento}
            open={showCompletaDialog}
            onOpenChange={setShowCompletaDialog}
            onComplete={handleDialogClose}
            users={users}
          />
          
          {showFirmaDialog && (
            <FirmaServizio
              servizioId={selectedServizio.id}
              open={showFirmaDialog}
              onOpenChange={setShowFirmaDialog}
              onFirmaSalvata={handleDialogClose}
              onComplete={handleDialogClose}
            />
          )}
        </>
      )}
    </>
  );
};
