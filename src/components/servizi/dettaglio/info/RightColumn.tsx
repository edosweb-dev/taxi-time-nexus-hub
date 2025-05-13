
import React from "react";
import { Servizio } from "@/lib/types/servizi";
import { AddressSection } from "./AddressSection";
import { NotesSection } from "./NotesSection";

interface RightColumnProps {
  servizio: Servizio;
}

export function RightColumn({ servizio }: RightColumnProps) {
  return (
    <div className="space-y-4">
      <AddressSection servizio={servizio} />
      <NotesSection servizio={servizio} />
    </div>
  );
}
