
import { validRoles } from "./constants.ts";
import { RequestParseResult, UserData } from "./types.ts";

export async function parseRequestBody(req: Request): Promise<RequestParseResult> {
  try {
    // Check if request headers are valid
    const contentType = req.headers.get("content-type");
    console.log("Edge function: Content-Type header:", contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Edge function: Content-Type non valido o mancante:", contentType);
      return { 
        userData: null, 
        error: 'Content-Type deve essere application/json',
        details: { received: contentType || 'nessuno' }
      };
    }

    // Log dei dettagli della richiesta per debug avanzato
    console.log("Edge function: Headers completi:", JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
    console.log("Edge function: Method:", req.method);
    console.log("Edge function: Content-Length:", req.headers.get("content-length"));
    
    // Verifica esplicita del content-length
    const contentLength = req.headers.get("content-length");
    if (contentLength === "0" || contentLength === null) {
      console.error("Edge function: Corpo della richiesta vuoto (content-length: 0)");
      return {
        userData: null,
        error: 'Corpo della richiesta vuoto',
        details: { content_length: contentLength || 'non specificato' }
      };
    }
    
    let userData: UserData;
    let rawBody: string = '';
    
    try {
      // Prima leggiamo il corpo grezzo per diagnostica
      const clonedReq = req.clone();
      rawBody = await clonedReq.text();
      console.log("Edge function: Raw request body:", rawBody);
      
      if (!rawBody || rawBody.trim() === '') {
        console.error("Edge function: Corpo richiesta vuoto nonostante content-length non zero");
        return {
          userData: null,
          error: 'Corpo richiesta vuoto o corrotto',
          details: { content_length: contentLength, body_length: rawBody.length }
        };
      }
      
      // Ora proviamo a parsare il JSON
      try {
        userData = JSON.parse(rawBody);
        console.log("Edge function: Successfully parsed JSON:", userData);
      } catch (jsonError) {
        console.error("Edge function: JSON parsing failed:", jsonError);
        return {
          userData: null,
          error: 'Formato JSON non valido',
          details: { raw: rawBody.substring(0, 200) + (rawBody.length > 200 ? '...' : '') }
        };
      }
    } catch (bodyError) {
      console.error("Edge function: Errore nella lettura del corpo:", bodyError);
      
      // Tentativo alternativo di lettura con req.json()
      try {
        userData = await req.json();
        console.log("Edge function: Successfully parsed JSON with req.json():", userData);
      } catch (jsonError) {
        console.error("Edge function: Anche req.json() ha fallito:", jsonError);
        return {
          userData: null,
          error: 'Impossibile leggere il corpo della richiesta',
          details: { error: bodyError.message }
        };
      }
    }
    
    // Validate required fields
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.role) {
      console.error("Edge function: Campi obbligatori mancanti:", userData);
      return { 
        userData: null, 
        error: 'Campi obbligatori mancanti',
        details: {
          email: userData.email ? '✓' : '✗',
          first_name: userData.first_name ? '✓' : '✗',
          last_name: userData.last_name ? '✓' : '✗',
          role: userData.role ? '✓' : '✗'
        }
      };
    }
    
    // Validate role
    if (!validRoles.includes(userData.role)) {
      console.error(`Edge function: Ruolo non valido: ${userData.role}`);
      return { 
        userData: null, 
        error: 'Ruolo non valido',
        details: { valid_roles: validRoles.join(', ') }
      };
    }
    
    // Special validation for "cliente" role
    if (userData.role === 'cliente' && !userData.azienda_id) {
      console.error("Edge function: Azienda ID mancante per utente cliente");
      return {
        userData: null,
        error: 'Per gli utenti con ruolo cliente è necessario specificare azienda_id',
        details: { role: userData.role }
      };
    }
    
    console.log("Edge function: Dati utente ricevuti:", userData);
    return { userData, error: null };
  } catch (e) {
    console.error("Edge function: Errore generale nel processare la richiesta:", e);
    return { 
      userData: null, 
      error: 'Errore nella lettura dei dati' 
    };
  }
}
