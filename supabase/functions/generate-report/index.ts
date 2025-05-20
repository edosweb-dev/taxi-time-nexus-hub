
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as PDFLib from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.5.29";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
serve(async (req: Request) => {
  console.log("Edge function called: generate-report");
  
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for CORS");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authorization = req.headers.get("Authorization");
    if (!authorization) {
      console.error("No authorization header provided");
      throw new Error("No authorization header");
    }

    console.log("Authorization header received, initializing Supabase client");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: authorization,
          },
        },
      }
    );

    // Get params from request
    console.log("Parsing request body");
    let body;
    try {
      body = await req.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return createErrorResponse("Errore nella lettura dei parametri di richiesta", 400);
    }
    
    const { aziendaId, referenteId, month, year, serviziIds, createdBy } = body;
    
    console.log("Request params:", { 
      aziendaId, 
      referenteId, 
      month, 
      year, 
      serviziIdsCount: serviziIds?.length,
      createdBy
    });

    // Validazione parametri
    if (!aziendaId || typeof aziendaId !== 'string') {
      return createErrorResponse("aziendaId deve essere una stringa valida", 400);
    }
    
    if (!referenteId || typeof referenteId !== 'string') {
      return createErrorResponse("referenteId deve essere una stringa valida", 400);
    }
    
    if (!month || typeof month !== 'number' || month < 1 || month > 12) {
      return createErrorResponse("month deve essere un numero tra 1 e 12", 400);
    }
    
    if (!year || typeof year !== 'number' || year < 2000 || year > 2100) {
      return createErrorResponse("year deve essere un anno valido", 400);
    }
    
    if (!serviziIds || !Array.isArray(serviziIds) || serviziIds.length === 0) {
      return createErrorResponse("serviziIds deve essere un array non vuoto", 400);
    }
    
    if (!createdBy || typeof createdBy !== 'string') {
      return createErrorResponse("createdBy deve essere una stringa valida", 400);
    }

    // Check if the bucket exists instead of creating it - avoid bucket creation which requires admin rights
    const checkBucketExists = async (supabaseClient) => {
      try {
        console.log("Checking if bucket exists");
        // Check if bucket exists
        const { data: buckets, error: bucketsError } = await supabaseClient.storage.listBuckets();
        
        if (bucketsError) {
          console.error('Error checking buckets:', bucketsError);
          return false;
        }
        
        const exists = buckets.some(bucket => bucket.name === 'report_aziende');
        console.log("Bucket 'report_aziende' exists:", exists);
        
        if (!exists) {
          return false;
        }
        
        // Also check if we can list files (permission check)
        const { error: accessError } = await supabaseClient.storage
          .from('report_aziende')
          .list();
          
        if (accessError) {
          console.error('Error accessing bucket (permissions issue):', accessError);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Unexpected error checking bucket existence:', error);
        return false;
      }
    };
    
    // Check if bucket exists
    const bucketExists = await checkBucketExists(supabaseClient);
    if (!bucketExists) {
      console.error("Storage bucket 'report_aziende' does not exist or permissions issues");
      return new Response(
        JSON.stringify({ 
          error: "Storage bucket 'report_aziende' does not exist or you don't have sufficient permissions." 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch servizi details
    console.log("Fetching servizi details");
    const { data: servizi, error: serviziError } = await supabaseClient
      .from("servizi")
      .select("*")
      .in("id", serviziIds)
      .eq("stato", "consuntivato");

    if (serviziError) {
      console.error("Error fetching servizi:", serviziError);
      return createErrorResponse(`Error fetching servizi: ${serviziError.message}`, 500);
    }

    if (!servizi || servizi.length === 0) {
      console.error("No consuntivati servizi found with the provided IDs");
      return createErrorResponse("Non sono stati trovati servizi consuntivati con gli ID forniti", 400);
    }

    console.log(`Found ${servizi.length} servizi for the report`);
    
    // Fetch azienda details
    console.log("Fetching azienda details");
    const { data: azienda, error: aziendaError } = await supabaseClient
      .from("aziende")
      .select("*")
      .eq("id", aziendaId)
      .single();

    if (aziendaError) {
      console.error("Error fetching azienda:", aziendaError);
      return createErrorResponse(`Error fetching azienda: ${aziendaError.message}`, 500);
    }

    // Fetch referente details
    console.log("Fetching referente details");
    const { data: referente, error: referenteError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", referenteId)
      .single();

    if (referenteError) {
      console.error("Error fetching referente:", referenteError);
      return createErrorResponse(`Error fetching referente: ${referenteError.message}`, 500);
    }

    // Fetch users for driver names
    console.log("Fetching users");
    const { data: users, error: usersError } = await supabaseClient
      .from("profiles")
      .select("*");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return createErrorResponse(`Error fetching users: ${usersError.message}`, 500);
    }

    // Fetch passeggeri counts
    console.log("Fetching passeggeri counts");
    const { data: passeggeri, error: passeggeriError } = await supabaseClient
      .from("passeggeri")
      .select("servizio_id, id")
      .in("servizio_id", serviziIds);

    if (passeggeriError) {
      console.error("Error fetching passeggeri:", passeggeriError);
      return createErrorResponse(`Error fetching passeggeri: ${passeggeriError.message}`, 500);
    }

    // Count passeggeri per servizio
    const passeggeriCounts = passeggeri.reduce((acc, p) => {
      acc[p.servizio_id] = (acc[p.servizio_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Generate PDF with smaller table to avoid width issues
    console.log("Generating PDF");
    const doc = new PDFLib.default({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    try {
      // Helper functions
      const formatCurrency = (value?: number | null): string => {
        if (value === undefined || value === null) return "€ 0,00";
        return new Intl.NumberFormat("it-IT", {
          style: "currency",
          currency: "EUR",
        }).format(value);
      };

      const getUserName = (userId?: string): string => {
        if (!userId) return "";
        const user = users.find((u) => u.id === userId);
        return user ? `${user.first_name || ""} ${user.last_name || ""}` : "";
      };

      // Set metadata
      doc.setProperties({
        title: `Report Servizi - ${azienda.nome} - ${
          new Date(year, month - 1).toLocaleString("it-IT", { month: "long" })
        } ${year}`,
        author: "TaxiTime",
        subject: `Report mensile servizi ${month}/${year}`,
        keywords: "taxitime, report, servizi",
        creator: "TaxiTime Report Generator",
      });

      // Add header
      doc.setFontSize(18);
      doc.text(
        `Report Servizi - ${
          new Date(year, month - 1).toLocaleString("it-IT", { month: "long" })
        } ${year}`,
        doc.internal.pageSize.getWidth() / 2,
        20,
        { align: "center" }
      );

      // Add company info
      doc.setFontSize(12);
      doc.text(`Azienda: ${azienda.nome}`, 14, 30);
      doc.text(
        `Referente: ${referente.first_name || ""} ${referente.last_name || ""}`,
        14,
        36
      );
      doc.text(
        `Data generazione: ${new Date().toLocaleDateString("it-IT")}`,
        14,
        42
      );

      // Create table data - Using shorter column widths to fit better
      const tableData = servizi.map((servizio) => [
        new Date(servizio.data_servizio).toLocaleDateString("it-IT"),
        servizio.orario_servizio.substring(0, 5),
        servizio.indirizzo_presa.substring(0, 20) + (servizio.indirizzo_presa.length > 20 ? "..." : ""),
        servizio.indirizzo_destinazione.substring(0, 20) + (servizio.indirizzo_destinazione.length > 20 ? "..." : ""),
        passeggeriCounts[servizio.id] || 0,
        servizio.conducente_esterno
          ? (servizio.conducente_esterno_nome || "").substring(0, 15) 
          : getUserName(servizio.assegnato_a).substring(0, 15),
        servizio.metodo_pagamento,
        servizio.numero_commessa || "-",
        servizio.ore_finali || "-",
        formatCurrency(servizio.incasso_previsto),
      ]);

      // Add table with adjusted column widths
      autoTable(doc, {
        head: [
          [
            "Data",
            "Ora",
            "Partenza",
            "Destinazione",
            "Pass.",
            "Autista",
            "Pagamento",
            "Commessa",
            "Ore",
            "Importo",
          ],
        ],
        body: tableData,
        startY: 50,
        styles: { fontSize: 9, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 18 }, // Data
          1: { cellWidth: 12 }, // Orario
          2: { cellWidth: 35 }, // Partenza
          3: { cellWidth: 35 }, // Destinazione
          4: { cellWidth: 9 }, // Passeggeri
          5: { cellWidth: 23 }, // Autista
          6: { cellWidth: 18 }, // Pagamento
          7: { cellWidth: 18 }, // Commessa
          8: { cellWidth: 9 }, // Ore
          9: { cellWidth: 18 }, // Importo
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      // Calculate totals
      const totalAmount = servizi.reduce(
        (sum, servizio) => sum + (servizio.incasso_previsto || 0),
        0
      );
      const totalHours = servizi.reduce(
        (sum, servizio) => sum + (servizio.ore_finali || 0),
        0
      );

      // Add summary
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      doc.setFontSize(10);
      doc.text(`Totale servizi: ${servizi.length}`, 14, finalY + 10);
      doc.text(`Totale ore: ${totalHours.toFixed(1)}`, 14, finalY + 16);
      doc.text(`Totale: ${formatCurrency(totalAmount)}`, 14, finalY + 22);

      // Add footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `TaxiTime - Report generato il ${new Date().toLocaleDateString(
          "it-IT"
        )} ${new Date().toLocaleTimeString("it-IT")}`,
        doc.internal.pageSize.getWidth() / 2,
        pageHeight - 10,
        { align: "center" }
      );
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError);
      return createErrorResponse(`Error generating PDF: ${pdfError.message}`, 500);
    }

    // Genera un nome file sicuro e consistente
    const fileName = generateSafeFileName(azienda.nome, month, year);
    
    // Create file path seguendo il pattern ${aziendaId}/${year}/${month}/${fileName}
    const filePath = `${aziendaId}/${year}/${month}/${fileName}`;
    console.log("File path for storage:", filePath);

    // Generate PDF blob
    console.log("Generating PDF blob");
    const pdfBytes = doc.output("arraybuffer");
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    // Upload to Supabase Storage with enhanced error handling
    try {
      console.log("Uploading PDF to storage with path:", filePath);
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from("report_aziende")
        .upload(filePath, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading PDF:", uploadError);
        return createErrorResponse(
          `Error uploading PDF: ${uploadError.message}. Check storage permissions.`,
          500
        );
      }
      
      console.log("PDF uploaded successfully:", uploadData);
    } catch (storageError) {
      console.error("Storage error:", storageError);
      return createErrorResponse(
        `Storage error: ${storageError.message}. Verify 'report_aziende' bucket exists and has correct permissions.`,
        500
      );
    }

    // Create report record in database
    try {
      console.log("Creating report record in database");
      const { data: reportData, error: reportError } = await supabaseClient
        .from("reports")
        .insert([
          {
            azienda_id: aziendaId,
            referente_id: referenteId,
            month,
            year,
            created_by: createdBy,
            file_path: filePath,
            file_name: fileName,
            servizi_ids: serviziIds,
          },
        ])
        .select()
        .single();

      if (reportError) {
        console.error("Error saving report record:", reportError);
        return createErrorResponse(
          `Error saving report record: ${reportError.message}`,
          500
        );
      }

      console.log("Report record created successfully:", reportData);

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          reportId: reportData.id,
          fileName,
          filePath,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return createErrorResponse(
        `Database error: ${dbError.message}`,
        500
      );
    }
  } catch (error) {
    console.error("Unexpected error in edge function:", error);
    // Return error response
    return createErrorResponse(
      `Unexpected error: ${error.message || 'Unknown error'}`,
      500
    );
  }
});

// Helper function to generate a safe and consistent file name
function generateSafeFileName(aziendaNome: string, month: number, year: number): string {
  // Sanitizza il nome azienda (rimuove caratteri speciali e spazi)
  const safeName = aziendaNome.replace(/\s+/g, "_").replace(/[^\w-]/g, "").toLowerCase();
  
  // Ottieni il nome del mese in italiano
  const monthName = new Date(year, month - 1).toLocaleString("it-IT", { month: "long" });
  
  // Restituisci un nome file consistente
  return `report_${safeName}_${monthName}_${year}.pdf`.toLowerCase();
}

// Helper function to create error responses with consistent format
function createErrorResponse(message: string, status: number = 500): Response {
  console.error(`Error response (${status}):`, message);
  return new Response(
    JSON.stringify({ 
      error: message, 
      success: false 
    }),
    {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
}
