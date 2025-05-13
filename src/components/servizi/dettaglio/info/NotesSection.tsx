
import React from "react";
import { Separator } from "@/components/ui/separator";
import { Servizio } from "@/lib/types/servizi";

interface NotesSectionProps {
  servizio: Servizio;
}

export function NotesSection({ servizio }: NotesSectionProps) {
  if (!servizio.note) {
    return null;
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium">Note</h3>
      <Separator className="my-2" />
      <p className="text-muted-foreground whitespace-pre-wrap">{servizio.note}</p>
    </div>
  );
}
