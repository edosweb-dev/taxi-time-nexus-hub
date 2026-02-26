import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

/*
 * ============================================================
 * ANALYSIS: ServizioCreaPage.tsx Form Structure (2362 lines)
 * ============================================================
 * 
 * FILE: src/pages/servizi/ServizioCreaPage.tsx
 * SCHEMA: servizioSchemaCompleto (lines 103-174)
 * FORM TYPE: z.infer<typeof servizioSchemaCompleto> (line 176)
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 0: TIPO CLIENTE (lines 1516-1542)
 * ─────────────────────────────────────────────────────────
 * - Controller: tipo_cliente → Select (azienda | privato)
 * - Hidden in "veloce" mode
 * - Icon: User
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 1: AZIENDA E CONTATTO (lines 1544-1689)
 * ─────────────────────────────────────────────────────────
 * Components used:
 *   - <AziendaSelectField /> (from @/components/servizi/AziendaSelectField)
 *   - <ReferenteSelectField aziendaId={watchAziendaId} /> (from @/components/servizi/ReferenteSelectField)
 *   - Input type="date" → data_servizio (form.register)
 *   - Input type="time" → orario_servizio (form.register)
 *   - Input text → numero_commessa (form.register)
 *   - <ClientePrivatoFields /> (shown when tipo_cliente === 'privato')
 * Dependencies:
 *   - watchTipoCliente, watchAziendaId, errors
 *   - isVeloce flag
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 2: PERCORSO → REMOVED
 * ─────────────────────────────────────────────────────────
 * - Addresses derived from first passenger
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 3: PASSEGGERI (lines 1693-1721)
 * ─────────────────────────────────────────────────────────
 * Component:
 *   - <PasseggeroForm /> (from @/components/servizi/passeggeri/PasseggeroForm)
 * Props:
 *   - tipo_cliente, showPresaIntermedia=true
 *   - orarioServizio, indirizzoServizio, cittaServizio
 *   - destinazioneServizio, cittaDestinazioneServizio
 *   - clientePrivatoData (conditional)
 * Shown when: !isVeloce && ((azienda + aziendaId) || privato)
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 4: DETTAGLI ECONOMICI (lines 1723-1898)
 * ─────────────────────────────────────────────────────────
 * Components:
 *   - Controller: metodo_pagamento → Select (from impostazioni query)
 *   - Controller: iva → Select (aliquote from impostazioni)
 *   - Controller: incasso_previsto → Input number (NETTO)
 *   - Calculated: importo_totale_calcolato (NETTO + IVA)
 *   - Controller: applica_provvigione → Checkbox
 *   - Controller: consegna_contanti_a → Select (shown when metodo=Contanti)
 * Dependencies:
 *   - metodiPagamento (from useQuery impostazioni)
 *   - aliquoteIva (from useQuery impostazioni)
 *   - mostraIva (derived from metodo pagamento config)
 *   - dipendenti (for consegna_contanti_a)
 *   - provvigioneObbligatoria (from azienda config)
 * Hidden: in veloce mode or when stato=consuntivato
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 5: ASSEGNAZIONE (lines 1899-1999)
 * ─────────────────────────────────────────────────────────
 * Components:
 *   - Controller: conducente_esterno → Checkbox
 *   - Controller: assegnato_a → Select (dipendenti) [if !conducente_esterno]
 *   - Controller: conducente_esterno_id → Select (conducenti_esterni) [if conducente_esterno]
 *   - Controller: veicolo_id → Select (veicoli)
 * Dependencies:
 *   - dipendenti (useQuery profiles)
 *   - conducentiEsterni (useQuery conducenti_esterni)
 *   - veicoli (useQuery veicoli)
 * Hidden: in veloce mode or when stato=consuntivato
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 6: NOTE (lines 2001-2020)
 * ─────────────────────────────────────────────────────────
 * - Textarea → note (form.register)
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE 7: EMAIL NOTIFICHE (lines 2022-2166)
 * ─────────────────────────────────────────────────────────
 * - Controller: email_notifiche_ids → Checkbox list
 * - Dialog for creating new email
 * - Only for aziende, not veloce, not consuntivato
 * Dependencies:
 *   - emailNotifiche (useQuery email_notifiche)
 *   - handleCreateEmail function
 * 
 * ─────────────────────────────────────────────────────────
 * SEZIONE CONSUNTIVO (lines 2168-2362)
 * ─────────────────────────────────────────────────────────
 * - Only in edit mode when stato=consuntivato
 * - Fields: metodo_pagamento, incasso_ricevuto, ore_sosta, km_totali
 * - applica_provvigione checkbox
 * - Note field
 * 
 * ─────────────────────────────────────────────────────────
 * DATA QUERIES (lines 500-751)
 * ─────────────────────────────────────────────────────────
 * 1. aziende → useQuery("aziende")
 * 2. impostazioniData → useQuery("impostazioni") [metodi_pagamento, aliquote_iva]
 * 3. dipendenti → useQuery("dipendenti") [profiles where role in admin/socio/dipendente]
 * 4. veicoli → useQuery("veicoli") [attivo=true]
 * 5. conducentiEsterni → useQuery("conducenti-esterni") [attivo=true]
 * 6. passeggeri → useQuery("passeggeri", aziendaId) [tipo=rubrica]
 * 7. emailNotifiche → useQuery("email-notifiche", aziendaId) [attivo=true]
 * 
 * ─────────────────────────────────────────────────────────
 * BUSINESS LOGIC (useEffects)
 * ─────────────────────────────────────────────────────────
 * 1. Provvigione auto-set based on azienda config (lines 517-524)
 * 2. Default IVA on mount in create mode (lines 557-566)
 * 3. IVA auto-set when metodo_pagamento changes (lines 568-599)
 * 4. Importo totale calculation (NETTO + IVA) (lines 615-632)
 * 
 * ─────────────────────────────────────────────────────────
 * STRATEGY FOR ServizioFormFields.tsx
 * ─────────────────────────────────────────────────────────
 * Phase 1 (current): Placeholder fields
 * Phase 2: Copy JSX sections 0-7 into this component
 * Phase 3: Move data queries here (or accept via props)
 * Phase 4: Move business logic useEffects
 * 
 * KEY DECISION: Should queries live in the page or in FormFields?
 * → Recommend: queries in page, pass data as props to FormFields
 * → This keeps FormFields a pure UI component
 */

