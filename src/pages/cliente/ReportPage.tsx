
import { ClientDashboardLayout } from '@/components/layouts/ClientDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, DownloadIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportPage() {
  const { profile } = useAuth();

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Mensili</h1>
          <p className="text-muted-foreground">
            Visualizza e scarica i report dei servizi mensili
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Report
            </CardTitle>
            <CardDescription>
              Seleziona il mese e l'anno per visualizzare il report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
              <Select defaultValue="5">
                <SelectTrigger>
                  <SelectValue placeholder="Mese" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Gennaio</SelectItem>
                  <SelectItem value="2">Febbraio</SelectItem>
                  <SelectItem value="3">Marzo</SelectItem>
                  <SelectItem value="4">Aprile</SelectItem>
                  <SelectItem value="5">Maggio</SelectItem>
                  <SelectItem value="6">Giugno</SelectItem>
                  <SelectItem value="7">Luglio</SelectItem>
                  <SelectItem value="8">Agosto</SelectItem>
                  <SelectItem value="9">Settembre</SelectItem>
                  <SelectItem value="10">Ottobre</SelectItem>
                  <SelectItem value="11">Novembre</SelectItem>
                  <SelectItem value="12">Dicembre</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="2025">
                <SelectTrigger>
                  <SelectValue placeholder="Anno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg text-center">
              <h2 className="text-xl font-medium mb-2">Nessun report disponibile</h2>
              <p className="text-muted-foreground mb-4">
                Non ci sono dati disponibili per il periodo selezionato.
              </p>
              <Button variant="outline" disabled>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Scarica Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
