
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

    // 6. Calculate totals
    const totaleImponibile = enrichedServizi.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0)
    const totaleIva = totaleImponibile * 0.22
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
  
  const pdf = new jsPDF()
  pdf.setFont('helvetica')
  
  // Header
  pdf.setFontSize(20)
  pdf.text('REPORT SERVIZI', 20, 30)
  
  pdf.setFontSize(14)
  pdf.text(`Azienda: ${azienda.nome}`, 20, 45)
  pdf.text(`Periodo: ${requestData.data_inizio} - ${requestData.data_fine}`, 20, 55)
  
  // Empty message
  pdf.setFontSize(16)
  pdf.text('NESSUN SERVIZIO TROVATO', 20, 90)
  
  pdf.setFontSize(12)
  pdf.text('Non sono stati trovati servizi consuntivati per il periodo selezionato.', 20, 110)
  pdf.text('Verificare:', 20, 130)
  pdf.text('- Che ci siano servizi nel periodo indicato', 25, 145)
  pdf.text('- Che i servizi siano nello stato "Consuntivato"', 25, 160)
  if (requestData.referente_id) {
    pdf.text('- Che i servizi siano assegnati al referente selezionato', 25, 175)
  }
  
  // Footer
  pdf.setFontSize(8)
  pdf.text('Pagina 1 di 1', 170, 290)
  
  return new Uint8Array(pdf.output('arraybuffer'))
}

async function generatePDF(servizi: ServizioData[], azienda: any, requestData: ReportData): Promise<Uint8Array> {
  const { jsPDF } = await import('https://esm.sh/jspdf@2.5.1')
  
  const pdf = new jsPDF()
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
  
  pdf.setFontSize(14)
  pdf.text(`TOTALE DOCUMENTO: €${totaleDocumento.toFixed(2)}`, 20, 110)
  
  // Table header
  let yPosition = 130
  pdf.setFontSize(10)
  pdf.text('Data', 20, yPosition)
  pdf.text('Orario', 50, yPosition)
  pdf.text('Referente', 80, yPosition)
  pdf.text('Da', 120, yPosition)
  pdf.text('A', 150, yPosition)
  pdf.text('Importo', 175, yPosition)
  
  // Add line under header
  pdf.line(20, yPosition + 2, 200, yPosition + 2)
  
  // Service details
  yPosition += 10
  
  servizi.forEach((servizio, index) => {
    if (yPosition > 270) {
      pdf.addPage()
      yPosition = 20
      
      // Repeat header on new page
      pdf.setFontSize(10)
      pdf.text('Data', 20, yPosition)
      pdf.text('Orario', 50, yPosition)
      pdf.text('Referente', 80, yPosition)
      pdf.text('Da', 120, yPosition)
      pdf.text('A', 150, yPosition)
      pdf.text('Importo', 175, yPosition)
      pdf.line(20, yPosition + 2, 200, yPosition + 2)
      yPosition += 10
    }
    
    const dataFormatted = new Date(servizio.data_servizio).toLocaleDateString('it-IT')
    const referenteName = servizio.referente_nome || 'N/A'
    const importo = (servizio.incasso_ricevuto || servizio.incasso_previsto || 0).toFixed(2)
    
    pdf.text(dataFormatted, 20, yPosition)
    pdf.text(servizio.orario_servizio, 50, yPosition)
    pdf.text(referenteName.substring(0, 12), 80, yPosition)
    pdf.text(servizio.indirizzo_presa.substring(0, 15), 120, yPosition)
    pdf.text(servizio.indirizzo_destinazione.substring(0, 15), 150, yPosition)
    pdf.text(`€${importo}`, 175, yPosition)
    
    yPosition += 8
  })
  
  // Footer with totals on last page
  const currentPage = pdf.internal.getCurrentPageInfo().pageNumber
  const pageCount = pdf.internal.getNumberOfPages()
  
  if (currentPage === pageCount && yPosition < 250) {
    yPosition += 20
    pdf.line(120, yPosition, 200, yPosition)
    yPosition += 10
    pdf.setFontSize(12)
    pdf.text(`Totale: €${totaleDocumento.toFixed(2)}`, 150, yPosition)
  }
  
  // Page numbers
  pdf.setFontSize(8)
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.text(`Pagina ${i} di ${pageCount}`, 170, 290)
  }
  
  return new Uint8Array(pdf.output('arraybuffer'))
}
