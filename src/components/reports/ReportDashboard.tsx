
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ReportGenerator } from './ReportGenerator';
import { ReportGrid } from './ReportGrid';
import { ReportStats } from './ReportStats';
import { useReports } from '@/hooks/useReports';
import { FileText, Plus, Archive } from 'lucide-react';

export function ReportDashboard() {
  const [activeTab, setActiveTab] = useState('generate');
  const { reports } = useReports();

  const completedReports = reports.filter(r => r.stato === 'completato');
  const recentReports = completedReports.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <ReportStats reports={reports} />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuovo Report
            </TabsTrigger>
            <TabsTrigger value="archive" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archivio Report
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generator Form */}
            <div className="lg:col-span-2">
              <ReportGenerator />
            </div>
            
            {/* Recent Reports Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Report Recenti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentReports.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Nessun report ancora generato
                      </p>
                    </div>
                  ) : (
                    recentReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-medium truncate">
                            {report.azienda?.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.numero_servizi} servizi
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="archive">
          <ReportGrid />
        </TabsContent>
      </Tabs>
    </div>
  );
}
