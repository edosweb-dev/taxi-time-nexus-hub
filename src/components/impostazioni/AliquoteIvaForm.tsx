
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aliquote IVA</CardTitle>
        <CardDescription>
          Configura le aliquote IVA disponibili per i metodi di pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {aliquote.map((aliquota) => (
          <div key={aliquota.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b pb-4">
            <div className="md:col-span-3">
              <Label htmlFor={`nome-${aliquota.id}`}>Nome</Label>
              <Input
                id={`nome-${aliquota.id}`}
                value={aliquota.nome}
                onChange={(e) =>
                  handleChangeAliquota(aliquota.id, "nome", e.target.value)
                }
                placeholder="Es. Standard, Ridotta, Esente"
              />
            </div>
            
            <div className="md:col-span-3">
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
              />
            </div>
            
            <div className="md:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAliquota(aliquota.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
