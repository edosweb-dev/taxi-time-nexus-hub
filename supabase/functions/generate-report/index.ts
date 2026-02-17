
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
  ore_sosta?: number  // UNICO campo ore
  firma_url?: string
  incasso_previsto?: number
  incasso_ricevuto?: number
  iva?: number
  note?: string
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
    console.log('🏢 Recupero informazioni azienda...')
    const { data: azienda, error: aziendaError } = await supabaseClient
      .from('aziende')
      .select('nome, firma_digitale_attiva')
      .eq('id', requestData.azienda_id)
      .single()

    if (aziendaError || !azienda) {
      console.error('❌ Errore azienda:', aziendaError)
      throw new Error('Azienda non trovata')
    }
    console.log('✅ Azienda trovata:', azienda.nome)

    // 2. Query servizi semplificata (senza JOIN complessi)
    console.log('🔍 Ricerca servizi...')
    let query = supabaseClient
      .from('servizi')
      .select('*')
      .eq('azienda_id', requestData.azienda_id)
      .eq('stato', 'consuntivato')
      .gte('data_servizio', requestData.data_inizio)
      .lte('data_servizio', requestData.data_fine)

    if (requestData.referente_id) {
      query = query.eq('referente_id', requestData.referente_id)
    }

    const { data: servizi, error: serviziError } = await query
    if (serviziError) {
      console.error('❌ Errore query servizi:', serviziError)
      throw new Error(`Errore nel recupero servizi: ${serviziError.message}`)
    }

    console.log(`📊 Servizi trovati: ${servizi?.length || 0}`)

    if (!servizi || servizi.length === 0) {
      console.log('📝 Nessun servizio trovato, genero report vuoto')
      const emptyPdfBuffer = await generateEmptyPDF(azienda, requestData)
      
      const fileName = `report_vuoto_${requestData.azienda_id}_${Date.now()}.pdf`
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from('report_aziende')
        .upload(fileName, emptyPdfBuffer, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        console.error('❌ Errore upload PDF vuoto:', uploadError)
        throw new Error(`Errore upload PDF: ${uploadError.message}`)
      }

      console.log('✅ PDF vuoto caricato:', uploadData.path)

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

      if (reportError) {
        console.error('❌ Errore salvataggio report vuoto:', reportError)
        throw new Error(`Errore salvataggio report: ${reportError.message}`)
      }

      console.log('✅ Report vuoto salvato con successo')
      return new Response(
        JSON.stringify({ 
          success: true, 
          report: reportData,
          message: 'Report vuoto generato (nessun servizio nel periodo)'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // 3. Enrichment dei dati con lookup manuali
    console.log('🔄 Arricchimento dati servizi...')
    const enrichedServizi: ServizioData[] = []

    for (const servizio of servizi) {
      const enrichedServizio: ServizioData = { ...servizio }

      // Lookup referente
      if (servizio.referente_id) {
        const { data: referente } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', servizio.referente_id)
          .single()
        
        if (referente) {
          enrichedServizio.referente_nome = `${referente.first_name || ''} ${referente.last_name || ''}`.trim()
        }
      }

      // Lookup assegnato
      if (servizio.assegnato_a) {
        const { data: assegnato } = await supabaseClient
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', servizio.assegnato_a)
          .single()
        
        if (assegnato) {
          enrichedServizio.assegnato_nome = `${assegnato.first_name || ''} ${assegnato.last_name || ''}`.trim()
        }
      }

      // Lookup veicolo
      if (servizio.veicolo_id) {
        const { data: veicolo } = await supabaseClient
          .from('veicoli')
          .select('targa, modello')
          .eq('id', servizio.veicolo_id)
          .single()
        
        if (veicolo) {
          enrichedServizio.veicolo_targa = veicolo.targa
          enrichedServizio.veicolo_modello = veicolo.modello
        }
      }

      // Lookup passeggeri
      const { data: serviziPasseggeri } = await supabaseClient
        .from('servizi_passeggeri')
        .select(`
          passeggeri:passeggero_id (
            nome_cognome
          )
        `)
        .eq('servizio_id', servizio.id)

      if (serviziPasseggeri) {
        enrichedServizio.passeggeri_nomi = serviziPasseggeri
          .map(sp => sp.passeggeri?.nome_cognome)
          .filter(Boolean)
      }

      enrichedServizi.push(enrichedServizio)
    }

    console.log('✅ Dati arricchiti completati')

    // 4. Generate PDF with enriched data
    console.log('📄 Generazione PDF...')
    const pdfBuffer = await generatePDF(enrichedServizi, azienda, requestData)

    // 5. Upload PDF to storage
    const fileName = `report_${requestData.azienda_id}_${Date.now()}.pdf`
    console.log('⬆️ Upload PDF:', fileName)
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('report_aziende')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('❌ Errore upload PDF:', uploadError)
      throw new Error(`Errore upload PDF: ${uploadError.message}`)
    }

    console.log('✅ PDF caricato:', uploadData.path)

    // 6. Calculate totals using historical IVA from each service
    const { totaleImponibile, totaleIva } = enrichedServizi.reduce((acc, s) => {
      const ivaPercentuale = Number(s.iva ?? 10) // Usa ?? per non trattare 0 come falsy
      const importo = s.incasso_ricevuto || s.incasso_previsto || 0
      // Scorporo IVA: Netto = Lordo / (1 + aliquota/100)
      const netto = importo / (1 + ivaPercentuale / 100)
      const iva = importo - netto
      return {
        totaleImponibile: acc.totaleImponibile + netto,
        totaleIva: acc.totaleIva + iva
      }
    }, { totaleImponibile: 0, totaleIva: 0 })
    const totaleDocumento = totaleImponibile + totaleIva

    console.log('💰 Totali calcolati:', { totaleImponibile, totaleIva, totaleDocumento })

    // 7. Save report to database
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

    if (reportError) {
      console.error('❌ Errore salvataggio report:', reportError)
      throw new Error(`Errore salvataggio report: ${reportError.message}`)
    }

    console.log('✅ Report salvato con successo:', reportData.id)
    console.log('=== FINE GENERAZIONE REPORT ===')

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
    console.error('💥 ERRORE GENERALE:', error)
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

async function generateEmptyPDF(azienda: any, requestData: ReportData): Promise<Uint8Array> {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  
  // PDF in formato orizzontale (landscape)
  const pdf = new jsPDF('landscape', 'mm', 'a4')
  pdf.setFont('helvetica')
  
  // Header
  pdf.setFontSize(18)
  pdf.text('REPORT SERVIZI', 20, 20)
  
  pdf.setFontSize(12)
  pdf.text(`Azienda: ${azienda.nome}`, 20, 35)
  pdf.text(`Periodo: ${requestData.data_inizio} - ${requestData.data_fine}`, 20, 45)
  
  // Empty message
  pdf.setFontSize(14)
  pdf.text('NESSUN SERVIZIO TROVATO', 20, 70)
  
  pdf.setFontSize(10)
  pdf.text('Non sono stati trovati servizi consuntivati per il periodo selezionato.', 20, 85)
  
  return new Uint8Array(pdf.output('arraybuffer'))
}

async function generatePDF(servizi: ServizioData[], azienda: any, requestData: ReportData): Promise<Uint8Array> {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  
  // PDF in formato orizzontale (landscape)
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
  pdf.text(`Firma Digitale: ${azienda.firma_digitale_attiva ? 'Attiva' : 'Non Attiva'}`, 20, 42)
  
  // Calculate totals using historical IVA from each service
  const { totaleImponibile, totaleIva } = servizi.reduce((acc, s) => {
    const ivaPercentuale = Number(s.iva ?? 10) // Usa ?? per non trattare 0 come falsy
    const importo = s.incasso_ricevuto || s.incasso_previsto || 0
    // Scorporo IVA: Netto = Lordo / (1 + aliquota/100)
    const netto = importo / (1 + ivaPercentuale / 100)
    const iva = importo - netto
    return {
      totaleImponibile: acc.totaleImponibile + netto,
      totaleIva: acc.totaleIva + iva
    }
  }, { totaleImponibile: 0, totaleIva: 0 })
  const totaleDocumento = totaleImponibile + totaleIva
  
  pdf.text(`Servizi: ${servizi.length}`, 200, 30)
  pdf.text(`Netto: €${totaleImponibile.toFixed(2)}`, 200, 36)
  pdf.text(`IVA: €${totaleIva.toFixed(2)}`, 200, 42)
  pdf.text(`Totale: €${totaleDocumento.toFixed(2)}`, 200, 48)
  
  // Table header - configurazione colonne
  let yPosition = 60
  const rowHeight = 6
  const fontSize = 8
  pdf.setFontSize(fontSize)
  
  // Definisci le colonne e le loro larghezze
  const columns = [
    { label: 'ID', x: 20, width: 15 },
    { label: 'Data', x: 35, width: 20 },
    { label: 'Orario', x: 55, width: 15 },
    { label: 'Passeggeri', x: 70, width: 38 },
    { label: 'Partenza', x: 108, width: 32 },
    { label: 'Destinazione', x: 140, width: 32 },
    { label: 'Commessa', x: 172, width: 16 },
    { label: 'Ore Sosta', x: 188, width: 14 },
    { label: 'Veicolo', x: 202, width: 24 },
    { label: 'Note', x: 226, width: 24 }
  ]
  
  // Se firma digitale attiva, aggiungi colonna firma
  if (azienda.firma_digitale_attiva) {
    columns.push({ label: 'Firma', x: 250, width: 20 })
  }
  
  // Disegna header della tabella
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  columns.forEach(col => {
    pdf.text(col.label, col.x, yPosition)
  })
  
  // Linea sotto l'header
  pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2)
  
  // Dati dei servizi
  pdf.setFont('helvetica', 'normal')
  yPosition += 8
  
  servizi.forEach((servizio, index) => {
    // Controlla se serve una nuova pagina
    if (yPosition > pageHeight - 30) {
      pdf.addPage('landscape')
      yPosition = 30
      
      // Ripeti header su nuova pagina
      pdf.setFont('helvetica', 'bold')
      columns.forEach(col => {
        pdf.text(col.label, col.x, yPosition)
      })
      pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2)
      pdf.setFont('helvetica', 'normal')
      yPosition += 8
    }
    
    // Preparazione dati
    const dataFormatted = new Date(servizio.data_servizio).toLocaleDateString('it-IT')
    const orarioFormatted = servizio.orario_servizio
    const passeggeriText = (servizio.passeggeri_nomi || []).join(', ')
    const veicoloText = servizio.veicolo_targa ? `${servizio.veicolo_targa} ${servizio.veicolo_modello || ''}`.trim() : ''
    const commessaText = servizio.numero_commessa || ''
    const oreSostaText = servizio.ore_sosta ? `${servizio.ore_sosta}h` : '-'
    const noteText = servizio.note || ''
    
    // Truncate text to fit columns
    const truncateText = (text: string, maxLength: number) => {
      return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text
    }
    
    // Scrivi i dati nelle colonne
    const rowData = [
      servizio.id.substring(0, 8),
      dataFormatted,
      orarioFormatted,
      truncateText(passeggeriText, 25),
      truncateText(servizio.indirizzo_presa, 20),
      truncateText(servizio.indirizzo_destinazione, 20),
      truncateText(commessaText, 15),
      oreSostaText,
      truncateText(veicoloText, 18),
      truncateText(noteText, 18)
    ]
    
    // Se firma digitale attiva, aggiungi status firma
    if (azienda.firma_digitale_attiva) {
      rowData.push(servizio.firma_url ? '✓' : '✗')
    }
    
    // Scrivi ogni cella
    columns.forEach((col, colIndex) => {
      if (rowData[colIndex]) {
        pdf.text(rowData[colIndex], col.x, yPosition)
      }
    })
    
    yPosition += rowHeight
  })
  
  // Totali finali nella parte bassa della pagina
  yPosition = Math.max(yPosition + 20, pageHeight - 40)
  
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(10)
  
  const totalsX = pageWidth - 100
  pdf.text('TOTALI:', totalsX, yPosition)
  pdf.text(`Netto: €${totaleImponibile.toFixed(2)}`, totalsX, yPosition + 8)
  pdf.text(`IVA: €${totaleIva.toFixed(2)}`, totalsX, yPosition + 16)
  pdf.text(`TOTALE: €${totaleDocumento.toFixed(2)}`, totalsX, yPosition + 24)
  
  // Linea sopra il totale
  pdf.line(totalsX, yPosition + 20, totalsX + 60, yPosition + 20)
  
  // Footer con numero pagina
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.text(`Pagina ${i} di ${totalPages}`, pageWidth - 40, pageHeight - 10)
  }
  
  return new Uint8Array(pdf.output('arraybuffer'))
}
