
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CompletaServizioForm } from "./CompletaServizioForm";
import { Profile } from "@/lib/types";

interface CompletaServizioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  metodoDefault: string;
  onComplete: () => void;
  users: Profile[];
}

export function CompletaServizioSheet({
  open,
  onOpenChange,
  servizioId,
  metodoDefault,
  onComplete,
  users,
}: CompletaServizioSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Completa servizio</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6">
          <CompletaServizioForm 
            servizioId={servizioId}
            metodoDefault={metodoDefault}
            onComplete={onComplete}
            onOpenChange={onOpenChange}
            users={users}
            open={open}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
