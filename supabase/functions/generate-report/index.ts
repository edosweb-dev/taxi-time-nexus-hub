
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
  id_progressivo?: string
  data_servizio: string
  orario_servizio: string
  stato: string
  indirizzo_presa: string
  indirizzo_destinazione: string
  citta_presa?: string
  citta_destinazione?: string
  numero_commessa?: string
  ore_fatturate?: number
  firma_url?: string
  incasso_previsto?: number
  incasso_ricevuto?: number
  iva?: number
  conducente_esterno_nome?: string
  veicolo_targa?: string
  veicolo_modello?: string
  referente_nome?: string
  assegnato_nome?: string
  passeggeri_nomi?: string[]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('=== INIZIO GENERAZIONE REPORT ===')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      console.error('❌ Utente non autorizzato')
      throw new Error('Non autorizzato')
    }

    const requestData: ReportData = await req.json()
    console.log('📋 Parametri ricevuti:', requestData)

    // 1. Fetch azienda info
    const { data: azienda, error: aziendaError } = await supabaseClient
      .from('aziende')
      .select('nome, firma_digitale_attiva')
      .eq('id', requestData.azienda_id)
      .single()

    if (aziendaError || !azienda) {
      throw new Error('Azienda non trovata')
    }

    // 2. Query servizi
    let query = supabaseClient
      .from('servizi')
      .select('*')
      .eq('azienda_id', requestData.azienda_id)
      .in('stato', ['da_assegnare', 'assegnato', 'completato', 'consuntivato'])
      .gte('data_servizio', requestData.data_inizio)
      .lte('data_servizio', requestData.data_fine)

    if (requestData.referente_id) {
      query = query.eq('referente_id', requestData.referente_id)
    }

    const { data: servizi, error: serviziError } = await query
    if (serviziError) {
      throw new Error(`Errore nel recupero servizi: ${serviziError.message}`)
    }

    console.log(`📊 Servizi trovati: ${servizi?.length || 0}`)

    if (!servizi || servizi.length === 0) {
      const emptyPdfBuffer = await generateEmptyPDF(azienda, requestData)
      
      const fileName = `report_vuoto_${requestData.azienda_id}_${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('report_aziende')
        .upload(fileName, emptyPdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) throw new Error(`Errore upload PDF: ${uploadError.message}`)

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
          numero_servizi: 0,
          totale_imponibile: 0,
          totale_iva: 0,
          totale_documento: 0,
          stato: 'completato'
        })
        .select()
        .single()

      if (reportError) throw new Error(`Errore salvataggio report: ${reportError.message}`)

      return new Response(
        JSON.stringify({ success: true, report: reportData, message: 'Report vuoto generato (nessun servizio nel periodo)' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // 3. Enrichment dei dati
    console.log('🔄 Arricchimento dati servizi...')
    const enrichedServizi: ServizioData[] = []

    // Batch fetch all needed profiles, veicoli, passeggeri
    const assigneeIds = [...new Set(servizi.map(s => s.assegnato_a).filter(Boolean))]
    const referenteIds = [...new Set(servizi.map(s => s.referente_id).filter(Boolean))]
    const veicoloIds = [...new Set(servizi.map(s => s.veicolo_id).filter(Boolean))]
    const allProfileIds = [...new Set([...assigneeIds, ...referenteIds])]
    const servizioIds = servizi.map(s => s.id)

    const [profilesRes, veicoliRes, passeggeriRes] = await Promise.all([
      allProfileIds.length > 0
        ? supabaseClient.from('profiles').select('id, first_name, last_name').in('id', allProfileIds)
        : { data: [] },
      veicoloIds.length > 0
        ? supabaseClient.from('veicoli').select('id, targa, modello').in('id', veicoloIds)
        : { data: [] },
      supabaseClient.from('servizi_passeggeri')
        .select('servizio_id, passeggeri:passeggero_id(nome_cognome), nome_cognome_inline')
        .in('servizio_id', servizioIds),
    ])

    const profilesMap = new Map((profilesRes.data || []).map(p => [p.id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]))
    const veicoliMap = new Map((veicoliRes.data || []).map(v => [v.id, { targa: v.targa, modello: v.modello }]))

    // Group passeggeri by servizio_id
    const passeggeriMap = new Map<string, string[]>()
    for (const sp of (passeggeriRes.data || [])) {
      const nome = (sp as any).passeggeri?.nome_cognome || (sp as any).nome_cognome_inline || ''
      if (nome) {
        if (!passeggeriMap.has(sp.servizio_id)) passeggeriMap.set(sp.servizio_id, [])
        passeggeriMap.get(sp.servizio_id)!.push(nome)
      }
    }

    for (const servizio of servizi) {
      const veicolo = servizio.veicolo_id ? veicoliMap.get(servizio.veicolo_id) : null
      enrichedServizi.push({
        ...servizio,
        referente_nome: servizio.referente_id ? (profilesMap.get(servizio.referente_id) || '') : '',
        assegnato_nome: servizio.assegnato_a ? (profilesMap.get(servizio.assegnato_a) || '') : '',
        veicolo_targa: veicolo?.targa || '',
        veicolo_modello: veicolo?.modello || '',
        passeggeri_nomi: passeggeriMap.get(servizio.id) || [],
      })
    }

    console.log('✅ Dati arricchiti completati')

    // 4. Generate PDF
    const pdfBuffer = await generatePDF(enrichedServizi, azienda, requestData)

    // 5. Upload PDF
    const fileName = `report_${requestData.azienda_id}_${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('report_aziende')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) throw new Error(`Errore upload PDF: ${uploadError.message}`)

    // 6. Calculate totals
    const totaleImporti = enrichedServizi.reduce((sum, s) => {
      return sum + (s.incasso_ricevuto || s.incasso_previsto || 0)
    }, 0)

    const { totaleImponibile, totaleIva } = enrichedServizi.reduce((acc, s) => {
      const ivaPercentuale = Number(s.iva ?? 10)
      const importo = s.incasso_ricevuto || s.incasso_previsto || 0
      const netto = importo / (1 + ivaPercentuale / 100)
      const iva = importo - netto
      return {
        totaleImponibile: acc.totaleImponibile + netto,
        totaleIva: acc.totaleIva + iva
      }
    }, { totaleImponibile: 0, totaleIva: 0 })
    const totaleDocumento = totaleImponibile + totaleIva

    // 7. Save report
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
        numero_servizi: enrichedServizi.length,
        totale_imponibile: totaleImponibile,
        totale_iva: totaleIva,
        totale_documento: totaleDocumento,
        stato: 'completato'
      })
      .select()
      .single()

    if (reportError) throw new Error(`Errore salvataggio report: ${reportError.message}`)

    console.log('✅ Report salvato:', reportData.id)

    return new Response(
      JSON.stringify({ success: true, report: reportData, message: 'Report generato con successo' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('💥 ERRORE GENERALE:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Errore durante la generazione del report', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function generateEmptyPDF(azienda: any, requestData: ReportData): Promise<Uint8Array> {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  const pdf = new jsPDF('landscape', 'mm', 'a4')
  pdf.setFont('helvetica')
  
  pdf.setFontSize(18)
  pdf.text('REPORT SERVIZI', 20, 20)
  
  pdf.setFontSize(12)
  pdf.text(`Azienda: ${azienda.nome}`, 20, 35)
  pdf.text(`Periodo: ${requestData.data_inizio} - ${requestData.data_fine}`, 20, 45)
  
  pdf.setFontSize(14)
  pdf.text('NESSUN SERVIZIO TROVATO', 20, 70)
  pdf.setFontSize(10)
  pdf.text('Nessun servizio trovato nel periodo selezionato.', 20, 85)
  
  return new Uint8Array(pdf.output('arraybuffer'))
}

function getStatoLabel(stato: string): string {
  switch (stato) {
    case 'da_assegnare': return 'Da Assegnare'
    case 'assegnato': return 'Assegnato'
    case 'completato': return 'Completato'
    case 'consuntivato': return 'Consuntivato'
    default: return stato
  }
}

async function generatePDF(servizi: ServizioData[], azienda: any, requestData: ReportData): Promise<Uint8Array> {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  
  const pdf = new jsPDF('landscape', 'mm', 'a4')
  pdf.setFont('helvetica')
  
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  
  // Header
  pdf.setFontSize(16)
  pdf.text('REPORT SERVIZI', 20, 20)
  
  pdf.setFontSize(10)
  pdf.text(`Azienda: ${azienda.nome}`, 20, 30)
  pdf.text(`Periodo: ${requestData.data_inizio} - ${requestData.data_fine}`, 20, 36)
  
  // Totals in header
  const totaleImporti = servizi.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0)
  const { totaleImponibile, totaleIva } = servizi.reduce((acc, s) => {
    const ivaPerc = Number(s.iva ?? 10)
    const importo = s.incasso_ricevuto || s.incasso_previsto || 0
    const netto = importo / (1 + ivaPerc / 100)
    return { totaleImponibile: acc.totaleImponibile + netto, totaleIva: acc.totaleIva + (importo - netto) }
  }, { totaleImponibile: 0, totaleIva: 0 })
  const totaleDocumento = totaleImponibile + totaleIva
  
  pdf.text(`Servizi: ${servizi.length}`, 200, 30)
  pdf.text(`Netto: EUR ${totaleImponibile.toFixed(2)}`, 200, 36)
  pdf.text(`IVA: EUR ${totaleIva.toFixed(2)}`, 200, 42)
  pdf.text(`Totale: EUR ${totaleDocumento.toFixed(2)}`, 200, 48)
  
  // Table columns definition
  let yPosition = 58
  const rowHeight = 6
  const fontSize = 7
  pdf.setFontSize(fontSize)
  
  const columns = [
    { label: 'ID', x: 5, width: 22 },
    { label: 'Data', x: 27, width: 18 },
    { label: 'Orario', x: 45, width: 13 },
    { label: 'Stato', x: 58, width: 20 },
    { label: 'Passeggeri', x: 78, width: 35 },
    { label: 'Partenza', x: 113, width: 30 },
    { label: 'Destinazione', x: 143, width: 30 },
    { label: 'Autista', x: 173, width: 25 },
    { label: 'Veicolo', x: 198, width: 25 },
    { label: 'Commessa', x: 223, width: 18 },
    { label: 'Ore', x: 241, width: 10 },
    { label: 'Importo', x: 251, width: 22 },
  ]
  
  // Add Firma column if active
  if (azienda.firma_digitale_attiva) {
    columns.push({ label: 'Firma', x: 273, width: 15 })
  }
  
  const drawTableHeader = (y: number) => {
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'bold')
    columns.forEach(col => pdf.text(col.label, col.x, y))
    pdf.line(5, y + 2, pageWidth - 5, y + 2)
    pdf.setFont('helvetica', 'normal')
    return y + 7
  }
  
  yPosition = drawTableHeader(yPosition)
  
  const truncateText = (text: string, maxChars: number) => {
    return text.length > maxChars ? text.substring(0, maxChars - 2) + '..' : text
  }
  
  servizi.forEach((servizio) => {
    // Check for new page
    if (yPosition > pageHeight - 25) {
      pdf.addPage('landscape')
      yPosition = 20
      yPosition = drawTableHeader(yPosition)
    }
    
    const dataFormatted = new Date(servizio.data_servizio).toLocaleDateString('it-IT')
    const passeggeriText = (servizio.passeggeri_nomi || []).join(', ')
    const veicoloText = servizio.veicolo_targa ? `${servizio.veicolo_modello || ''} ${servizio.veicolo_targa}`.trim() : ''
    const importo = servizio.incasso_ricevuto ?? servizio.incasso_previsto
    const importoText = importo != null 
      ? `EUR ${importo.toFixed(2)}${servizio.incasso_ricevuto == null ? '*' : ''}` 
      : '-'
    const partenza = servizio.citta_presa || servizio.indirizzo_presa || ''
    const destinazione = servizio.citta_destinazione || servizio.indirizzo_destinazione || ''
    
    const rowData = [
      servizio.id_progressivo || servizio.id.substring(0, 8),
      dataFormatted,
      servizio.orario_servizio,
      getStatoLabel(servizio.stato),
      truncateText(passeggeriText, 25),
      truncateText(partenza, 22),
      truncateText(destinazione, 22),
      truncateText(servizio.assegnato_nome || '', 18),
      truncateText(veicoloText, 18),
      truncateText(servizio.numero_commessa || '', 14),
      servizio.ore_fatturate != null ? `${servizio.ore_fatturate}` : '-',
      importoText,
    ]
    
    if (azienda.firma_digitale_attiva) {
      rowData.push(servizio.firma_url ? 'Si' : 'No')
    }
    
    columns.forEach((col, colIndex) => {
      if (rowData[colIndex]) {
        pdf.text(rowData[colIndex], col.x, yPosition)
      }
    })
    
    yPosition += rowHeight
  })
  
  // Legend for * symbol
  yPosition += 4
  if (yPosition > pageHeight - 20) {
    pdf.addPage('landscape')
    yPosition = 20
  }
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'italic')
  pdf.text('* = importo previsto (non ancora consuntivato)', 5, yPosition)
  pdf.setFont('helvetica', 'normal')
  
  // Totals at bottom
  yPosition += 8
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  
  const totalsX = pageWidth - 100
  pdf.text('TOTALI:', totalsX, yPosition)
  pdf.text(`Netto: EUR ${totaleImponibile.toFixed(2)}`, totalsX, yPosition + 8)
  pdf.text(`IVA: EUR ${totaleIva.toFixed(2)}`, totalsX, yPosition + 16)
  pdf.line(totalsX, yPosition + 20, totalsX + 60, yPosition + 20)
  pdf.text(`TOTALE: EUR ${totaleDocumento.toFixed(2)}`, totalsX, yPosition + 26)
  
  // Footer with page numbers
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Pagina ${i} di ${totalPages}`, pageWidth - 40, pageHeight - 10)
  }
  
  return new Uint8Array(pdf.output('arraybuffer'))
}
