
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReportData {
  azienda_id: string
  referente_id?: string
  data_inizio: string
  data_fine: string
}

interface ServizioData {
  id: string
  data_servizio: string
  orario_servizio: string
  indirizzo_presa: string
  indirizzo_destinazione: string
  numero_commessa?: string
  ore_effettive?: number
  veicolo?: { targa: string, modello: string }
  passeggeri: Array<{ nome_cognome: string }>
  firma_url?: string
  incasso_previsto?: number
  incasso_ricevuto?: number
  iva?: number
  note?: string
  referente?: { first_name: string, last_name: string }
  assegnato?: { first_name: string, last_name: string }
  conducente_esterno_nome?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('Non autorizzato')
    }

    const requestData: ReportData = await req.json()
    console.log('Generating report for:', requestData)

    // Fetch azienda info
    const { data: azienda } = await supabaseClient
      .from('aziende')
      .select('nome, firma_digitale_attiva')
      .eq('id', requestData.azienda_id)
      .single()

    if (!azienda) {
      throw new Error('Azienda non trovata')
    }

    // Fetch servizi data
    let query = supabaseClient
      .from('servizi')
      .select(`
        id, data_servizio, orario_servizio, indirizzo_presa, indirizzo_destinazione,
        numero_commessa, ore_effettive, firma_url, incasso_previsto, incasso_ricevuto, iva, note,
        conducente_esterno_nome,
        veicoli(targa, modello),
        servizi_passeggeri(passeggeri(nome_cognome)),
        referente:profiles!referente_id(first_name, last_name),
        assegnato:profiles!assegnato_a(first_name, last_name)
      `)
      .eq('azienda_id', requestData.azienda_id)
      .eq('stato', 'consuntivato')
      .gte('data_servizio', requestData.data_inizio)
      .lte('data_servizio', requestData.data_fine)

    if (requestData.referente_id) {
      query = query.eq('referente_id', requestData.referente_id)
    }

    const { data: servizi } = await query

    if (!servizi || servizi.length === 0) {
      throw new Error('Nessun servizio trovato per il periodo selezionato')
    }

    console.log(`Found ${servizi.length} servizi`)

    // Generate PDF content
    const pdfBuffer = await generatePDF(servizi as ServizioData[], azienda, requestData)

    // Upload PDF to storage
    const fileName = `report_${requestData.azienda_id}_${requestData.data_inizio}_${requestData.data_fine}.pdf`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('report_aziende')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Errore upload PDF: ${uploadError.message}`)
    }

    console.log('PDF uploaded successfully:', uploadData.path)

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('report_aziende')
      .getPublicUrl(fileName)

    // Calculate totals
    const totaleImponibile = servizi.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0)
    const totaleIva = totaleImponibile * 0.22
    const totaleDocumento = totaleImponibile + totaleIva

    // Save report to database
    const { data: reportData, error: reportError } = await supabaseClient
      .from('reports')
      .insert({
        azienda_id: requestData.azienda_id,
        referente_id: requestData.referente_id,
        created_by: user.id,
        nome_file: fileName,
        url_file: uploadData.path,
        bucket_name: 'report_aziende',
        data_inizio: requestData.data_inizio,
        data_fine: requestData.data_fine,
        numero_servizi: servizi.length,
        totale_imponibile: totaleImponibile,
        totale_iva: totaleIva,
        totale_documento: totaleDocumento,
        stato: 'completato'
      })
      .select()
      .single()

    if (reportError) {
      console.error('Database error:', reportError)
      throw new Error(`Errore salvataggio report: ${reportError.message}`)
    }

    console.log('Report saved successfully:', reportData.id)

    return new Response(
      JSON.stringify({ 
        success: true, 
        report: reportData,
        message: 'Report generato con successo'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error generating report:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Errore durante la generazione del report',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function generatePDF(servizi: ServizioData[], azienda: any, requestData: ReportData): Promise<Uint8Array> {
  // Import jsPDF dynamically
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  
  const pdf = new jsPDF()
  
  // Set font
  pdf.setFont('helvetica')
  
  // Header
  pdf.setFontSize(20)
  pdf.text('REPORT SERVIZI', 20, 30)
  
  pdf.setFontSize(14)
  pdf.text(`Azienda: ${azienda.nome}`, 20, 45)
  pdf.text(`Periodo: ${requestData.data_inizio} - ${requestData.data_fine}`, 20, 55)
  
  // Summary
  const totaleImponibile = servizi.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0)
  const totaleIva = totaleImponibile * 0.22
  const totaleDocumento = totaleImponibile + totaleIva
  
  pdf.setFontSize(12)
  pdf.text(`Numero servizi: ${servizi.length}`, 20, 75)
  pdf.text(`Totale imponibile: €${totaleImponibile.toFixed(2)}`, 20, 85)
  pdf.text(`Totale IVA (22%): €${totaleIva.toFixed(2)}`, 20, 95)
  pdf.text(`TOTALE DOCUMENTO: €${totaleDocumento.toFixed(2)}`, 20, 105)
  
  // Table header
  let yPosition = 125
  pdf.setFontSize(10)
  pdf.text('Data', 20, yPosition)
  pdf.text('Orario', 50, yPosition)
  pdf.text('Referente', 80, yPosition)
  pdf.text('Presa', 120, yPosition)
  pdf.text('Importo', 160, yPosition)
  
  // Add line under header
  pdf.line(20, yPosition + 2, 190, yPosition + 2)
  
  // Service details
  yPosition += 10
  
  servizi.forEach((servizio, index) => {
    if (yPosition > 270) {
      pdf.addPage()
      yPosition = 20
    }
    
    const dataFormatted = new Date(servizio.data_servizio).toLocaleDateString('it-IT')
    const referenteName = servizio.referente ? 
      `${servizio.referente.first_name} ${servizio.referente.last_name}` : 
      'N/A'
    const importo = (servizio.incasso_ricevuto || servizio.incasso_previsto || 0).toFixed(2)
    
    pdf.text(dataFormatted, 20, yPosition)
    pdf.text(servizio.orario_servizio, 50, yPosition)
    pdf.text(referenteName.substring(0, 15), 80, yPosition)
    pdf.text(servizio.indirizzo_presa.substring(0, 20), 120, yPosition)
    pdf.text(`€${importo}`, 160, yPosition)
    
    yPosition += 8
  })
  
  // Footer
  pdf.setFontSize(8)
  const pageCount = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.text(`Pagina ${i} di ${pageCount}`, 170, 290)
  }
  
  // Return PDF as Uint8Array
  return new Uint8Array(pdf.output('arraybuffer'))
}
