import { useNavigate } from "react-router-dom";
import { useServizioDettaglio } from "@/hooks/dipendente/useServizioDettaglio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ServizioHeader } from "./dettaglio/ServizioHeader";
import { DettagliGenerali } from "./dettaglio/DettagliGenerali";
import { PercorsoCard } from "./dettaglio/PercorsoCard";
import { VeicoloCard } from "./dettaglio/VeicoloCard";
import { PasseggeriCard } from "./dettaglio/PasseggeriCard";
import { NoteCard } from "./dettaglio/NoteCard";
import { StatoServizioCard } from "./dettaglio/StatoServizioCard";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ServizioDetailSheetProps {
  servizioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ServizioDetailSheet({ servizioId, isOpen, onClose }: ServizioDetailSheetProps) {
  const navigate = useNavigate();
  const { servizio, passeggeri, isLoading, error } = useServizioDettaglio(servizioId);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error('Errore nel caricamento del servizio');
      onClose();
    }
  }, [error, onClose]);

  const handleCompleta = () => {
    if (servizio?.id) {
      navigate(`/dipendente/servizi-assegnati/${servizio.id}/completa`);
    }
  };

  const content = (
    <div className="space-y-4">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </>
      ) : servizio ? (
        <>
          <ServizioHeader
            numeroServizio={servizio.id_progressivo || servizio.id}
            stato={servizio.stato}
            onBack={isMobile ? onClose : undefined}
            onClose={onClose}
            isMobile={isMobile}
          />

          <div className="space-y-4">
            <DettagliGenerali
              aziendaNome={servizio.azienda_nome}
              dataServizio={servizio.data_servizio}
              orarioServizio={servizio.orario_servizio}
              numeroCommessa={servizio.numero_commessa}
              metodoPagamento={servizio.metodo_pagamento}
              assegnatoANome={servizio.assegnato_a_nome}
              assegnatoACognome={servizio.assegnato_a_cognome}
            />

            <PercorsoCard
              indirizzoPresa={servizio.indirizzo_presa}
              cittaPresa={servizio.citta_presa}
              indirizzoDestinazione={servizio.indirizzo_destinazione}
              cittaDestinazione={servizio.citta_destinazione}
            />

            <VeicoloCard
              modello={servizio.veicolo_modello}
              targa={servizio.veicolo_targa}
              numeroPosti={servizio.veicolo_numero_posti}
            />

            <PasseggeriCard
              passeggeri={passeggeri}
              orarioServizio={servizio.orario_servizio}
              indirizzoPresa={servizio.indirizzo_presa}
            />

            <NoteCard note={servizio.note} />

            <StatoServizioCard
              stato={servizio.stato}
              onCompleta={handleCompleta}
              firmaUrl={servizio.firma_url}
              firmaTimestamp={servizio.firma_timestamp}
              incassoRicevuto={servizio.incasso_ricevuto}
              oreEffettive={servizio.ore_effettive}
              oreFatturate={servizio.ore_fatturate}
              iva={servizio.iva}
            />
          </div>
        </>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <ScrollArea className="h-full px-4 pb-8">
            {content}
          </ScrollArea>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-6">
        <ScrollArea className="h-full pr-4">
          {content}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
