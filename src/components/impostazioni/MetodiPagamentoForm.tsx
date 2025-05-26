
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { MetodoPagamentoOption, AliquotaIvaOption } from "@/lib/types/impostazioni";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MetodiPagamentoFormProps {
  metodi: MetodoPagamentoOption[];
  aliquoteIva: AliquotaIvaOption[];
  onChange: (metodi: MetodoPagamentoOption[]) => void;
}

export function MetodiPagamentoForm({ metodi, aliquoteIva, onChange }: MetodiPagamentoFormProps) {
  const handleAddMetodo = () => {
    const newMetodo: MetodoPagamentoOption = {
      id: uuidv4(),
      nome: "",
      iva_applicabile: false,
      aliquota_iva: aliquoteIva.length > 0 ? aliquoteIva[0].id : undefined,
      report_attivo: false
    };
    
    onChange([...metodi, newMetodo]);
  };

  const handleRemoveMetodo = (id: string) => {
    onChange(metodi.filter(metodo => metodo.id !== id));
  };

  const handleChangeMetodo = (id: string, field: keyof MetodoPagamentoOption, value: any) => {
    const updatedMetodi = metodi.map(metodo => {
      if (metodo.id === id) {
        return {
          ...metodo,
          [field]: value,
        };
      }
      return metodo;
    });
    
    onChange(updatedMetodi);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metodi di Pagamento</CardTitle>
        <CardDescription>
          Configura i metodi di pagamento disponibili e associa le aliquote IVA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {metodi.map((metodo) => (
          <div key={metodo.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b pb-4">
            <div className="md:col-span-4">
              <Label htmlFor={`nome-${metodo.id}`}>Nome</Label>
              <Input
                id={`nome-${metodo.id}`}
                value={metodo.nome}
                onChange={(e) =>
                  handleChangeMetodo(metodo.id, "nome", e.target.value)
                }
                placeholder="Nome metodo di pagamento"
              />
            </div>
            
            <div className="md:col-span-2 flex items-center space-x-2 mt-4 md:mt-0">
              <Checkbox
                id={`iva-${metodo.id}`}
                checked={metodo.iva_applicabile === true}
                onCheckedChange={(checked) =>
                  handleChangeMetodo(metodo.id, "iva_applicabile", checked === true)
                }
              />
              <Label htmlFor={`iva-${metodo.id}`}>Applica IVA</Label>
            </div>
            
            <div className="md:col-span-3">
              <Label htmlFor={`aliquota-${metodo.id}`}>Aliquota IVA</Label>
              <Select
                disabled={!metodo.iva_applicabile}
                value={metodo.aliquota_iva || ""}
                onValueChange={(value) =>
                  handleChangeMetodo(metodo.id, "aliquota_iva", value)
                }
              >
                <SelectTrigger id={`aliquota-${metodo.id}`}>
                  <SelectValue placeholder="Seleziona aliquota" />
                </SelectTrigger>
                <SelectContent>
                  {aliquoteIva.map((aliquota) => (
                    <SelectItem key={aliquota.id} value={aliquota.id}>
                      {aliquota.nome} ({aliquota.percentuale}%)
                    </SelectItem>
                  ))}
                  {aliquoteIva.length === 0 && (
                    <SelectItem disabled value="none">
                      Nessuna aliquota disponibile
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-center space-x-2 mt-4 md:mt-0">
              <Checkbox
                id={`report-${metodo.id}`}
                checked={metodo.report_attivo === true}
                onCheckedChange={(checked) =>
                  handleChangeMetodo(metodo.id, "report_attivo", checked === true)
                }
              />
              <Label htmlFor={`report-${metodo.id}`}>Report attivo</Label>
            </div>
            
            <div className="md:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMetodo(metodo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddMetodo} className="w-full">
          <PlusCircle className="mr-2 h-4 w-4" />
          Aggiungi Metodo di Pagamento
        </Button>
      </CardContent>
    </Card>
  );
}
