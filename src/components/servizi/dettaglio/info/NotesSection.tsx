
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Servizio } from "@/lib/types/servizi";

interface NotesSectionProps {
  servizio: Servizio;
}

export function NotesSection({ servizio }: NotesSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-1">📝 Note aggiuntive</h3>
      <p className="text-sm text-muted-foreground mb-4">Informazioni e dettagli extra</p>
      
      {servizio.note ? (
        <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-blue-200">
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{servizio.note}</p>
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground italic">Nessuna nota aggiuntiva disponibile</p>
        </div>
      )}
    </div>
  );
}
