
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InfoAziendaFormProps {
  nome: string;
  onChangeNome: (value: string) => void;
  partitaIva: string;
  onChangePartitaIva: (value: string) => void;
  indirizzo: string;
  onChangeIndirizzo: (value: string) => void;
  telefono: string;
  onChangeTelefono: (value: string) => void;
  email: string;
  onChangeEmail: (value: string) => void;
}

export function InfoAziendaForm({
  nome,
  onChangeNome,
  partitaIva,
  onChangePartitaIva,
  indirizzo,
  onChangeIndirizzo,
  telefono,
  onChangeTelefono,
  email,
  onChangeEmail,
}: InfoAziendaFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informazioni Azienda</CardTitle>
        <CardDescription>
          Configura le informazioni generali dell'azienda che appariranno sui documenti
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nome_azienda">Nome Azienda</Label>
          <Input
            id="nome_azienda"
            value={nome}
            onChange={(e) => onChangeNome(e.target.value)}
            placeholder="Nome dell'azienda"
          />
        </div>
        <div>
          <Label htmlFor="partita_iva">Partita IVA</Label>
          <Input
            id="partita_iva"
            value={partitaIva}
            onChange={(e) => onChangePartitaIva(e.target.value)}
            placeholder="Partita IVA"
          />
        </div>
        <div>
          <Label htmlFor="indirizzo">Indirizzo Sede</Label>
          <Input
            id="indirizzo"
            value={indirizzo}
            onChange={(e) => onChangeIndirizzo(e.target.value)}
            placeholder="Indirizzo della sede"
          />
        </div>
        <div>
          <Label htmlFor="telefono">Telefono</Label>
          <Input
            id="telefono"
            value={telefono}
            onChange={(e) => onChangeTelefono(e.target.value)}
            placeholder="Numero di telefono"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="Indirizzo email"
          />
        </div>
      </CardContent>
    </Card>
  );
}
