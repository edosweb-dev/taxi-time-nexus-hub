
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetClose
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, Calculator } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function StipendiGuida() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Guida al calcolo stipendi</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="space-y-2 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Guida al calcolo stipendi
          </SheetTitle>
          <SheetDescription>
            Questa guida spiega come vengono calcolati gli stipendi nel sistema.
          </SheetDescription>
        </SheetHeader>
        
        <Accordion type="single" collapsible defaultValue="soci" className="w-full">
          <AccordionItem value="soci">
            <AccordionTrigger className="font-semibold">
              Calcolo per SOCI
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <h3 className="text-sm font-semibold">Formula di calcolo base</h3>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm italic mb-3">Base = <span className="font-mono">(Tariffa KM) * (1 + 17%)</span> + <span className="font-mono">(Ore Attesa * Tariffa oraria)</span></p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Individuazione della <strong>tariffa KM base</strong> dalla tabella tariffe</li>
                    <li>Applicazione del <strong>coefficiente di aumento (17%)</strong> alla tariffa base</li>
                    <li>Aggiunta del compenso per <strong>ore di attesa</strong> (ore × tariffa oraria)</li>
                    <li>Calcolo del <strong>totale lordo</strong></li>
                  </ol>
                </CardContent>
              </Card>
              
              <h3 className="text-sm font-semibold">Calcolo detrazioni</h3>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm italic mb-3">Netto = <span className="font-mono">Lordo - Spese - Prelievi + Incassi + Riporto</span></p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li><strong>Spese personali</strong>: detratte dal totale</li>
                    <li><strong>Prelievi</strong>: importi già prelevati durante il mese</li>
                    <li><strong>Incassi da dipendenti</strong>: importi ricevuti da dipendenti</li>
                    <li><strong>Riporto mese precedente</strong>: importo dallo stipendio precedente</li>
                    <li>Calcolo del <strong>totale netto</strong></li>
                  </ol>
                </CardContent>
              </Card>
              
              <h3 className="text-sm font-semibold">Integrazione con servizi</h3>
              <Card>
                <CardContent className="pt-4">
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Il sistema può calcolare <strong>automaticamente i KM totali</strong> dai servizi assegnati nel mese</li>
                    <li>I KM sono calcolati sui servizi con stato <strong>completato</strong> o <strong>consuntivato</strong></li>
                    <li>Si considera una <strong>media di 45 KM per servizio</strong> (in attesa dell'algoritmo preciso)</li>
                  </ol>
                </CardContent>
              </Card>
              
              <h3 className="text-sm font-semibold">Esempio</h3>
              <Card>
                <CardContent className="pt-4 space-y-2 text-sm">
                  <p>Per un socio con 200 KM percorsi e 3 ore di attesa:</p>
                  <p>1. Tariffa base per 200 KM: <strong>€56,00</strong></p>
                  <p>2. Applicazione aumento 17%: <strong>€65,52</strong></p>
                  <p>3. Ore attesa (3 × €15): <strong>€45,00</strong></p>
                  <p>4. Totale lordo: <strong>€110,52</strong></p>
                  <p>5. Meno spese personali: <strong>-€20,00</strong></p>
                  <p>6. Meno prelievi: <strong>-€30,00</strong></p>
                  <p>7. Più incassi: <strong>+€15,00</strong></p>
                  <p>8. Più riporto: <strong>+€5,00</strong></p>
                  <p className="font-semibold">Totale netto: €80,52</p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="dipendenti">
            <AccordionTrigger className="font-semibold">
              Calcolo per DIPENDENTI
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <h3 className="text-sm font-semibold">Formula di calcolo</h3>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm italic mb-3">Stipendio = <span className="font-mono">Ore Lavorate * Tariffa Oraria</span></p>
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Moltiplicazione delle <strong>ore lavorate</strong> per la <strong>tariffa oraria</strong></li>
                    <li>Il risultato è il <strong>totale lordo</strong></li>
                  </ol>
                </CardContent>
              </Card>
              
              <h3 className="text-sm font-semibold">Integrazione con servizi</h3>
              <Card>
                <CardContent className="pt-4">
                  <ol className="list-decimal pl-5 space-y-2 text-sm">
                    <li>Il sistema può calcolare <strong>automaticamente le ore lavorate</strong> dai servizi completati nel mese</li>
                    <li>Si utilizzano le ore registrate nei campi <strong>ore_effettive</strong> o <strong>ore_lavorate</strong> dei servizi</li>
                    <li>Si considerano servizi con stato <strong>completato</strong> o <strong>consuntivato</strong></li>
                  </ol>
                </CardContent>
              </Card>
              
              <h3 className="text-sm font-semibold">Esempio</h3>
              <Card>
                <CardContent className="pt-4 space-y-2 text-sm">
                  <p>Per un dipendente con 40 ore lavorate e tariffa di €12/ora:</p>
                  <p>Calcolo: 40 ore × €12/ora = <strong>€480,00</strong></p>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="stato">
            <AccordionTrigger className="font-semibold">
              Stati dello stipendio
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p><strong>Bozza</strong>: Lo stipendio è stato calcolato ma non è ancora confermato. Può essere modificato.</p>
              <p><strong>Confermato</strong>: Lo stipendio è stato verificato e approvato. Non può più essere modificato, ma non è ancora stato pagato.</p>
              <p><strong>Pagato</strong>: Lo stipendio è stato pagato e viene automaticamente creata una spesa aziendale corrispondente.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="note">
            <AccordionTrigger className="font-semibold">
              Note importanti
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p>- Le <strong>tariffe KM</strong> sono configurate per anno nella tabella tariffe.</p>
              <p>- Oltre i 215 KM si applica la formula <strong>KM × 0,28€</strong>.</p>
              <p>- Se un socio non ha servizi assegnati, è possibile inserire manualmente i KM.</p>
              <p>- Una volta <strong>confermato</strong> uno stipendio, non può più essere modificato.</p>
              <p>- Quando uno stipendio viene marcato come <strong>pagato</strong>, viene creata automaticamente una spesa aziendale.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <div className="mt-6 flex justify-end">
          <SheetClose asChild>
            <Button>Chiudi guida</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
