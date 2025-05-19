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
    const { aziendaId, referenteId, month, year, serviziIds, createdBy } = await req.json();
    console.log("Request params:", { aziendaId, referenteId, month, year, serviziIdsCount: serviziIds?.length });

    // Validate required params
    if (!aziendaId || !referenteId || !month || !year || !serviziIds || !createdBy) {
      console.error("Missing required parameters");
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
        return exists;
      } catch (error) {
        console.error('Unexpected error checking bucket existence:', error);
        return false;
      }
    };
    
    // Check if bucket exists
    const bucketExists = await checkBucketExists(supabaseClient);
    if (!bucketExists) {
      console.error("Storage bucket 'report_aziende' does not exist");
      return new Response(
        JSON.stringify({ 
          error: "Storage bucket 'report_aziende' does not exist. Please create it from the Supabase dashboard." 
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
      throw new Error(`Error fetching servizi: ${serviziError.message}`);
    }

    if (!servizi || servizi.length === 0) {
      console.error("No consuntivati servizi found with the provided IDs");
      return new Response(
        JSON.stringify({ error: "No consuntivati servizi found with the provided IDs" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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
      throw new Error(`Error fetching azienda: ${aziendaError.message}`);
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
      throw new Error(`Error fetching referente: ${referenteError.message}`);
    }

    // Fetch users for driver names
    console.log("Fetching users");
    const { data: users, error: usersError } = await supabaseClient
      .from("profiles")
      .select("*");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw new Error(`Error fetching users: ${usersError.message}`);
    }

    // Fetch passeggeri counts
    console.log("Fetching passeggeri counts");
    const { data: passeggeri, error: passeggeriError } = await supabaseClient
      .from("passeggeri")
      .select("servizio_id, id")
      .in("servizio_id", serviziIds);

    if (passeggeriError) {
      console.error("Error fetching passeggeri:", passeggeriError);
      throw new Error(`Error fetching passeggeri: ${passeggeriError.message}`);
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
      return new Response(
        JSON.stringify({ 
          error: `Error generating PDF: ${pdfError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate PDF blob
    console.log("Generating PDF blob");
    const pdfBytes = doc.output("arraybuffer");
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });

    // Create file name
    const fileName = `report_${azienda.nome.replace(/\s+/g, "_").toLowerCase()}_${
      new Date(year, month - 1).toLocaleString("it-IT", { month: "long" })
    }_${year}.pdf`.toLowerCase();
    
    const filePath = `${aziendaId}/${year}/${month}/${fileName}`;
    console.log("File path for storage:", filePath);

    // Upload to Supabase Storage with enhanced error handling
    try {
      console.log("Uploading PDF to storage");
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from("report_aziende")
        .upload(filePath, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Error uploading PDF:", uploadError);
        return new Response(
          JSON.stringify({ 
            error: `Error uploading PDF: ${uploadError.message}. Check storage permissions.` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      console.log("PDF uploaded successfully:", uploadData);
    } catch (storageError) {
      console.error("Storage error:", storageError);
      return new Response(
        JSON.stringify({ 
          error: `Storage error: ${storageError.message}. Verify 'report_aziende' bucket exists and has correct permissions.` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
        return new Response(
          JSON.stringify({ 
            error: `Error saving report record: ${reportError.message}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log("Report record created successfully:", reportData);

      // Return success response
      return new Response(
        JSON.stringify({
          success: true,
          reportId: reportData.id,
          fileName,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ 
          error: `Database error: ${dbError.message}` 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

  } catch (error) {
    console.error("Unexpected error in edge function:", error);
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
