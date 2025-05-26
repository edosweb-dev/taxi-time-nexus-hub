
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
  iva?: number
  note?: string
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
        numero_commessa, ore_effettive, firma_url, incasso_previsto, iva, note,
        veicoli(targa, modello),
        servizi_passeggeri(passeggeri(nome_cognome))
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
    const pdfContent = await generatePDF(servizi as ServizioData[], azienda, requestData)

    // Upload PDF to storage
    const fileName = `report_${requestData.azienda_id}_${requestData.data_inizio}_${requestData.data_fine}.pdf`
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('report_aziende')
      .upload(fileName, pdfContent, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Errore upload PDF: ${uploadError.message}`)
    }

    console.log('PDF uploaded successfully:', uploadData.path)

    // Calculate totals
    const totaleImponibile = servizi.reduce((sum, s) => sum + (s.incasso_previsto || 0), 0)
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
  // Simple PDF generation using basic structure
  // In a real implementation, you'd use jsPDF or similar
  const pdfContent = `
    REPORT SERVIZI - ${azienda.nome}
    Periodo: ${requestData.data_inizio} - ${requestData.data_fine}
    
    ${servizi.map(servizio => `
    ID: ${servizio.id}
    Data: ${servizio.data_servizio} ${servizio.orario_servizio}
    Passeggeri: ${servizio.passeggeri?.map(p => p.nome_cognome).join(', ') || 'N/A'}
    Da: ${servizio.indirizzo_presa}
    A: ${servizio.indirizzo_destinazione}
    Commessa: ${servizio.numero_commessa || 'N/A'}
    Ore extra: ${servizio.ore_effettive || 0}
    Veicolo: ${servizio.veicolo?.targa} ${servizio.veicolo?.modello || ''}
    Note: ${servizio.note || 'N/A'}
    ${azienda.firma_digitale_attiva && servizio.firma_url ? 'Firma: Presente' : ''}
    ---
    `).join('\n')}
    
    TOTALI:
    Netto: €${servizi.reduce((sum, s) => sum + (s.incasso_previsto || 0), 0).toFixed(2)}
    IVA: €${(servizi.reduce((sum, s) => sum + (s.incasso_previsto || 0), 0) * 0.22).toFixed(2)}
    Totale: €${(servizi.reduce((sum, s) => sum + (s.incasso_previsto || 0), 0) * 1.22).toFixed(2)}
  `

  // Convert to Uint8Array (simple text to bytes conversion)
  return new TextEncoder().encode(pdfContent)
}
