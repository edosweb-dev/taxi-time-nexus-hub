import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cleanupFirmaUrl } from '@/components/servizi/utils/firmaUtils';
import { buildCityRoute } from './cityRouteUtils';

interface ExportPdfOptions {
  dataInizio: string;
  dataFine: string;
  aziendaNome?: string;
  referenteNome?: string;
  // Mostra la colonna "N° Commessa" (serve al cliente, es. Omet).
  // Stessa logica del CSV: attiva quando l'azienda non usa la firma digitale.
  mostraCommessa?: boolean;
}

// Sanitizza percorso - sostituisce caratteri non supportati dal font Helvetica
const sanitizePercorso = (percorso: string): string => {
  if (!percorso) return '-';
  return percorso
    .replace(/→/g, '->')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .trim() || '-';
};

/**
 * Scarica un'immagine da URL e la converte in dataURL per jsPDF
 */
async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const cleanUrl = cleanupFirmaUrl(url);
    const cacheBustUrl = `${cleanUrl}?v=${Date.now()}`;
    
    const response = await fetch(cacheBustUrl, {
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      console.warn('Errore download firma per PDF:', response.status, url);
      return null;
    }
    
    const blob = await response.blob();
    if (blob.size < 100) {
      console.warn('Firma troppo piccola, saltata:', blob.size);
      return null;
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Errore fetch firma per PDF:', error);
    return null;
  }
}

export const exportReportPasseggeriPdf = async (
  data: ReportPasseggeroRow[],
  options: ExportPdfOptions
) => {
  const { dataInizio, dataFine, aziendaNome, referenteNome, mostraCommessa = false } = options;

  // Landscape per più spazio orizzontale (297mm vs 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Title
  doc.setFontSize(14);
  doc.text('Report Passeggeri', 14, 15);

  // Subtitle with period
  doc.setFontSize(9);
  let yPos = 22;
  doc.text(`Periodo: ${format(new Date(dataInizio), 'dd/MM/yyyy')} - ${format(new Date(dataFine), 'dd/MM/yyyy')}`, 14, yPos);
  
  if (aziendaNome) {
    yPos += 5;
    doc.text(`Azienda: ${aziendaNome}`, 14, yPos);
  }
  
  if (referenteNome) {
    yPos += 5;
    doc.text(`Referente: ${referenteNome}`, 14, yPos);
  }

  // Table
  // Larghezze ribilanciate quando si aggiunge la colonna commessa, così la
  // tabella resta entro i margini A4 landscape (~268mm utili). Senza commessa
  // si usano le larghezze originali per non alterare il layout esistente.
  const columnStyles = mostraCommessa
    ? {
        0: { cellWidth: 28 },                    // Referente
        1: { cellWidth: 20 },                    // Data
        2: { cellWidth: 11, halign: 'center' as const },  // N°
        3: { cellWidth: 50 },                    // Passeggeri
        4: { cellWidth: 54 },                    // Percorso
        5: { cellWidth: 20, halign: 'right' as const },   // Importo
        6: { cellWidth: 16, halign: 'center' as const },  // Ore Fatturate
        7: { cellWidth: 33 },                    // Note
        8: { cellWidth: 20, halign: 'center' as const },  // N° Commessa
      }
    : {
        0: { cellWidth: 30 },
        1: { cellWidth: 22 },
        2: { cellWidth: 12, halign: 'center' as const },
        3: { cellWidth: 58 },
        4: { cellWidth: 65 },
        5: { cellWidth: 22, halign: 'right' as const },
        6: { cellWidth: 18, halign: 'center' as const },
        7: { cellWidth: 45 },
      };

  autoTable(doc, {
    startY: yPos + 8,
    head: [[
      'Referente', 'Data', 'N°', 'Passeggeri', 'Percorso', 'Importo', 'Ore Fatturate', 'Note',
      ...(mostraCommessa ? ['N° Commessa'] : []),
    ]],
    body: data.map(row => {
      const cells = [
        row.referente_nome || '-',
        format(new Date(row.data_servizio), 'dd/MM/yyyy'),
        row.num_passeggeri.toString(),
        row.passeggeri_nomi || '-',
        sanitizePercorso(buildCityRoute(row.percorso)),
        `€${row.importo.toFixed(2)}`,
        row.ore_sosta > 0 ? row.ore_sosta.toString() : '-',
        row.note || '-',
      ];
      if (mostraCommessa) cells.push(row.numero_commessa || '-');
      return cells;
    }),
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
      overflow: 'linebreak',
      minCellHeight: 8
    },
    headStyles: {
      fillColor: [66, 66, 66],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center' as const
    },
    alternateRowStyles: { fillColor: [248, 248, 248] },
    columnStyles
  });

  // Footer totals
  let finalY = (doc as any).lastAutoTable.finalY + 8;
  const totaleImporto = data.reduce((sum, s) => sum + (s.importo || 0), 0);
  const totaleOre = data.reduce((sum, s) => sum + (s.ore_sosta || 0), 0);
  const totalePasseggeri = data.reduce((sum, s) => sum + (s.num_passeggeri || 0), 0);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Totale: ${data.length} servizi (${totalePasseggeri} passeggeri)  |  Importo: €${totaleImporto.toFixed(2)}  |  Ore attesa: ${totaleOre.toFixed(1)}h`, 14, finalY);

  // Sezione Firme Digitali
  const serviziConFirma = data.filter(row => row.firma_url && row.firma_url.trim() !== '');
  
  if (serviziConFirma.length > 0) {
    // Nuova pagina per le firme
    doc.addPage();
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Firme Digitali', 14, 15);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${serviziConFirma.length} servizi con firma digitale`, 14, 21);
    
    let firmaY = 30;
    const pageHeight = 200; // margine inferiore landscape A4
    
    for (const row of serviziConFirma) {
      // Controlla spazio pagina
      if (firmaY + 40 > pageHeight) {
        doc.addPage();
        firmaY = 15;
      }
      
      // Header servizio
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const label = `${row.id_progressivo} - ${format(new Date(row.data_servizio), 'dd/MM/yyyy')} - ${row.passeggeri_nomi || 'N/D'}`;
      doc.text(label, 14, firmaY);
      firmaY += 5;
      
      // Download e render firma
      const dataUrl = await fetchImageAsDataUrl(row.firma_url!);
      
      if (dataUrl) {
        try {
          doc.addImage(dataUrl, 'PNG', 14, firmaY, 60, 20);
          firmaY += 25;
        } catch (imgErr) {
          console.error('Errore addImage firma:', imgErr);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.text('(Errore rendering firma)', 14, firmaY);
          firmaY += 5;
        }
      } else {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.text('(Firma non disponibile)', 14, firmaY);
        firmaY += 5;
      }
      
      // Linea separatrice
      doc.setDrawColor(200, 200, 200);
      doc.line(14, firmaY, 283, firmaY);
      firmaY += 5;
    }
  }

  // Download
  doc.save(`report-passeggeri-${dataInizio}-${dataFine}.pdf`);
};
