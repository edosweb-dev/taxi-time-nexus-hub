
import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import { Servizio } from '@/lib/types/servizi';
import { Profile, Azienda } from '@/lib/types';
import { styles } from './styles/reportPDFStyles';
import { 
  ReportHeader, 
  ReportTable, 
  ReportSummary, 
  ReportFooter 
} from './components';

interface ReportPDFProps {
  servizi: Servizio[];
  passeggeriCounts: Record<string, number>;
  azienda: Azienda | null;
  referenteName: string;
  month: number;
  year: number;
  users: Profile[];
}

export const ReportPDF: React.FC<ReportPDFProps> = ({
  servizi,
  passeggeriCounts,
  azienda,
  referenteName,
  month,
  year,
  users,
}) => {
  if (!azienda) return null;
  
  return (
    <PDFViewer width="100%" height={600} style={{ border: 'none' }}>
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <ReportHeader 
            azienda={azienda}
            referenteName={referenteName}
            month={month}
            year={year}
          />
          
          <ReportTable 
            servizi={servizi}
            passeggeriCounts={passeggeriCounts}
            users={users}
          />
          
          <ReportSummary servizi={servizi} />
          
          <ReportFooter />
        </Page>
      </Document>
    </PDFViewer>
  );
};

// We need to import PDFViewer here to avoid circular dependencies
import { PDFViewer } from '@react-pdf/renderer';

export default ReportPDF;
