import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ServizioFormFieldsProps {
  form: UseFormReturn<any>;
  mode: 'create' | 'edit';
}

/**
 * Shared form fields for servizio create/edit.
 * Currently a placeholder with basic fields — will be expanded
 * incrementally with full UI from ServizioCreaPage.
 */
export const ServizioFormFields = ({ form, mode }: ServizioFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm font-medium text-primary">
          ℹ️ Form {mode === 'edit' ? 'modifica' : 'creazione'} — versione semplificata.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          I campi completi (azienda, passeggeri, autocomplete indirizzi, ecc.) verranno aggiunti incrementalmente.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Indirizzo Partenza</label>
          <Input {...form.register('indirizzo_presa')} placeholder="Indirizzo di partenza" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Indirizzo Destinazione</label>
          <Input {...form.register('indirizzo_destinazione')} placeholder="Indirizzo di destinazione" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Metodo Pagamento</label>
          <Input {...form.register('metodo_pagamento')} placeholder="Metodo di pagamento" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Note</label>
          <Textarea {...form.register('note')} placeholder="Note aggiuntive..." rows={3} />
        </div>
      </div>

      {/* TODO list */}
      <div className="bg-accent/50 border border-border rounded-lg p-4">
        <p className="text-sm font-medium text-foreground mb-2">📋 Campi da aggiungere:</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Selezione Azienda (dropdown)</li>
          <li>Data / Orario Servizio</li>
          <li>Gestione Passeggeri</li>
          <li>Indirizzi con Google Autocomplete</li>
          <li>Metodo Pagamento (dropdown)</li>
          <li>Importo / Incasso</li>
          <li>Assegnazione Autista / Veicolo</li>
          <li>Stato Servizio</li>
        </ul>
      </div>
    </div>
  );
};
