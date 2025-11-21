
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2, Star } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { AliquotaIvaOption } from "@/lib/types/impostazioni";

interface AliquoteIvaFormProps {
  aliquote: AliquotaIvaOption[];
  onChange: (aliquote: AliquotaIvaOption[]) => void;
}

export function AliquoteIvaForm({ aliquote, onChange }: AliquoteIvaFormProps) {
  const handleAddAliquota = () => {
    const newAliquota: AliquotaIvaOption = {
      id: uuidv4(),
      nome: "",
      percentuale: 0,
      descrizione: "",
      is_default: aliquote.length === 0, // Prima aliquota è default
    };
    
    onChange([...aliquote, newAliquota]);
  };

  const handleRemoveAliquota = (id: string) => {
    onChange(aliquote.filter(aliquota => aliquota.id !== id));
  };

  const handleChangeAliquota = (id: string, field: keyof AliquotaIvaOption, value: any) => {
    const updatedAliquote = aliquote.map(aliquota => {
      if (aliquota.id === id) {
        return {
          ...aliquota,
          [field]: field === 'percentuale' ? Number(value) : value,
        };
      }
      return aliquota;
    });
    
    onChange(updatedAliquote);
  };

  const handleSetDefault = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Rimuovi default da tutte e impostalo solo sulla selezionata
    const updatedAliquote = aliquote.map(aliquota => ({
      ...aliquota,
      is_default: aliquota.id === id,
    }));
    
    onChange(updatedAliquote);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aliquote IVA</CardTitle>
        <CardDescription>
          Configura le aliquote IVA disponibili. Seleziona l'aliquota di default che verrà applicata automaticamente ai nuovi servizi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {aliquote.map((aliquota, index) => (
          <div key={aliquota.id} className="border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
              {/* Radio per default */}
              <div className="md:col-span-1 flex items-center justify-center pt-6">
                <Button
                  type="button"
                  variant={aliquota.is_default ? "default" : "ghost"}
                  size="icon"
                  onClick={(e) => handleSetDefault(e, aliquota.id)}
                  className={`pointer-events-auto ${aliquota.is_default ? 'bg-primary' : ''}`}
                  title={aliquota.is_default ? "Aliquota di default" : "Imposta come default"}
                >
                  <Star className={`h-4 w-4 ${aliquota.is_default ? 'fill-current' : ''}`} />
                </Button>
              </div>

              <div className="md:col-span-3">
                <Label htmlFor={`nome-${aliquota.id}`}>Nome</Label>
                <Input
                  id={`nome-${aliquota.id}`}
                  value={aliquota.nome}
                  onChange={(e) =>
                    handleChangeAliquota(aliquota.id, "nome", e.target.value)
                  }
                  placeholder="Es. Standard, Ridotta"
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor={`percentuale-${aliquota.id}`}>Percentuale (%)</Label>
                <Input
                  id={`percentuale-${aliquota.id}`}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={aliquota.percentuale}
                  onChange={(e) =>
                    handleChangeAliquota(aliquota.id, "percentuale", e.target.value)
                  }
                  placeholder="22"
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-5">
                <Label htmlFor={`descrizione-${aliquota.id}`}>Descrizione</Label>
                <Input
                  id={`descrizione-${aliquota.id}`}
                  value={aliquota.descrizione || ""}
                  onChange={(e) =>
                    handleChangeAliquota(aliquota.id, "descrizione", e.target.value)
                  }
                  placeholder="Descrizione opzionale"
                  className="mt-1"
                />
              </div>
              
              <div className="md:col-span-1 flex justify-end pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAliquota(aliquota.id)}
                  disabled={aliquote.length === 1}
                  title={aliquote.length === 1 ? "Non puoi eliminare l'unica aliquota" : "Elimina aliquota"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {aliquota.is_default && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/10 p-2 rounded">
                <Star className="h-3 w-3 fill-current text-primary" />
                <span>Questa aliquota verrà applicata automaticamente ai nuovi servizi</span>
              </div>
            )}
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddAliquota} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Aliquota IVA
        </Button>
      </CardContent>
    </Card>
  );
}
