
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Servizio } from "@/lib/types/servizi";
import { useUsers } from "@/hooks/useUsers";
import { AssegnazioneSheet } from "../assegnazione";
import { CompletaServizioSheet } from "../completamento";
import { FirmaServizio } from "../../firma/FirmaServizio";
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query";

interface ServiziDialogManagerProps {
  onRefetch: (options?: RefetchOptions) => Promise<QueryObserverResult<Servizio[], Error>>;
  selectedServizio: Servizio | null;
  showAssegnazioneDialog: boolean;
  setShowAssegnazioneDialog: (show: boolean) => void;
  showCompletaDialog: boolean;
  setShowCompletaDialog: (show: boolean) => void;
  showFirmaDialog: boolean;
  setShowFirmaDialog: (show: boolean) => void;
  onClose: () => void;
}

export const ServiziDialogManager = ({ 
  onRefetch,
  selectedServizio,
  showAssegnazioneDialog,
  setShowAssegnazioneDialog,
  showCompletaDialog,
  setShowCompletaDialog,
  showFirmaDialog,
  setShowFirmaDialog,
  onClose
}: ServiziDialogManagerProps) => {
  const navigate = useNavigate();
  const { users } = useUsers();
  
  const handleDialogClose = () => {
    onClose();
    onRefetch();
  };

  return (
    <>
      {selectedServizio && (
        <>
          <AssegnazioneSheet
            servizio={selectedServizio}
            open={showAssegnazioneDialog}
            onOpenChange={setShowAssegnazioneDialog}
            onClose={handleDialogClose}
          />
          
          <CompletaServizioSheet
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
