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
    <div className="space-y-4">
      {/* Header con info passeggero - compatto */}
      <Card className="border-primary bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1">{passeggeroNome}</h3>
              <p className="text-sm text-muted-foreground">
                📱 Passa il dispositivo al passeggero per firmare
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas firma - focus principale */}
      <div className="space-y-3">
        <SignatureCanvas 
          key={passeggeroIndex} 
          onSave={onSave} 
          buttonText={buttonText} 
        />
      </div>
    </div>
  );
}
