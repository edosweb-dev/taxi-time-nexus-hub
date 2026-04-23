UPDATE public.feedback
SET admin_comment = COALESCE(admin_comment || E'\n\n', '') ||
  '[2026-04-23 fix contabilità] Risolto con batch multi-fase: Batch 1 (formula calcolo stipendio allineata a modello Excel cliente — aggiunto totaleSpeseSocio da spese_aziendali tipologia=spesa, rinominato incassiPersonali, riporto sommato anziché sottratto). Batch 1.5 (fix timezone nel range date del Report Soci — ora coerente al fuso). Batch 2 (auto-recalc a cascata su mutation di spese_aziendali: insert/update/delete triggerano ricalcolo del mese + propagazione dei mesi successivi). Batch 3 (bottone "Ricalcola stipendi anno" in /stipendi per riallineamento storico). Batch 4 (coerenza filtro stato incassi personali: ora solo consuntivato come nel Report Soci). Verificato end-to-end: prelievo Telepass €17,29 visibile ovunque, tutti i riporti mensili dei soci coerenti al centesimo tra Report Soci e pagina Stipendi/DB.'
WHERE id IN (
  '28e56882-04d9-4270-9a79-4a54111c1be2',
  'a6a20449-a75d-45a8-bced-3b2cf9962058',
  'b2ea1352-419a-4860-b407-6a30dc3f4499'
);

UPDATE public.feedback
SET status = 'chiuso',
    resolved_at = COALESCE(resolved_at, now())
WHERE status IN ('nuovo', 'risolto');