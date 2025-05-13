
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, BugIcon } from 'lucide-react';
import { ReportsList } from '@/components/servizi/report/ReportsList';
import { ReportGeneratorDialog } from '@/components/servizi/report/ReportGeneratorDialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { useDebugReporting } from '@/components/servizi/hooks';

export default function ReportPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const { profile } = useAuth();
  const { debugInfo, checkServizi } = useDebugReporting();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Aziende</h1>
            <p className="text-muted-foreground">
              Gestisci i report mensili dei servizi consuntivati per azienda e referente
            </p>
          </div>
          <div className="flex gap-2">
            {isAdminOrSocio && (
              <>
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDebugMode(!isDebugMode)}
                  >
                    <BugIcon className="mr-2 h-4 w-4" />
                    {isDebugMode ? 'Nascondi Debug' : 'Debug Mode'}
                  </Button>
                )}
                <Button onClick={() => setIsGenerateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Genera Report
                </Button>
              </>
            )}
          </div>
        </div>

        {isDebugMode && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-amber-800">Debug Reports</CardTitle>
              <CardDescription className="text-amber-700">
                Usa questo pannello per verificare i dati dei report e risolvere problemi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-sm font-medium mb-1 text-amber-800">Aziende</div>
                    <div className="text-sm text-amber-700">
                      {debugInfo?.aziende ? debugInfo.aziende.length : 0} aziende trovate
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-sm font-medium mb-1 text-amber-800">Referenti</div>
                    <div className="text-sm text-amber-700">
                      {debugInfo?.referenti ? debugInfo.referenti.length : 0} referenti trovati
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-1">
                    <div className="text-sm font-medium mb-1 text-amber-800">Servizi</div>
                    <div className="text-sm text-amber-700">
                      Totali: {debugInfo?.allServizi ? debugInfo.allServizi.count : 0}
                      <br />
                      Consuntivati: {debugInfo?.consuntivati ? debugInfo.consuntivati.count : 0}
                    </div>
                  </div>
                </div>

                {debugInfo?.statuses && (
                  <div>
                    <div className="text-sm font-medium mb-1 text-amber-800">Stati servizi</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(debugInfo.statuses).map(([stato, count]) => (
                        <div key={stato} className="px-2 py-1 bg-amber-100 rounded text-xs">
                          {stato}: {String(count)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {debugInfo?.dateRange && (
                  <div>
                    <div className="text-sm font-medium mb-1 text-amber-800">Intervallo date</div>
                    <div className="text-sm text-amber-700">
                      Da: {debugInfo.dateRange.startDateString} a {debugInfo.dateRange.endDateString}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-medium">Report generati</h2>
          </div>
          <ReportsList />
        </div>
        
        <ReportGeneratorDialog 
          open={isGenerateDialogOpen} 
          onOpenChange={setIsGenerateDialogOpen} 
        />
      </div>
    </MainLayout>
  );
}
