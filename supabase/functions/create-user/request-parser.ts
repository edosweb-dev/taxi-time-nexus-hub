
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

    // Check if request body is empty
    const contentLength = req.headers.get("content-length");
    if (!contentLength || parseInt(contentLength) === 0) {
      console.error("Edge function: Corpo della richiesta vuoto o mancante");
      return { 
        userData: null, 
        error: 'Corpo della richiesta vuoto o mancante' 
      };
    }
    
    // Clone the request to ensure it can be read
    let rawText: string;
    try {
      // Create a clone to avoid consuming the original request body
      const clonedReq = req.clone();
      rawText = await clonedReq.text();
      console.log("Edge function: Raw request body length:", rawText.length);
      console.log("Edge function: Raw request body preview:", 
        rawText.length > 100 ? `${rawText.substring(0, 100)}...` : rawText);
    } catch (readError) {
      console.error("Edge function: Errore nella lettura del corpo della richiesta:", readError);
      return { 
        userData: null, 
        error: 'Errore nella lettura del corpo della richiesta' 
      };
    }
    
    if (!rawText || rawText.trim() === '') {
      console.error("Edge function: Corpo della richiesta vuoto");
      return { 
        userData: null, 
        error: 'Corpo della richiesta vuoto' 
      };
    }
    
    let userData: UserData;
    try {
      userData = JSON.parse(rawText);
      console.log("Edge function: Successfully parsed JSON:", userData);
    } catch (parseError) {
      console.error("Edge function: Errore nel parsing dei dati JSON:", parseError);
      console.error("Edge function: Testo ricevuto:", rawText);
      return { 
        userData: null, 
        error: 'Dati utente non validi: formato JSON non corretto', 
        details: { raw: rawText.substring(0, 100) + (rawText.length > 100 ? '...' : '') }
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
