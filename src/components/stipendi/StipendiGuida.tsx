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
import { HelpCircle, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            Questa guida spiega come vengono calcolati gli stipendi per i SOCI nel sistema.
          </SheetDescription>
        </SheetHeader>
        
        <Accordion type="single" collapsible defaultValue="formula" className="w-full">
          <AccordionItem value="formula">
            <AccordionTrigger className="font-semibold">
              Formula Principale
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <Card className="bg-primary/10 border-primary">
                <CardContent className="pt-4">
                  <p className="text-lg font-bold text-center">
                    TOTALE NETTO = ENTRATE - USCITE
                  </p>
                </CardContent>
              </Card>
              
              <p className="text-sm text-muted-foreground">
                Il calcolo dello stipendio si basa sulla differenza tra tutte le entrate 
                (compensi e crediti) e tutte le uscite (importi da restituire o già anticipati).
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="entrate">
            <AccordionTrigger className="font-semibold">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                ENTRATE (cosa ti spetta)
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <Card className="border-green-500 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                    <TrendingUp className="h-4 w-4" />
                    Voci che aumentano il netto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      <div>
                        <p className="font-medium">Compensi KM servizi</p>
                        <p className="text-muted-foreground text-xs">
                          Base calcolata dalla tabella tariffe × coefficiente 22%
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      <div>
                        <p className="font-medium">Compensi Ore attesa</p>
                        <p className="text-muted-foreground text-xs">
                          Ore di sosta × €18/ora
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      <div>
                        <p className="font-medium">Spese personali approvate</p>
                        <p className="text-muted-foreground text-xs">
                          Spese anticipate dal socio che vengono rimborsate
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      <div>
                        <p className="font-medium">Versamenti socio</p>
                        <p className="text-muted-foreground text-xs">
                          Depositi fatti dal socio in cassa aziendale
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">+</span>
                      <div>
                        <p className="font-medium">Riporto mese precedente (se positivo)</p>
                        <p className="text-muted-foreground text-xs">
                          Credito residuo dal mese scorso
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="uscite">
            <AccordionTrigger className="font-semibold">
              <span className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                USCITE (cosa devi restituire)
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <Card className="border-red-500 border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <TrendingDown className="h-4 w-4" />
                    Voci che riducono il netto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">−</span>
                      <div>
                        <p className="font-medium">Prelievi socio</p>
                        <p className="text-muted-foreground text-xs">
                          Anticipi già ricevuti durante il mese
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">−</span>
                      <div>
                        <p className="font-medium">Incassi da dipendenti</p>
                        <p className="text-muted-foreground text-xs">
                          Contanti ricevuti da altri autisti (da versare in cassa)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">−</span>
                      <div>
                        <p className="font-medium">Contanti servizi</p>
                        <p className="text-muted-foreground text-xs">
                          Incassi propri dai servizi pagati in contanti
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">−</span>
                      <div>
                        <p className="font-medium">Riporto mese precedente (se negativo)</p>
                        <p className="text-muted-foreground text-xs">
                          Debito residuo dal mese scorso
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="esempio">
            <AccordionTrigger className="font-semibold">
              Esempio Pratico
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Esempio di calcolo per un socio nel mese:
              </p>
              
              <Card className="border-green-500 border-2">
                <CardHeader className="pb-2 bg-green-50">
                  <CardTitle className="text-sm text-green-700">ENTRATE</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>+ Compensi KM (390 km)</span>
                    <span className="font-mono">€167,71</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+ Ore attesa</span>
                    <span className="font-mono">€0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+ Spese personali</span>
                    <span className="font-mono">€0,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+ Versamenti</span>
                    <span className="font-mono">€3.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>+ Riporto precedente</span>
                    <span className="font-mono">€134,73</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>= Totale Entrate</span>
                    <span className="font-mono text-green-700">€3.302,44</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-red-500 border-2">
                <CardHeader className="pb-2 bg-red-50">
                  <CardTitle className="text-sm text-red-700">USCITE</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>− Prelievi</span>
                    <span className="font-mono">€1.000,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Incassi da dipendenti</span>
                    <span className="font-mono">€100,00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>− Contanti servizi</span>
                    <span className="font-mono">€280,00</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                    <span>= Totale Uscite</span>
                    <span className="font-mono text-red-700">€1.380,00</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-primary/10 border-primary border-2">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">TOTALE NETTO</span>
                    <span className="font-mono font-bold text-lg">
                      €3.302,44 − €1.380,00 = <span className="text-primary">€1.922,44</span>
                    </span>
                  </div>
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
              <p><strong>Confermato</strong>: Lo stipendio è stato verificato e approvato. Non può più essere modificato.</p>
              <p><strong>Pagato</strong>: Lo stipendio è stato pagato e viene creata una spesa aziendale corrispondente.</p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="note">
            <AccordionTrigger className="font-semibold">
              Note importanti
            </AccordionTrigger>
            <AccordionContent className="space-y-2 text-sm">
              <p>• Le <strong>tariffe KM</strong> sono configurate per anno nella tabella tariffe.</p>
              <p>• Il <strong>coefficiente di aumento</strong> attuale è del 22%.</p>
              <p>• La <strong>tariffa oraria attesa</strong> è di €18/ora.</p>
              <p>• Il <strong>riporto</strong> viene calcolato automaticamente dallo stipendio precedente.</p>
              <p>• Una volta <strong>confermato</strong> uno stipendio, non può più essere modificato.</p>
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
