
import { Report } from '@/lib/types/reports';

export function generateMockReportData(
  aziendaId: string,
  tipoReport: 'servizi' | 'finanziario' | 'veicoli',
  dataInizio: string,
  dataFine: string,
  userId: string
): Report {
  const numeroServizi = Math.floor(Math.random() * 50) + 1;
  const totaleImponibile = Math.floor(Math.random() * 10000) + 1000;
  const totaleIva = totaleImponibile * 0.22;
  const totaleDocumento = totaleImponibile + totaleIva;

  // Genera contenuto mock per l'anteprima PDF
  const mockPdfContent = generateMockPdfContent(tipoReport, numeroServizi, totaleImponibile, totaleIva, totaleDocumento);

  return {
    id: 'preview-' + Date.now(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    azienda_id: aziendaId,
    created_by: userId,
    tipo_report: tipoReport,
    nome_file: `anteprima_report_${tipoReport}_${dataInizio}_${dataFine}.pdf`,
    url_file: mockPdfContent,
    data_inizio: dataInizio,
    data_fine: dataFine,
    numero_servizi: numeroServizi,
    totale_imponibile: totaleImponibile,
    totale_iva: totaleIva,
    totale_documento: totaleDocumento,
    stato: 'completato',
  };
}

function generateMockPdfContent(
  tipoReport: string,
  numeroServizi: number,
  totaleImponibile: number,
  totaleIva: number,
  totaleDocumento: number
): string {
  // Genera un blob URL con contenuto HTML mock per l'anteprima
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Anteprima Report ${tipoReport.toUpperCase()}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .totals { border-top: 2px solid #333; padding-top: 10px; }
            .preview-notice { 
                background: #fef3c7; 
                border: 1px solid #f59e0b; 
                padding: 10px; 
                margin-bottom: 20px;
                border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="preview-notice">
            <strong>⚠️ ANTEPRIMA</strong> - Questo è un esempio di come apparirà il report finale
        </div>
        
        <div class="header">
            <h1>Report ${tipoReport.toUpperCase()}</h1>
            <p>Periodo: ${new Date().toLocaleDateString('it-IT')} - ${new Date().toLocaleDateString('it-IT')}</p>
        </div>
        
        <div class="section">
            <h2>Riepilogo</h2>
            <p><strong>Numero servizi:</strong> ${numeroServizi}</p>
            <p><strong>Totale imponibile:</strong> €${totaleImponibile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
            <p><strong>Totale IVA:</strong> €${totaleIva.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div class="section totals">
            <h3><strong>Totale documento: €${totaleDocumento.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong></h3>
        </div>
        
        <div class="section">
            <h2>Dettagli ${tipoReport}</h2>
            <p>I dati dettagliati del report appariranno qui nel documento finale.</p>
            <p>Questa anteprima mostra la struttura e il formato del report che verrà generato.</p>
        </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  return URL.createObjectURL(blob);
}
