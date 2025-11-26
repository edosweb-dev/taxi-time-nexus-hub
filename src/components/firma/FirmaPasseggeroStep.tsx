import React from "react";
import { SignatureCanvas } from "./SignatureCanvas";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FirmaPasseggeroStepProps {
  passeggeroNome: string;
  passeggeroIndex: number;
  totalPasseggeri: number;
  onSave: (signatureData: string) => void;
}

export function FirmaPasseggeroStep({
  passeggeroNome,
  passeggeroIndex,
  totalPasseggeri,
  onSave,
}: FirmaPasseggeroStepProps) {
  return (
    <div className="space-y-6">
      {/* Header con info passeggero */}
      <Card className="border-primary bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{passeggeroNome}</div>
              <div className="text-sm font-normal text-muted-foreground">
                Passeggero {passeggeroIndex + 1} di {totalPasseggeri}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            📱 Passa il dispositivo a <strong>{passeggeroNome}</strong> per la firma digitale
          </p>
        </CardContent>
      </Card>

      {/* Canvas firma */}
      <div className="space-y-2">
        <h3 className="text-base font-medium">Firma del passeggero</h3>
        <SignatureCanvas onSave={onSave} />
      </div>
    </div>
  );
}
