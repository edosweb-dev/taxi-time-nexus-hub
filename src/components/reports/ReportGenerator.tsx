import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Info } from 'lucide-react';
import { ReportPreviewTable } from './ReportPreviewTable';
import { ReportForm } from './ReportForm';

interface ReportGeneratorProps {
  onPreviewGenerated?: (data: { 
    aziendaId: string; 
    referenteId?: string; 
    year: number; 
    month: number;
  } | null) => void;
}

export function ReportGenerator({ onPreviewGenerated }: ReportGeneratorProps = {}) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{ 
    aziendaId: string; 
    referenteId?: string; 
    year: number; 
    month: number;
  } | null>(null);

  const handlePreview = (data: { 
    aziendaId: string; 
    referenteId?: string; 
    year: number; 
    month: number;
  }) => {
    setPreviewData(data);
    setShowPreview(true);
    onPreviewGenerated?.(data);
  };

  const resetPreview = () => {
    setShowPreview(false);
    setPreviewData(null);
    onPreviewGenerated?.(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Genera Nuovo Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Seleziona un'azienda e un mese per generare un report PDF dei servizi consuntivati.
            </AlertDescription>
          </Alert>
          
          <ReportForm onPreview={handlePreview} onResetPreview={resetPreview} />
        </CardContent>
      </Card>
      
      {showPreview && previewData && (
        <ReportPreviewTable 
          aziendaId={previewData.aziendaId}
          referenteId={previewData.referenteId}
          year={previewData.year}
          month={previewData.month}
        />
      )}
    </div>
  );
}

// Componente wrapper che gestisce sia il generatore che l'anteprima
export function ReportGeneratorWithPreview() {
  const [previewData, setPreviewData] = useState<{ 
    aziendaId: string; 
    referenteId?: string; 
    year: number; 
    month: number;
  } | null>(null);

  return (
    <div className="space-y-6">
      <ReportGenerator onPreviewGenerated={setPreviewData} />
      
      {previewData && (
        <div className="w-full">
          <ReportPreviewTable 
            aziendaId={previewData.aziendaId}
            referenteId={previewData.referenteId}
            year={previewData.year}
            month={previewData.month}
          />
        </div>
      )}
    </div>
  );
}
