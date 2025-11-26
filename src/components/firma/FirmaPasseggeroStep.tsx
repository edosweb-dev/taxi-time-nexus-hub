import React from "react";
import { SignatureCanvas } from "./SignatureCanvas";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FirmaPasseggeroStepProps {
  passeggeroNome: string;
  passeggeroIndex: number;
  totalPasseggeri: number;
  onSave: (signatureData: string) => void;
  isLast?: boolean;
}

export function FirmaPasseggeroStep({
  passeggeroNome,
  passeggeroIndex,
  totalPasseggeri,
  onSave,
  isLast = false,
}: FirmaPasseggeroStepProps) {
  const buttonText = isLast ? "Completa ✓" : "Salva e Avanti →";
  return (
    <div className="space-y-6">
      {/* Titolo prominente */}
      <div className="text-center py-4 border-b">
        <h2 className="text-2xl font-bold text-primary">
          FIRMA PASSEGGERO {passeggeroIndex + 1} di {totalPasseggeri}
        </h2>
      </div>

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
        <SignatureCanvas onSave={onSave} buttonText={buttonText} />
      </div>
    </div>
  );
}