interface ServizioFormFieldsProps {
  form: UseFormReturn<any>;
  mode: 'create' | 'edit';
}

export const ServizioFormFields = ({ form, mode }: ServizioFormFieldsProps) => {
  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-sm font-medium text-primary">
          ℹ️ Form {mode === 'edit' ? 'modifica' : 'creazione'} — versione semplificata.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          I campi completi verranno aggiunti incrementalmente copiando da ServizioCreaPage.tsx.
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

      {/* Analysis / TODO */}
      <div className="bg-accent/50 border border-border rounded-lg p-4">
        <p className="text-sm font-medium text-foreground mb-2">📋 Sezioni da copiare da ServizioCreaPage:</p>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>⬜ <strong>Sez. 0</strong> — Tipo Cliente (Select azienda/privato)</li>
          <li>⬜ <strong>Sez. 1</strong> — Azienda + Referente + Data/Ora + Commessa + ClientePrivato</li>
          <li>⬜ <strong>Sez. 3</strong> — Passeggeri (PasseggeroForm component)</li>
          <li>⬜ <strong>Sez. 4</strong> — Dettagli Economici (pagamento, IVA, incasso, provvigione)</li>
          <li>⬜ <strong>Sez. 5</strong> — Assegnazione (autista interno/esterno + veicolo)</li>
          <li>⬜ <strong>Sez. 6</strong> — Note</li>
          <li>⬜ <strong>Sez. 7</strong> — Email Notifiche</li>
          <li>⬜ <strong>Consuntivo</strong> — Solo edit mode + stato=consuntivato</li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
          📂 Queries necessarie: aziende, impostazioni, dipendenti, veicoli, conducenti_esterni, passeggeri, email_notifiche
        </p>
      </div>
    </div>
  );
};
