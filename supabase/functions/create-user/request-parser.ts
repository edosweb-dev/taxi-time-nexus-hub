
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

    // Log dei dettagli della richiesta
    console.log("Edge function: Headers completi:", JSON.stringify(Object.fromEntries(req.headers.entries()), null, 2));
    console.log("Edge function: Method:", req.method);
    console.log("Edge function: Content-Length:", req.headers.get("content-length"));
    
    let userData: UserData;
    try {
      // Tentiamo di estrarre il corpo JSON
      userData = await req.json();
      console.log("Edge function: Successfully parsed JSON:", userData);
    } catch (parseError) {
      console.error("Edge function: Errore nel parsing dei dati JSON:", parseError);
      
      // Proviamo a leggere il corpo grezzo per diagnostica
      try {
        const clonedReq = req.clone();
        const rawText = await clonedReq.text();
        console.error("Edge function: Raw request body:", rawText);
        return { 
          userData: null, 
          error: 'Dati utente non validi: formato JSON non corretto', 
          details: { raw: rawText.substring(0, 200) + (rawText.length > 200 ? '...' : '') }
        };
      } catch (textError) {
        console.error("Edge function: Impossibile leggere il corpo raw:", textError);
      }
      
      return { 
        userData: null, 
        error: 'Dati utente non validi: formato JSON non corretto', 
        details: { error: parseError.message }
      };
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
