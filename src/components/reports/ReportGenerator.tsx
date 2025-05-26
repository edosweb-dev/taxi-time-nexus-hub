
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Genera Nuovo Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ReportForm onPreview={handlePreview} onResetPreview={resetPreview} />
      </CardContent>
    </Card>
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
