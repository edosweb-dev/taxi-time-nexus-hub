import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportPdfOptions {
  dataInizio: string;
  dataFine: string;
  aziendaNome?: string;
  referenteNome?: string;
}

export const exportReportPasseggeriPdf = (
  data: ReportPasseggeroRow[],
  options: ExportPdfOptions
) => {
  const { dataInizio, dataFine, aziendaNome, referenteNome } = options;

  // Aggregate passengers by service (group by servizio_id)
  const serviziMap = new Map<string, {
    servizio_id: string;
    data_servizio: string;
    referente_nome: string;
    passeggeri: string[];
    percorso: string;
    importo: number;
    ore_fatturate: number;
    note: string;
    stato: string;
  }>();

  data.forEach((row) => {
    const existing = serviziMap.get(row.servizio_id);
    
    if (existing) {
      if (row.passeggero_nome && row.passeggero_nome !== 'Nessun passeggero') {
        existing.passeggeri.push(row.passeggero_nome);
      }
    } else {
      serviziMap.set(row.servizio_id, {
        servizio_id: row.servizio_id,
        data_servizio: row.data_servizio,
        referente_nome: row.referente_nome || '-',
        passeggeri: row.passeggero_nome && row.passeggero_nome !== 'Nessun passeggero'
          ? [row.passeggero_nome]
          : [],
        percorso: row.percorso,
        importo: row.importo,
        ore_fatturate: row.ore_fatturate || 0,
        note: row.note || '',
        stato: row.stato || '-'
      });
    }
  });

  const aggregatedData = Array.from(serviziMap.values());

  // Create PDF
  const doc = new jsPDF();

  // Title
  doc.setFontSize(16);
  doc.text('Report Passeggeri', 14, 15);

  // Subtitle with period
  doc.setFontSize(10);
  let yPos = 22;
  doc.text(`Periodo: ${format(new Date(dataInizio), 'dd/MM/yyyy')} - ${format(new Date(dataFine), 'dd/MM/yyyy')}`, 14, yPos);
  
  if (aziendaNome) {
    yPos += 6;
    doc.text(`Azienda: ${aziendaNome}`, 14, yPos);
  }
  
  if (referenteNome) {
    yPos += 6;
    doc.text(`Referente: ${referenteNome}`, 14, yPos);
  }

  // Table
  autoTable(doc, {
    startY: yPos + 10,
    head: [['Referente', 'Data', 'Passeggero', 'Percorso', 'Importo', 'Ore Attesa', 'Note', 'Stato']],
    body: aggregatedData.map(s => [
      s.referente_nome,
      format(new Date(s.data_servizio), 'dd/MM/yyyy'),
      s.passeggeri.length > 0 ? s.passeggeri.join(', ') : '-',
      s.percorso || '-',
      `€${s.importo.toFixed(2)}`,
      s.ore_fatturate > 0 ? s.ore_fatturate.toString() : '-',
      s.note || '-',
      s.stato
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [66, 66, 66] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      3: { cellWidth: 40 }, // Percorso - wider
      6: { cellWidth: 25 }, // Note
    }
  });

  // Footer totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const totaleImporto = data.reduce((sum, s) => sum + (s.importo || 0), 0);
  const totaleOre = data.reduce((sum, s) => sum + (s.ore_fatturate || 0), 0);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Totale: ${aggregatedData.length} servizi`, 14, finalY);
  doc.text(`Importo totale: €${totaleImporto.toFixed(2)}`, 14, finalY + 6);
  doc.text(`Ore attesa totali: ${totaleOre.toFixed(1)}h`, 14, finalY + 12);

  // Download
  doc.save(`report-passeggeri-${dataInizio}-${dataFine}.pdf`);
};
